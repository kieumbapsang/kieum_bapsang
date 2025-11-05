"""
ROI(Region of Interest) 처리 모듈
영양성분표 영역을 자동으로 감지하고 추출하여 OCR 인식률을 향상시키는 기능
"""

import cv2
import numpy as np
from PIL import Image
import base64
import io
from typing import Tuple, List, Optional, Dict
import re
from pattern_learner import PatternLearner


class ROIProcessor:
    """영양성분표 영역 감지 및 추출을 위한 ROI 처리 클래스"""
    
    def __init__(self):
        """ROI 프로세서 초기화"""
        print("ROI 프로세서를 초기화하는 중...")
        
        # 영양성분표 관련 키워드 (한국어/영어)
        self.nutrition_keywords = [
            '영양성분', '영양정보', 'nutrition', 'nutrition facts',
            '칼로리', 'calories', 'kcal', '에너지', 'energy',
            '단백질', 'protein', '탄수화물', 'carbohydrate', 'carb',
            '지방', 'fat', '나트륨', 'sodium', '당류', 'sugar',
            '포화지방', 'saturated', '트랜스지방', 'trans',
            '콜레스테롤', 'cholesterol', '식이섬유', 'fiber'
        ]
        
        # 패턴 학습기 초기화
        try:
            self.pattern_learner = PatternLearner()
            self.use_pattern_matching = True
            print("패턴 학습기 로드 완료")
        except Exception as e:
            print(f"패턴 학습기 로드 실패: {str(e)}")
            self.pattern_learner = None
            self.use_pattern_matching = False
        
        print("ROI 프로세서 초기화 완료!")
    
    def detect_nutrition_table_region(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """
        이미지에서 영양성분표 영역을 감지
        
        Args:
            image: OpenCV 이미지 배열
            
        Returns:
            Tuple[int, int, int, int]: (x, y, width, height) 또는 None
        """
        try:
            # 이미지 전처리
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 노이즈 제거
            denoised = cv2.medianBlur(gray, 3)
            
            # 엣지 검출
            edges = cv2.Canny(denoised, 50, 150, apertureSize=3)
            
            # 모폴로지 연산으로 선 연결
            kernel = np.ones((3, 3), np.uint8)
            edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
            
            # 윤곽선 찾기
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # 영양성분표 후보 영역들
            candidates = []
            
            for contour in contours:
                # 윤곽선 면적 계산
                area = cv2.contourArea(contour)
                if area < 1000:  # 너무 작은 영역 제외
                    continue
                
                # 바운딩 박스 계산
                x, y, w, h = cv2.boundingRect(contour)
                
                # 가로세로 비율 확인 (영양성분표는 보통 세로가 긴 직사각형)
                aspect_ratio = w / h
                if aspect_ratio < 0.3 or aspect_ratio > 3.0:  # 너무 극단적인 비율 제외
                    continue
                
                # 영역 크기 확인 (이미지의 최소 5% 이상)
                img_area = image.shape[0] * image.shape[1]
                if area < img_area * 0.05:
                    continue
                
                candidates.append({
                    'bbox': (x, y, w, h),
                    'area': area,
                    'aspect_ratio': aspect_ratio
                })
            
            if not candidates:
                return None
            
            # 가장 큰 영역을 선택 (영양성분표는 보통 큰 영역)
            best_candidate = max(candidates, key=lambda x: x['area'])
            return best_candidate['bbox']
            
        except Exception as e:
            print(f"영양성분표 영역 감지 실패: {str(e)}")
            return None
    
    def extract_roi_from_image(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        이미지에서 ROI 영역 추출
        
        Args:
            image: 원본 이미지
            bbox: (x, y, width, height) 바운딩 박스
            
        Returns:
            np.ndarray: 추출된 ROI 이미지
        """
        x, y, w, h = bbox
        
        # 경계 확인 및 조정
        x = max(0, x)
        y = max(0, y)
        w = min(w, image.shape[1] - x)
        h = min(h, image.shape[0] - y)
        
        # ROI 추출
        roi = image[y:y+h, x:x+w]
        
        return roi
    
    def preprocess_roi(self, roi_image: np.ndarray) -> np.ndarray:
        """
        ROI 이미지 전처리 (OCR 인식률 향상)
        
        Args:
            roi_image: ROI 이미지
            
        Returns:
            np.ndarray: 전처리된 이미지
        """
        try:
            # 그레이스케일 변환
            if len(roi_image.shape) == 3:
                gray = cv2.cvtColor(roi_image, cv2.COLOR_BGR2GRAY)
            else:
                gray = roi_image.copy()
            
            # 노이즈 제거
            denoised = cv2.medianBlur(gray, 3)
            
            # 대비 향상 (CLAHE 적용)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
            
            # 이진화 (적응적 임계값)
            binary = cv2.adaptiveThreshold(
                enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # 모폴로지 연산으로 텍스트 연결
            kernel = np.ones((2, 2), np.uint8)
            processed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            
            return processed
            
        except Exception as e:
            print(f"ROI 전처리 실패: {str(e)}")
            return roi_image
    
    def detect_text_regions_in_roi(self, roi_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        ROI 내에서 텍스트 영역들을 감지
        
        Args:
            roi_image: ROI 이미지
            
        Returns:
            List[Tuple[int, int, int, int]]: 텍스트 영역들의 바운딩 박스 리스트
        """
        try:
            # 그레이스케일 변환
            if len(roi_image.shape) == 3:
                gray = cv2.cvtColor(roi_image, cv2.COLOR_BGR2GRAY)
            else:
                gray = roi_image.copy()
            
            # 텍스트 영역 감지를 위한 전처리
            # 가우시안 블러로 노이즈 제거
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # 적응적 임계값으로 이진화
            binary = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # 텍스트 연결을 위한 모폴로지 연산
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            dilated = cv2.dilate(binary, kernel, iterations=2)
            
            # 연결된 컴포넌트 찾기
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            text_regions = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 100:  # 최소 면적 필터링
                    x, y, w, h = cv2.boundingRect(contour)
                    text_regions.append((x, y, w, h))
            
            return text_regions
            
        except Exception as e:
            print(f"텍스트 영역 감지 실패: {str(e)}")
            return []
    
    def process_image_with_roi(self, image_data: str) -> Dict:
        """
        이미지에서 ROI를 추출하고 전처리하여 OCR에 최적화된 이미지 반환
        패턴 학습을 통한 템플릿 매칭 적용
        
        Args:
            image_data: base64 인코딩된 이미지 데이터
            
        Returns:
            Dict: 처리 결과
        """
        try:
            # base64 데이터를 이미지로 변환
            if image_data.startswith('data:'):
                image_base64 = image_data.split(',')[1]
            else:
                image_base64 = image_data
            
            # base64를 OpenCV 이미지로 변환
            image_bytes = base64.b64decode(image_base64)
            pil_image = Image.open(io.BytesIO(image_bytes))
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # 패턴 매칭 시도
            matched_template = None
            parsing_strategy = None
            
            if self.use_pattern_matching and self.pattern_learner:
                try:
                    # 그레이스케일 변환
                    gray_image = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
                    
                    # 템플릿 매칭
                    matched_template = self.pattern_learner.match_template(gray_image)
                    
                    if matched_template:
                        # 파싱 전략 생성
                        parsing_strategy = self.pattern_learner.get_parsing_strategy(matched_template)
                        print(f"매칭된 템플릿: {matched_template['template_name']}")
                        print(f"파싱 전략: {parsing_strategy.get('format_type', 'unknown')} - {parsing_strategy.get('layout_type', 'unknown')}")
                except Exception as e:
                    print(f"패턴 매칭 오류 (무시하고 계속): {str(e)}")
            
            # 영양성분표 영역 감지
            bbox = self.detect_nutrition_table_region(opencv_image)
            
            if bbox is None:
                print("영양성분표 영역을 찾을 수 없습니다. 전체 이미지를 사용합니다.")
                # 전체 이미지 사용
                processed_image = self.preprocess_roi(opencv_image)
                roi_bbox = (0, 0, opencv_image.shape[1], opencv_image.shape[0])
            else:
                print(f"영양성분표 영역 감지: {bbox}")
                # ROI 추출
                roi_image = self.extract_roi_from_image(opencv_image, bbox)
                # ROI 전처리
                processed_image = self.preprocess_roi(roi_image)
                roi_bbox = bbox
            
            # 전처리된 이미지를 base64로 변환
            _, buffer = cv2.imencode('.jpg', processed_image)
            processed_base64 = base64.b64encode(buffer).decode('utf-8')
            
            result = {
                'success': True,
                'processed_image': processed_base64,
                'roi_bbox': roi_bbox,
                'original_size': (opencv_image.shape[1], opencv_image.shape[0]),
                'processed_size': (processed_image.shape[1], processed_image.shape[0])
            }
            
            # 패턴 매칭 결과 추가
            if matched_template:
                result['matched_template'] = matched_template
            if parsing_strategy:
                result['parsing_strategy'] = parsing_strategy
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'ROI 처리 실패: {str(e)}',
                'processed_image': None,
                'roi_bbox': None
            }
    
    def enhance_nutrition_text_recognition(self, text: str) -> str:
        """
        영양성분 텍스트 인식률 향상을 위한 후처리
        
        Args:
            text: OCR로 추출된 텍스트
            
        Returns:
            str: 후처리된 텍스트
        """
        try:
            # 일반적인 OCR 오류 수정
            corrections = {
                'O': '0',  # 영문 O를 숫자 0으로
                'l': '1',  # 영문 l을 숫자 1로
                'I': '1',  # 영문 I를 숫자 1로
                'S': '5',  # 영문 S를 숫자 5로 (특정 컨텍스트에서)
            }
            
            # 숫자 패턴 개선
            enhanced_text = text
            
            # 영양성분 키워드 주변의 숫자 패턴 개선
            for keyword in self.nutrition_keywords:
                pattern = f'{keyword}[\\s]*[\\d\\.]+'
                matches = re.finditer(pattern, enhanced_text, re.IGNORECASE)
                
                for match in matches:
                    original = match.group()
                    # 숫자 부분만 추출하고 정리
                    numbers = re.findall(r'[\d\.]+', original)
                    if numbers:
                        # 가장 큰 숫자를 선택 (영양성분 값)
                        max_number = max(numbers, key=lambda x: float(x) if '.' in x else int(x))
                        enhanced_text = enhanced_text.replace(original, f'{keyword} {max_number}')
            
            return enhanced_text
            
        except Exception as e:
            print(f"텍스트 후처리 실패: {str(e)}")
            return text


