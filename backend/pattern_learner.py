"""
표준 영양성분 표시 서식 패턴 학습 모듈
19개의 표준 서식 이미지를 학습하여 OCR 인식도 향상
"""

import cv2
import numpy as np
import os
import json
from typing import Dict, List, Tuple, Optional
from pathlib import Path
import re


class PatternLearner:
    """표준 영양성분 표시 서식 패턴 학습 클래스"""
    
    def __init__(self, template_dir: str = "data/영양성분 표시서식도"):
        """
        패턴 학습기 초기화
        
        Args:
            template_dir: 표준 서식 이미지 디렉토리 경로
        """
        self.template_dir = template_dir
        self.templates = {}  # {template_name: template_data}
        self.patterns = {}  # {template_name: pattern_info}
        self.loaded = False
        
        print("패턴 학습기를 초기화하는 중...")
        self.load_templates()
        print("패턴 학습기 초기화 완료!")
    
    def load_templates(self):
        """표준 서식 이미지들을 로드하고 패턴 추출"""
        try:
            template_path = Path(self.template_dir)
            if not template_path.exists():
                print(f"템플릿 디렉토리를 찾을 수 없습니다: {self.template_dir}")
                return
            
            # 모든 jpg 파일 로드
            image_files = list(template_path.glob("*.jpg"))
            
            if not image_files:
                print(f"템플릿 이미지를 찾을 수 없습니다: {self.template_dir}")
                return
            
            print(f"{len(image_files)}개의 표준 서식 이미지를 로드하는 중...")
            
            for img_file in image_files:
                template_name = img_file.stem  # 파일명에서 확장자 제거
                try:
                    # 이미지 로드
                    image = cv2.imread(str(img_file))
                    if image is None:
                        print(f"이미지 로드 실패: {img_file}")
                        continue
                    
                    # 그레이스케일 변환
                    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                    
                    # 템플릿 저장
                    self.templates[template_name] = {
                        'image': gray,
                        'original': image,
                        'shape': gray.shape,
                        'file_path': str(img_file)
                    }
                    
                    # 패턴 추출
                    pattern_info = self.extract_pattern(gray, template_name)
                    self.patterns[template_name] = pattern_info
                    
                    print(f"{template_name} 로드 완료")
                    
                except Exception as e:
                    print(f"템플릿 로드 오류 ({img_file}): {str(e)}")
                    continue
            
            self.loaded = True
            print(f"총 {len(self.templates)}개의 표준 서식 패턴을 로드했습니다!")
            
        except Exception as e:
            print(f"템플릿 로드 실패: {str(e)}")
    
    def extract_pattern(self, template_image: np.ndarray, template_name: str) -> Dict:
        """
        템플릿 이미지에서 레이아웃 패턴 추출
        
        Args:
            template_image: 템플릿 이미지 (그레이스케일)
            template_name: 템플릿 이름
            
        Returns:
            Dict: 패턴 정보
        """
        try:
            h, w = template_image.shape
            
            # 1. 구조적 특징 추출
            # - 세로형/가로형 구분
            aspect_ratio = w / h
            orientation = 'vertical' if aspect_ratio < 0.7 else 'horizontal' if aspect_ratio > 1.5 else 'square'
            
            # 2. 텍스트 영역 감지
            text_regions = self.detect_text_regions(template_image)
            
            # 3. 레이아웃 구조 분석
            layout_structure = self.analyze_layout_structure(template_image, text_regions)
            
            # 4. 영양소 라벨 위치 추정
            nutrition_labels = self.detect_nutrition_labels(template_image)
            
            pattern_info = {
                'name': template_name,
                'shape': (h, w),
                'aspect_ratio': aspect_ratio,
                'orientation': orientation,
                'text_regions': text_regions,
                'layout_structure': layout_structure,
                'nutrition_labels': nutrition_labels,
                'features': self.extract_features(template_image)
            }
            
            return pattern_info
            
        except Exception as e:
            print(f"패턴 추출 오류 ({template_name}): {str(e)}")
            return {}
    
    def detect_text_regions(self, image: np.ndarray) -> List[Dict]:
        """텍스트 영역 감지"""
        try:
            # 이진화
            _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            binary = cv2.bitwise_not(binary)
            
            # 모폴로지 연산으로 텍스트 연결
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            dilated = cv2.dilate(binary, kernel, iterations=2)
            
            # 윤곽선 찾기
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            text_regions = []
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 100:  # 최소 면적
                    x, y, w, h = cv2.boundingRect(contour)
                    text_regions.append({
                        'bbox': (x, y, w, h),
                        'area': area,
                        'center': (x + w // 2, y + h // 2)
                    })
            
            return text_regions
            
        except Exception as e:
            print(f"텍스트 영역 감지 오류: {str(e)}")
            return []
    
    def analyze_layout_structure(self, image: np.ndarray, text_regions: List[Dict]) -> Dict:
        """레이아웃 구조 분석"""
        try:
            h, w = image.shape
            
            # 텍스트 영역들을 Y 좌표로 정렬 (세로 방향 분석)
            sorted_by_y = sorted(text_regions, key=lambda r: r['center'][1])
            
            # 텍스트 영역들을 X 좌표로 정렬 (가로 방향 분석)
            sorted_by_x = sorted(text_regions, key=lambda r: r['center'][0])
            
            # 레이아웃 구조 추정
            structure = {
                'is_table': len(text_regions) > 5,  # 테이블 형태인지
                'has_header': False,  # 헤더가 있는지
                'column_count': self.estimate_column_count(sorted_by_x),
                'row_count': self.estimate_row_count(sorted_by_y),
                'alignment': self.estimate_alignment(text_regions)
            }
            
            return structure
            
        except Exception as e:
            print(f"레이아웃 구조 분석 오류: {str(e)}")
            return {}
    
    def estimate_column_count(self, sorted_regions: List[Dict]) -> int:
        """열 개수 추정"""
        if not sorted_regions:
            return 0
        
        # X 좌표의 그룹화를 통한 열 개수 추정
        x_coords = [r['center'][0] for r in sorted_regions]
        if not x_coords:
            return 0
        
        # 간격 분석으로 열 개수 추정
        x_coords_sorted = sorted(set(x_coords))
        if len(x_coords_sorted) < 2:
            return 1
        
        # 큰 간격을 기준으로 열 분리
        gaps = [x_coords_sorted[i+1] - x_coords_sorted[i] for i in range(len(x_coords_sorted)-1)]
        avg_gap = np.mean(gaps)
        threshold = avg_gap * 0.5
        
        columns = 1
        for gap in gaps:
            if gap > threshold:
                columns += 1
        
        return min(columns, 5)  # 최대 5열
    
    def estimate_row_count(self, sorted_regions: List[Dict]) -> int:
        """행 개수 추정"""
        if not sorted_regions:
            return 0
        
        # Y 좌표의 그룹화를 통한 행 개수 추정
        y_coords = [r['center'][1] for r in sorted_regions]
        if not y_coords:
            return 0
        
        y_coords_sorted = sorted(set(y_coords))
        if len(y_coords_sorted) < 2:
            return len(sorted_regions)
        
        # 간격 분석으로 행 개수 추정
        gaps = [y_coords_sorted[i+1] - y_coords_sorted[i] for i in range(len(y_coords_sorted)-1)]
        avg_gap = np.mean(gaps) if gaps else 0
        threshold = avg_gap * 0.5
        
        rows = 1
        for gap in gaps:
            if gap > threshold:
                rows += 1
        
        return rows
    
    def estimate_alignment(self, text_regions: List[Dict]) -> str:
        """정렬 방식 추정 (left, center, right)"""
        if not text_regions:
            return 'unknown'
        
        # X 좌표의 분포를 분석
        x_coords = [r['center'][0] for r in text_regions]
        x_mean = np.mean(x_coords)
        x_std = np.std(x_coords)
        
        # 표준편차가 작으면 정렬된 것으로 판단
        if x_std < x_mean * 0.2:
            return 'aligned'
        else:
            return 'scattered'
    
    def detect_nutrition_labels(self, image: np.ndarray) -> List[Dict]:
        """영양소 라벨 위치 감지"""
        # 이 메서드는 실제 OCR이나 템플릿 매칭을 통해 라벨 위치를 찾을 수 있음
        # 현재는 기본 구조만 반환
        nutrition_keywords = [
            '칼로리', '에너지', '단백질', '탄수화물', '지방',
            '나트륨', '당류', '당', '콜레스테롤', '포화지방', '트랜스지방'
        ]
        
        # 실제로는 OCR을 통해 라벨 위치를 찾아야 함
        # 여기서는 구조 정보만 반환
        return []
    
    def extract_features(self, image: np.ndarray) -> Dict:
        """이미지 특징 추출"""
        try:
            h, w = image.shape
            
            # 히스토그램 특징
            hist = cv2.calcHist([image], [0], None, [256], [0, 256])
            hist_features = {
                'mean': float(np.mean(image)),
                'std': float(np.std(image)),
                'entropy': float(-np.sum(hist * np.log(hist + 1e-10)) / (h * w))
            }
            
            # 엣지 특징
            edges = cv2.Canny(image, 50, 150)
            edge_density = float(np.sum(edges > 0) / (h * w))
            
            features = {
                'histogram': hist_features,
                'edge_density': edge_density,
                'texture': self.extract_texture_features(image)
            }
            
            return features
            
        except Exception as e:
            print(f"특징 추출 오류: {str(e)}")
            return {}
    
    def extract_texture_features(self, image: np.ndarray) -> Dict:
        """텍스처 특징 추출"""
        try:
            # GLCM (Gray-Level Co-occurrence Matrix) 기반 특징
            # 간단한 통계 특징으로 대체
            h, w = image.shape
            
            # 가로/세로 방향 변화율
            horizontal_diff = np.abs(np.diff(image, axis=1))
            vertical_diff = np.abs(np.diff(image, axis=0))
            
            texture_features = {
                'horizontal_variance': float(np.var(horizontal_diff)),
                'vertical_variance': float(np.var(vertical_diff)),
                'contrast': float(np.std(image))
            }
            
            return texture_features
            
        except Exception as e:
            return {}
    
    def match_template(self, input_image: np.ndarray) -> Optional[Dict]:
        """
        입력 이미지와 가장 유사한 표준 서식 매칭
        
        Args:
            input_image: 입력 이미지 (그레이스케일)
            
        Returns:
            Dict: 매칭된 템플릿 정보 또는 None
        """
        if not self.loaded or not self.templates:
            return None
        
        try:
            best_match = None
            best_score = 0.0
            
            input_h, input_w = input_image.shape
            input_aspect = input_w / input_h
            
            for template_name, template_data in self.templates.items():
                template_img = template_data['image']
                template_h, template_w = template_img.shape
                template_aspect = template_w / template_h
                
                # 1. 종횡비 유사도 체크
                aspect_similarity = 1.0 - abs(input_aspect - template_aspect) / max(input_aspect, template_aspect)
                
                # 2. 템플릿 매칭
                template_match_score = self.template_matching(input_image, template_img)
                
                # 3. 구조적 유사도
                structure_similarity = self.compare_structure_similarity(input_image, template_name)
                
                # 종합 점수 (가중 평균)
                total_score = (
                    aspect_similarity * 0.2 +
                    template_match_score * 0.5 +
                    structure_similarity * 0.3
                )
                
                if total_score > best_score:
                    best_score = total_score
                    best_match = {
                        'template_name': template_name,
                        'score': total_score,
                        'aspect_similarity': aspect_similarity,
                        'template_match_score': template_match_score,
                        'structure_similarity': structure_similarity,
                        'pattern_info': self.patterns.get(template_name, {})
                    }
            
            if best_match and best_match['score'] > 0.3:  # 최소 임계값
                print(f"매칭된 템플릿: {best_match['template_name']} (점수: {best_match['score']:.2f})")
                return best_match
            else:
                print("유사한 템플릿을 찾을 수 없습니다.")
                return None
                
        except Exception as e:
            print(f"템플릿 매칭 실패: {str(e)}")
            return None
    
    def template_matching(self, input_image: np.ndarray, template_image: np.ndarray) -> float:
        """템플릿 매칭 점수 계산"""
        try:
            # 입력 이미지 크기 조정 (템플릿과 비슷한 크기로)
            template_h, template_w = template_image.shape
            input_h, input_w = input_image.shape
            
            # 비율 유지하며 리사이즈
            scale = min(template_w / input_w, template_h / input_h)
            if scale < 1.0:
                new_w = int(input_w * scale)
                new_h = int(input_h * scale)
                resized_input = cv2.resize(input_image, (new_w, new_h))
            else:
                resized_input = input_image
            
            # 템플릿 매칭
            if resized_input.shape[0] >= template_h and resized_input.shape[1] >= template_w:
                result = cv2.matchTemplate(resized_input, template_image, cv2.TM_CCOEFF_NORMED)
                max_score = float(np.max(result))
                return max_score
            else:
                # 크기가 부족하면 특징 기반 비교
                return self.feature_based_matching(resized_input, template_image)
                
        except Exception as e:
            print(f"템플릿 매칭 오류: {str(e)}")
            return 0.0
    
    def feature_based_matching(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """특징 기반 매칭"""
        try:
            # 이미지 크기 정규화
            h1, w1 = img1.shape
            h2, w2 = img2.shape
            
            # 작은 크기로 리사이즈
            target_size = (min(w1, w2), min(h1, h2))
            resized1 = cv2.resize(img1, target_size)
            resized2 = cv2.resize(img2, target_size)
            
            # 히스토그램 비교
            hist1 = cv2.calcHist([resized1], [0], None, [256], [0, 256])
            hist2 = cv2.calcHist([resized2], [0], None, [256], [0, 256])
            hist_corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
            
            # 구조적 유사도 (간단한 픽셀 차이)
            diff = cv2.absdiff(resized1, resized2)
            similarity = 1.0 - (np.mean(diff) / 255.0)
            
            # 종합 점수
            score = (hist_corr * 0.5 + similarity * 0.5)
            return float(score)
            
        except Exception as e:
            return 0.0
    
    def compare_structure_similarity(self, input_image: np.ndarray, template_name: str) -> float:
        """구조적 유사도 비교"""
        try:
            pattern_info = self.patterns.get(template_name, {})
            if not pattern_info:
                return 0.0
            
            # 입력 이미지의 구조 분석
            input_regions = self.detect_text_regions(input_image)
            input_structure = self.analyze_layout_structure(input_image, input_regions)
            
            template_structure = pattern_info.get('layout_structure', {})
            
            # 구조 유사도 계산
            similarity = 0.0
            
            # 테이블 여부 일치
            if input_structure.get('is_table') == template_structure.get('is_table'):
                similarity += 0.3
            
            # 방향 일치
            input_h, input_w = input_image.shape
            input_orientation = 'vertical' if (input_w / input_h) < 0.7 else 'horizontal' if (input_w / input_h) > 1.5 else 'square'
            if input_orientation == pattern_info.get('orientation'):
                similarity += 0.4
            
            # 텍스트 영역 개수 유사도
            input_region_count = len(input_regions)
            template_region_count = len(pattern_info.get('text_regions', []))
            if template_region_count > 0:
                region_similarity = 1.0 - abs(input_region_count - template_region_count) / max(input_region_count, template_region_count)
                similarity += region_similarity * 0.3
            
            return min(similarity, 1.0)
            
        except Exception as e:
            return 0.0
    
    def get_parsing_strategy(self, matched_template: Dict) -> Dict:
        """
        매칭된 템플릿에 따른 파싱 전략 반환
        
        Args:
            matched_template: 매칭된 템플릿 정보
            
        Returns:
            Dict: 파싱 전략
        """
        if not matched_template:
            return {}
        
        template_name = matched_template.get('template_name', '')
        pattern_info = matched_template.get('pattern_info', {})
        
        # 템플릿 이름에서 형식 추출
        parsing_strategy = {
            'format_type': 'unknown',
            'layout_type': 'unknown',
            'unit_type': 'unknown',
            'parsing_rules': []
        }
        
        # 형식 추출
        if '기본형' in template_name:
            parsing_strategy['format_type'] = 'basic'
        elif '가로형' in template_name:
            parsing_strategy['format_type'] = 'horizontal'
            parsing_strategy['layout_type'] = 'horizontal'
        elif '세로형' in template_name:
            parsing_strategy['format_type'] = 'vertical'
            parsing_strategy['layout_type'] = 'vertical'
        elif '그래픽형' in template_name:
            parsing_strategy['format_type'] = 'graphic'
        elif '텍스트형' in template_name:
            parsing_strategy['format_type'] = 'text'
        elif '병행표기' in template_name:
            parsing_strategy['format_type'] = 'parallel'
        
        # 단위 추출
        if '100g당' in template_name:
            parsing_strategy['unit_type'] = 'per_100g'
        elif '단위내용량당' in template_name:
            parsing_strategy['unit_type'] = 'per_serving'
        elif '총내용량당' in template_name:
            parsing_strategy['unit_type'] = 'per_total'
        elif '100ml병행' in template_name:
            parsing_strategy['unit_type'] = 'per_100ml_parallel'
        
        # 파싱 규칙 추가
        parsing_strategy['parsing_rules'] = self.generate_parsing_rules(parsing_strategy, pattern_info)
        
        return parsing_strategy
    
    def generate_parsing_rules(self, strategy: Dict, pattern_info: Dict) -> List[Dict]:
        """파싱 규칙 생성"""
        rules = []
        
        # 레이아웃에 따른 파싱 규칙
        if strategy['layout_type'] == 'horizontal':
            rules.append({
                'type': 'horizontal_table',
                'description': '가로형 테이블 파싱',
                'column_order': ['label', 'value', 'percentage']
            })
        elif strategy['layout_type'] == 'vertical':
            rules.append({
                'type': 'vertical_table',
                'description': '세로형 테이블 파싱',
                'row_order': ['label', 'value', 'percentage']
            })
        
        # 형식에 따른 파싱 규칙
        if strategy['format_type'] == 'graphic':
            rules.append({
                'type': 'graphic_parsing',
                'description': '그래픽 요소 고려한 파싱'
            })
        
        return rules

