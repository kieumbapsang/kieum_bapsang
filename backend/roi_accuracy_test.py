"""
ROI 처리 인식률 테스트 스크립트
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
import time

def test_roi_accuracy():
    """ROI 처리 인식률 테스트"""
    print("🧪 ROI 처리 인식률 테스트를 시작합니다...")
    
    # ROI 프로세서 초기화
    roi_processor = ROIProcessor()
    
    # 테스트 케이스들
    test_cases = [
        {
            'name': '큰 영양성분표',
            'size': (800, 600),
            'nutrition_area': (200, 100, 400, 400),
            'expected_detection': True
        },
        {
            'name': '중간 영양성분표', 
            'size': (600, 400),
            'nutrition_area': (150, 80, 300, 300),
            'expected_detection': True
        },
        {
            'name': '작은 영양성분표',
            'size': (400, 300),
            'nutrition_area': (100, 50, 200, 200),
            'expected_detection': True
        },
        {
            'name': '노이즈가 많은 이미지',
            'size': (800, 600),
            'nutrition_area': (200, 100, 400, 400),
            'noise_level': 'high',
            'expected_detection': True
        },
        {
            'name': '영양성분표가 없는 이미지',
            'size': (800, 600),
            'nutrition_area': None,
            'expected_detection': False
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases):
        print(f"\n📋 테스트 케이스 {i+1}: {test_case['name']}")
        
        # 테스트 이미지 생성
        test_image = create_test_image(
            size=test_case['size'],
            nutrition_area=test_case.get('nutrition_area'),
            noise_level=test_case.get('noise_level', 'low')
        )
        
        # 이미지를 base64로 인코딩
        _, buffer = cv2.imencode('.jpg', test_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        image_data = f"data:image/jpeg;base64,{image_base64}"
        
        # ROI 처리 테스트
        start_time = time.time()
        roi_result = roi_processor.process_image_with_roi(image_data)
        processing_time = time.time() - start_time
        
        # 결과 분석
        success = roi_result['success']
        detected_bbox = roi_result.get('roi_bbox')
        
        # 정확도 계산
        if test_case['expected_detection']:
            if success and detected_bbox:
                # IoU (Intersection over Union) 계산
                expected_bbox = test_case['nutrition_area']
                if expected_bbox:
                    iou = calculate_iou(detected_bbox, expected_bbox)
                    accuracy = "성공" if iou > 0.3 else "부분성공"
                else:
                    accuracy = "성공"
            else:
                accuracy = "실패"
        else:
            accuracy = "성공" if not success else "오탐"
        
        results.append({
            'test_case': test_case['name'],
            'success': success,
            'detected_bbox': detected_bbox,
            'processing_time': processing_time,
            'accuracy': accuracy
        })
        
        print(f"   결과: {accuracy}")
        print(f"   처리시간: {processing_time:.3f}초")
        if detected_bbox:
            print(f"   감지된 영역: {detected_bbox}")
    
    # 전체 통계 계산
    total_tests = len(results)
    successful_detections = sum(1 for r in results if r['accuracy'] == "성공")
    partial_detections = sum(1 for r in results if r['accuracy'] == "부분성공")
    failed_detections = sum(1 for r in results if r['accuracy'] == "실패")
    false_positives = sum(1 for r in results if r['accuracy'] == "오탐")
    
    avg_processing_time = sum(r['processing_time'] for r in results) / total_tests
    
    print(f"\n📊 ROI 처리 인식률 결과:")
    print(f"   전체 테스트: {total_tests}개")
    print(f"   성공: {successful_detections}개 ({successful_detections/total_tests*100:.1f}%)")
    print(f"   부분성공: {partial_detections}개 ({partial_detections/total_tests*100:.1f}%)")
    print(f"   실패: {failed_detections}개 ({failed_detections/total_tests*100:.1f}%)")
    print(f"   오탐: {false_positives}개 ({false_positives/total_tests*100:.1f}%)")
    print(f"   평균 처리시간: {avg_processing_time:.3f}초")
    
    # 전체 인식률
    overall_accuracy = (successful_detections + partial_detections) / total_tests * 100
    print(f"\n🎯 전체 ROI 인식률: {overall_accuracy:.1f}%")
    
    return results

def create_test_image(size, nutrition_area=None, noise_level='low'):
    """테스트용 이미지 생성"""
    width, height = size
    image = np.ones((height, width, 3), dtype=np.uint8) * 255
    
    # 노이즈 추가
    if noise_level == 'high':
        noise = np.random.randint(0, 50, (height, width, 3), dtype=np.uint8)
        image = cv2.add(image, noise)
    
    # 영양성분표 영역 그리기
    if nutrition_area:
        x, y, w, h = nutrition_area
        # 영양성분표 배경
        cv2.rectangle(image, (x, y), (x+w, y+h), (240, 240, 240), -1)
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 0, 0), 2)
        
        # 영양성분 텍스트 시뮬레이션
        cv2.putText(image, "Nutrition Facts", (x+10, y+30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        cv2.putText(image, "Calories: 250", (x+10, y+60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
        cv2.putText(image, "Protein: 15g", (x+10, y+80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
    
    return image

def calculate_iou(box1, box2):
    """IoU (Intersection over Union) 계산"""
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    
    # 교집합 영역 계산
    x_left = max(x1, x2)
    y_top = max(y1, y2)
    x_right = min(x1 + w1, x2 + w2)
    y_bottom = min(y1 + h1, y2 + h2)
    
    if x_right < x_left or y_bottom < y_top:
        return 0.0
    
    intersection = (x_right - x_left) * (y_bottom - y_top)
    union = w1 * h1 + w2 * h2 - intersection
    
    return intersection / union if union > 0 else 0.0

if __name__ == "__main__":
    test_roi_accuracy()

