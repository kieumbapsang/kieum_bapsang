"""
네이버 클로바 OCR API 엔진 모듈
클로바 OCR API를 사용한 고성능 OCR 처리 및 영양성분 추출
"""

import requests
import base64
import re
import os
from roi_processor import ROIProcessor

class ClovaOCREngine:
    def __init__(self, api_url, secret_key):
        """
        네이버 클로바 OCR API 엔진 초기화
        
        Args:
            api_url (str): 클로바 OCR API URL
            secret_key (str): 클로바 OCR API Secret Key
        """
        print("🌐 네이버 클로바 OCR API 엔진을 초기화하는 중...")
        
        self.api_url = api_url
        self.secret_key = secret_key
        self.headers = {
            'X-OCR-SECRET': secret_key,
            'Content-Type': 'application/json'
        }
        
        # ROI 프로세서 초기화
        self.roi_processor = ROIProcessor()
        
        print(f"✅ 클로바 OCR 엔진 초기화 완료! (API URL: {api_url})")
        
    # OCR 텍스트 추출 (ROI 처리 포함)
    def extract_text(self, image_data, use_roi=True):
        """
        이미지에서 텍스트 추출 (ROI 처리로 인식률 향상)
        
        Args:
            image_data: base64 인코딩된 이미지 데이터 또는 이미지 파일 경로
            use_roi: ROI 처리 사용 여부 (기본값: True)
            
        Returns:
            dict: OCR 처리 결과
        """
        try:
            # 이미지 데이터 처리
            if isinstance(image_data, str):
                if image_data.startswith('data:'):
                    # base64 데이터인 경우
                    image_base64 = image_data.split(',')[1]
                elif os.path.exists(image_data):
                    # 파일 경로인 경우
                    with open(image_data, 'rb') as image_file:
                        image_bytes = image_file.read()
                        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                else:
                    # 이미 base64 문자열인 경우
                    image_base64 = image_data
            else:
                # 기타 타입인 경우 에러
                return {
                    'success': False,
                    'error': '지원하지 않는 이미지 데이터 타입입니다.',
                    'full_text': '',
                    'raw_result': None
                }
            
            # ROI 처리 적용
            if use_roi:
                print("ROI 처리를 적용하여 영양성분표 영역을 최적화합니다...")
                roi_result = self.roi_processor.process_image_with_roi(image_data)
                
                if roi_result['success']:
                    print(f"ROI 처리 완료: {roi_result['roi_bbox']}")
                    image_base64 = roi_result['processed_image']
                else:
                    print(f"ROI 처리 실패, 원본 이미지 사용: {roi_result['error']}")
            else:
                print("ROI 처리를 건너뛰고 원본 이미지를 사용합니다.")
            
            # API 요청 데이터 (클로바 OCR V2 형식)
            request_data = {
                'version': 'V2',
                'requestId': 'string',
                'timestamp': 0,
                'images': [
                    {
                        'format': 'jpg',
                        'data': image_base64,
                        'name': 'image'
                    }
                ]
            }
            
            # API 요청
            response = requests.post(self.api_url, headers=self.headers, json=request_data)
            
            # 디버깅 정보 출력
            print(f"🔍 API 요청 URL: {self.api_url}")
            print(f"🔍 응답 상태 코드: {response.status_code}")
            if response.status_code != 200:
                print(f"🔍 응답 내용: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                
                # 텍스트 추출
                full_text = ""
                if 'images' in result and len(result['images']) > 0:
                    fields = result['images'][0].get('fields', [])
                    for field in fields:
                        if 'inferText' in field:
                            full_text += field['inferText'] + " "
                
                # 텍스트 후처리 (영양성분 인식률 향상)
                if use_roi and full_text.strip():
                    enhanced_text = self.roi_processor.enhance_nutrition_text_recognition(full_text.strip())
                    print(f"📝 텍스트 후처리 적용: {len(full_text)} → {len(enhanced_text)} 문자")
                    full_text = enhanced_text
                
                return {
                    'success': True,
                    'full_text': full_text.strip(),
                    'raw_result': result,
                    'model_info': {
                        'engine': '네이버 클로바 OCR (ROI 처리 적용)',
                        'api_url': self.api_url,
                        'version': 'V2',
                        'roi_processing': use_roi
                    }
                }
            else:
                return {
                    'success': False,
                    'error': f'API 요청 실패: {response.status_code}',
                    'full_text': '',
                    'raw_result': None
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'텍스트 추출 실패: {str(e)}',
                'full_text': '',
                'raw_result': None
            }
            
    # 영양성분 파싱
    def extract_nutrition_values(self, text):
        """
        텍스트에서 영양성분 값 추출
        
        Args:
            text (str): OCR로 추출된 텍스트
            
        Returns:
            dict: 영양성분 정보
        """
        nutrition = {}
        
        # 정규표현식 패턴들 (실제 영양성분표 형식에 맞춘 패턴)
        patterns = {
            '나트륨': [
                r'나트륨\s*(\d+)',
                r'소듐\s*(\d+)',
                r'나트륨[:\s]*(\d+)', 
                r'소듐[:\s]*(\d+)',
                r'Na[:\s]*(\d+)'
            ],
            '탄수화물': [
                r'탄수화물\s*(\d+)',
                r'당질\s*(\d+)',
                r'탄수화물[:\s]*(\d+)', 
                r'당질[:\s]*(\d+)',
                r'Carbohydrate[:\s]*(\d+)'
            ],
            '당류': [
                r'당류\s*g\s*(\d+)',
                r'당류\s*(\d+)',
                r'당\s*g\s*(\d+)',
                r'당\s*(\d+)',
                r'당류[:\s]*(\d+)', 
                r'당[:\s]*(\d+)',
                r'Sugar[:\s]*(\d+)'
            ],
            '지방': [
                r'지방\s*(\d+)',
                r'지질\s*(\d+)',
                r'지방[:\s]*(\d+)', 
                r'지질[:\s]*(\d+)',
                r'Fat[:\s]*(\d+)'
            ],
            '트랜스지방': [
                r'트랜스지방\s*(\d+)',
                r'트랜스\s*(\d+)',
                r'트랜스지방[:\s]*(\d+)', 
                r'트랜스[:\s]*(\d+)',
                r'Trans[:\s]*(\d+)'
            ],
            '포화지방': [
                r'포화지방\s*(\d+)',
                r'포화\s*(\d+)',
                r'포화지방[:\s]*(\d+)', 
                r'포화[:\s]*(\d+)',
                r'Saturated[:\s]*(\d+)',
                r'포화지방\s*g\s*(\d+)',
                r'포화\s*g\s*(\d+)'
            ],
            '콜레스테롤': [
                r'콜레스테롤\s*(\d+)',
                r'콜레스테롤[:\s]*(\d+)', 
                r'Cholesterol[:\s]*(\d+)'
            ],
            '단백질': [
                r'단백질\s*(\d+)',
                r'단백질[:\s]*(\d+)', 
                r'Protein[:\s]*(\d+)',
                r'단백질\s*g\s*(\d+)',
                r'단백질\s*%\s*(\d+)'
            ]
        }
        
        # 각 영양성분에 대해 패턴 매칭
        for nutrient, pattern_list in patterns.items():
            value = None
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        value = int(match.group(1))
                        break
                    except ValueError:
                        continue
            
            nutrition[nutrient] = value if value is not None else '정보없음'
        
        return nutrition
