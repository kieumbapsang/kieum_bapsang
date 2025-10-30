"""
ROI 처리 기능 테스트 스크립트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from roi_processor import ROIProcessor
import base64
import cv2
import numpy as np
from PIL import Image
import io

def test_roi_processing():
    """ROI 처리 기능 테스트"""
    print("🧪 ROI 처리 기능 테스트를 시작합니다...")
    
    # ROI 프로세서 초기화
    roi_processor = ROIProcessor()
    
    # 테스트용 이미지 생성 (영양성분표 시뮬레이션)
    test_image = create_test_nutrition_image()
    
    # 이미지를 base64로 인코딩
    _, buffer = cv2.imencode('.jpg', test_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # ROI 처리 테스트
    result = roi_processor.process_image_with_roi(f"data:image/jpeg;base64,{image_base64}")
    
    if result['success']:
        print("✅ ROI 처리 성공!")
        print(f"   - 원본 크기: {result['original_size']}")
        print(f"   - 처리된 크기: {result['processed_size']}")
        print(f"   - ROI 영역: {result['roi_bbox']}")
    else:
        print(f"❌ ROI 처리 실패: {result['error']}")
    
    return result

def create_test_nutrition_image():
    """테스트용 영양성분표 이미지 생성"""
    # 800x600 크기의 흰색 배경 이미지 생성
    image = np.ones((600, 800, 3), dtype=np.uint8) * 255
    
    # 영양성분표 영역 그리기 (회색 배경)
    cv2.rectangle(image, (200, 100), (600, 500), (240, 240, 240), -1)
    cv2.rectangle(image, (200, 100), (600, 500), (0, 0, 0), 2)
    
    # 제목 텍스트
    cv2.putText(image, "Nutrition Facts", (220, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    
    # 영양성분 정보 텍스트들
    nutrition_texts = [
        "Calories: 250",
        "Protein: 15g",
        "Carbohydrate: 30g", 
        "Fat: 8g",
        "Sodium: 200mg",
        "Sugar: 5g"
    ]
    
    y_pos = 180
    for text in nutrition_texts:
        cv2.putText(image, text, (220, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        y_pos += 40
    
    return image

if __name__ == "__main__":
    test_roi_processing()


