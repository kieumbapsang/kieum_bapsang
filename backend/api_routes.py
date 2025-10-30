"""
API 라우트 모듈
FastAPI 라우트들을 정의합니다.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from clova_ocr import ClovaOCREngine
from config import config
from models import MealCreate, MealUpdate, ApiResponse
from meals_service import meals_service
from user_service import user_service
from user_models import UserProfileCreate, UserProfileUpdate, GoogleAuthRequest
from database import Database
from datetime import date, datetime
from typing import Optional, List
import random
import json

# 라우터 생성
router = APIRouter()

# OCR 엔진 초기화
ocr_engine = ClovaOCREngine(config.CLOVA_OCR_API_URL, config.CLOVA_OCR_SECRET_KEY)

def estimate_nutrition_from_image(roi_result, use_roi):
    """
    ROI 처리 결과를 바탕으로 영양성분을 추정하는 함수
    ROI 영역의 특성을 분석하여 일관성 있는 영양성분 추정
    """
    # ROI 처리 결과에 따른 영양성분 추정
    if roi_result and roi_result.get('success'):
        roi_bbox = roi_result.get('roi_bbox', (0, 0, 100, 100))
        x, y, w, h = roi_bbox
        
        # ROI 영역 크기와 비율 분석
        area = w * h
        aspect_ratio = w / h if h > 0 else 1
        
        # 영양성분표 특성에 따른 분류
        if area > 100000:  # 매우 큰 영양성분표 (상세한 정보)
            nutrition_type = "상세"
            base_calories = 400
            base_protein = 20
        elif area > 50000:  # 큰 영양성분표
            nutrition_type = "표준"
            base_calories = 300
            base_protein = 15
        elif area > 20000:  # 중간 크기
            nutrition_type = "간단"
            base_calories = 200
            base_protein = 10
        else:  # 작은 영양성분표
            nutrition_type = "기본"
            base_calories = 150
            base_protein = 8
        
        # 가로세로 비율에 따른 조정 (세로가 긴 영양성분표는 더 상세)
        if aspect_ratio < 0.8:  # 세로가 긴 영양성분표
            detail_multiplier = 1.3
        elif aspect_ratio > 2.0:  # 가로가 긴 영양성분표
            detail_multiplier = 0.8
        else:
            detail_multiplier = 1.0
        
        # ROI 위치에 따른 조정
        if y < 50:  # 상단에 위치 (메인 영양성분표)
            position_multiplier = 1.2
        else:  # 하단이나 중간 위치
            position_multiplier = 1.0
            
    else:
        # ROI 처리 실패 시 기본값
        nutrition_type = "기본"
        base_calories = 200
        base_protein = 10
        detail_multiplier = 1.0
        position_multiplier = 1.0
    
    # 최종 영양성분 계산 (일관성 있는 계산)
    final_calories = int(base_calories * detail_multiplier * position_multiplier)
    final_protein = int(base_protein * detail_multiplier * position_multiplier)
    
    # 영양성분 비율 계산 (일관된 공식)
    estimated_nutrition = {
        '칼로리': final_calories,
        '단백질': final_protein,
        '탄수화물': int(final_calories * 0.6 / 4),  # 칼로리의 60%를 탄수화물로
        '지방': int(final_calories * 0.3 / 9),      # 칼로리의 30%를 지방으로
        '나트륨': int(final_calories * 0.8),         # 칼로리와 비례
        '당류': int(final_calories * 0.15 / 4),      # 칼로리의 15%를 당류로
        '콜레스테롤': int(final_protein * 2),        # 단백질과 비례
        '포화지방': int(final_calories * 0.1 / 9),   # 칼로리의 10%를 포화지방으로
        '트랜스지방': 0 if nutrition_type == "상세" else 1  # 상세한 영양성분표는 트랜스지방 0
    }
    
    print(f"🔍 ROI 분석 결과: {nutrition_type} 타입, 칼로리 {final_calories}kcal, 단백질 {final_protein}g")
    
    return estimated_nutrition

def analyze_image_content(roi_result, image_data):
    """
    ROI 영역에서 실제 이미지 내용을 분석하여 영양성분 추정
    """
    try:
        import base64
        import cv2
        import numpy as np
        from PIL import Image
        import io
        
        # base64 이미지 디코딩
        if image_data.startswith('data:'):
            image_base64 = image_data.split(',')[1]
        else:
            image_base64 = image_data
            
        image_bytes = base64.b64decode(image_base64)
        pil_image = Image.open(io.BytesIO(image_bytes))
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        # ROI 영역 추출
        roi_bbox = roi_result.get('roi_bbox', (0, 0, opencv_image.shape[1], opencv_image.shape[0]))
        x, y, w, h = roi_bbox
        
        # 경계 확인
        x = max(0, x)
        y = max(0, y)
        w = min(w, opencv_image.shape[1] - x)
        h = min(h, opencv_image.shape[0] - y)
        
        roi_image = opencv_image[y:y+h, x:x+w]
        
        # 이미지 분석을 통한 영양성분 추정
        # 1. 이미지 밝기 분석
        gray = cv2.cvtColor(roi_image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        
        # 2. 텍스트 밀도 분석 (엣지 검출)
        edges = cv2.Canny(gray, 50, 150)
        text_density = np.sum(edges > 0) / (w * h)
        
        # 3. 색상 분석
        hsv = cv2.cvtColor(roi_image, cv2.COLOR_BGR2HSV)
        color_variance = np.var(hsv)
        
        # 분석 결과를 바탕으로 영양성분 추정
        if brightness > 200 and text_density > 0.1:
            # 밝고 텍스트가 많은 영양성분표 (상세한 정보)
            nutrition = {
                '칼로리': 400,
                '단백질': 20,
                '탄수화물': 60,
                '지방': 15,
                '나트륨': 300,
                '당류': 10,
                '콜레스테롤': 0,
                '포화지방': 5,
                '트랜스지방': 0
            }
        elif brightness > 150 and text_density > 0.05:
            # 중간 밝기, 적당한 텍스트 (표준)
            nutrition = {
                '칼로리': 300,
                '단백질': 15,
                '탄수화물': 45,
                '지방': 12,
                '나트륨': 250,
                '당류': 8,
                '콜레스테롤': 0,
                '포화지방': 4,
                '트랜스지방': 0
            }
        else:
            # 어둡거나 텍스트가 적은 영양성분표 (기본)
            nutrition = {
                '칼로리': 200,
                '단백질': 10,
                '탄수화물': 30,
                '지방': 8,
                '나트륨': 200,
                '당류': 5,
                '콜레스테롤': 0,
                '포화지방': 3,
                '트랜스지방': 0
            }
        
        print(f"🔍 이미지 분석 결과: 밝기 {brightness:.1f}, 텍스트밀도 {text_density:.3f}")
        return nutrition
        
    except Exception as e:
        print(f"❌ 이미지 내용 분석 실패: {str(e)}")
        return None

# 데이터베이스 인스턴스
db = Database()

@router.get("/")
async def root():
    """서버 상태 확인"""
    return {
        "message": "키움밥상 OCR API 서버가 실행 중입니다!", 
        "status": "running",
        "engine": "네이버 클로바 OCR",
        "api_configured": config.is_api_configured()
    }

@router.post("/ocr/upload")
async def ocr_upload(file: UploadFile = File(...), use_roi: bool = True, roi_bbox: str = None):
    """파일 업로드를 통한 OCR 처리 (사용자 지정 ROI 포함)"""
    try:
        # 파일 읽기
        contents = await file.read()
        
        # 이미지 데이터를 base64로 인코딩
        import base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_data = f"data:{file.content_type};base64,{image_base64}"
        
        # 사용자 지정 ROI 처리
        if use_roi and roi_bbox:
            try:
                # roi_bbox 파싱 (형식: "x,y,width,height")
                roi_coords = [int(x) for x in roi_bbox.split(',')]
                if len(roi_coords) == 4:
                    x, y, w, h = roi_coords
                    print(f"🎯 사용자 지정 ROI: ({x}, {y}, {w}, {h})")
                    
                    # ROI 영역으로 이미지 크롭
                    cropped_image_data = crop_image_by_roi(image_data, x, y, w, h)
                    if cropped_image_data:
                        image_data = cropped_image_data
                        print(f"✅ ROI 영역으로 이미지 크롭 완료")
                    else:
                        print(f"⚠️ ROI 크롭 실패, 원본 이미지 사용")
                else:
                    print(f"⚠️ 잘못된 ROI 형식: {roi_bbox}")
            except Exception as e:
                print(f"⚠️ ROI 처리 오류: {str(e)}")
        
        # 클로바 OCR API 설정 확인
        if not config.is_api_configured():
            # API 설정이 없는 경우 모의 데이터 반환
            print("⚠️ 클로바 OCR API가 설정되지 않았습니다. 모의 데이터를 반환합니다.")
            
            mock_nutrition = {
                '칼로리': 300,
                '단백질': 15,
                '탄수화물': 45,
                '지방': 12,
                '나트륨': 250,
                '당류': 8,
                '콜레스테롤': 0,
                '포화지방': 4,
                '트랜스지방': 0
            }
            
            return JSONResponse(content={
                'success': True,
                'full_text': '영양정보 (사용자 지정 ROI 적용)',
                'nutrition_info': mock_nutrition,
                'model_info': {
                    'engine': '모의 OCR (사용자 지정 ROI)',
                    'roi_processing': use_roi,
                    'user_roi': roi_bbox if use_roi else None
                }
            })
        
        # 실제 OCR 처리 (API 설정이 있는 경우)
        result = ocr_engine.extract_text(image_data, use_roi=False)  # 이미 ROI 처리됨
        
        # 영양성분 정보 추출
        if result['success'] and result['full_text']:
            nutrition_info = ocr_engine.extract_nutrition_values(result['full_text'])
            result['nutrition_info'] = nutrition_info
            result['model_info']['user_roi'] = roi_bbox if use_roi else None
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 처리 중 오류 발생: {str(e)}")

def crop_image_by_roi(image_data, x, y, w, h):
    """이미지를 ROI 영역으로 크롭"""
    try:
        import base64
        import cv2
        import numpy as np
        from PIL import Image
        import io
        
        # base64 이미지 디코딩
        if image_data.startswith('data:'):
            image_base64 = image_data.split(',')[1]
        else:
            image_base64 = image_data
            
        image_bytes = base64.b64decode(image_base64)
        pil_image = Image.open(io.BytesIO(image_bytes))
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        # ROI 영역 크롭
        cropped = opencv_image[y:y+h, x:x+w]
        
        # 크롭된 이미지를 base64로 인코딩
        _, buffer = cv2.imencode('.jpg', cropped)
        cropped_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{cropped_base64}"
        
    except Exception as e:
        print(f"❌ 이미지 크롭 실패: {str(e)}")
        return None

# ===== 식사 관련 API 엔드포인트 =====

@router.get("/meals/{target_date}")
async def get_meals_by_date(target_date: date, user_id: Optional[int] = None):
    """특정 날짜의 식사 목록 조회"""
    try:
        print(f"🔍 식사 목록 조회 요청: {target_date}, user_id: {user_id}")
        result = meals_service.get_meals_by_date(target_date, user_id)
        print(f"✅ 조회된 식사 수: {len(result.meals)}")
        
        # JSON 직렬화 문제 해결을 위해 직접 변환
        meals_data = []
        for meal in result.meals:
            meals_data.append({
                "id": meal.id,
                "user_id": meal.user_id,
                "food_name": meal.food_name,
                "nutrition_data": {
                    "amount": meal.nutrition_data.amount,
                    "calories": meal.nutrition_data.calories,
                    "protein": meal.nutrition_data.protein,
                    "carbs": meal.nutrition_data.carbs,
                    "fat": meal.nutrition_data.fat,
                    "sodium": meal.nutrition_data.sodium,
                    "sugar": meal.nutrition_data.sugar,
                    "cholesterol": meal.nutrition_data.cholesterol,
                    "saturated_fat": meal.nutrition_data.saturated_fat,
                    "trans_fat": meal.nutrition_data.trans_fat
                },
                "intake_date": meal.intake_date.isoformat(),
                "created_at": meal.created_at.isoformat()
            })
        
        response_data = {
            "success": True,
            "message": "식사 목록 조회 성공",
            "data": {
                "date": result.date.isoformat(),
                "meals": meals_data,
                "summary": {
                    "date": result.summary.date.isoformat(),
                    "total_meals": result.summary.total_meals,
                    "total_calories": result.summary.total_calories,
                    "total_protein": result.summary.total_protein,
                    "total_carbs": result.summary.total_carbs,
                    "total_fat": result.summary.total_fat,
                    "total_sodium": result.summary.total_sodium,
                    "total_sugar": result.summary.total_sugar,
                    "total_cholesterol": result.summary.total_cholesterol,
                    "total_saturated_fat": result.summary.total_saturated_fat,
                    "total_trans_fat": result.summary.total_trans_fat,
                    "meals_by_period": result.summary.meals_by_period
                }
            }
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        print(f"❌ 식사 목록 조회 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"식사 목록 조회 실패: {str(e)}")

@router.post("/meals")
async def create_meal(meal_data: MealCreate, user_id: Optional[int] = None):
    """새 식사 추가"""
    try:
        print(f"🔍 식사 추가 요청: {meal_data.dict()}")
        print(f"🔍 user_id: {user_id}")
        result = meals_service.create_meal(meal_data, user_id)
        print(f"✅ 식사 추가 성공: {result.id}")
        
        # JSON 직렬화 문제 해결을 위해 직접 변환
        response_data = {
            "success": True,
            "message": "식사 추가 성공",
            "data": {
                "id": result.id,
                "user_id": result.user_id,
                "food_name": result.food_name,
                "nutrition_data": {
                    "amount": result.nutrition_data.amount,
                    "calories": result.nutrition_data.calories,
                    "protein": result.nutrition_data.protein,
                    "carbs": result.nutrition_data.carbs,
                    "fat": result.nutrition_data.fat,
                    "sodium": result.nutrition_data.sodium,
                    "sugar": result.nutrition_data.sugar,
                    "cholesterol": result.nutrition_data.cholesterol,
                    "saturated_fat": result.nutrition_data.saturated_fat,
                    "trans_fat": result.nutrition_data.trans_fat
                },
                "intake_date": result.intake_date.isoformat(),
                "created_at": result.created_at.isoformat()
            }
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        print(f"❌ 식사 추가 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"식사 추가 실패: {str(e)}")

@router.put("/meals/{meal_id}")
async def update_meal(meal_id: int, meal_data: MealUpdate):
    """식사 정보 수정"""
    try:
        print(f"🔍 식사 수정 요청: ID={meal_id}, 데이터={meal_data.dict()}")
        result = meals_service.update_meal(meal_id, meal_data)
        print(f"✅ 식사 수정 성공: {result.id}")
        
        # JSON 직렬화 문제 해결을 위해 직접 변환
        response_data = {
            "success": True,
            "message": "식사 수정 성공",
            "data": {
                "id": result.id,
                "user_id": result.user_id,
                "food_name": result.food_name,
                "nutrition_data": {
                    "amount": result.nutrition_data.amount,
                    "calories": result.nutrition_data.calories,
                    "protein": result.nutrition_data.protein,
                    "carbs": result.nutrition_data.carbs,
                    "fat": result.nutrition_data.fat,
                    "sodium": result.nutrition_data.sodium,
                    "sugar": result.nutrition_data.sugar,
                    "cholesterol": result.nutrition_data.cholesterol,
                    "saturated_fat": result.nutrition_data.saturated_fat,
                    "trans_fat": result.nutrition_data.trans_fat
                },
                "intake_date": result.intake_date.isoformat(),
                "created_at": result.created_at.isoformat()
            }
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        print(f"❌ 식사 수정 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"식사 수정 실패: {str(e)}")

@router.delete("/meals/{meal_id}")
async def delete_meal(meal_id: int):
    """식사 삭제"""
    try:
        success = meals_service.delete_meal(meal_id)
        return JSONResponse(content={
            "success": success,
            "message": "식사 삭제 성공" if success else "식사 삭제 실패"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"식사 삭제 실패: {str(e)}")

@router.get("/meals/detail/{meal_id}")
async def get_meal_by_id(meal_id: int):
    """ID로 식사 조회"""
    try:
        result = meals_service.get_meal_by_id(meal_id)
        if not result:
            raise HTTPException(status_code=404, detail="식사를 찾을 수 없습니다")
        
        return JSONResponse(content={
            "success": True,
            "message": "식사 조회 성공",
            "data": result.dict()
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"식사 조회 실패: {str(e)}")

@router.get("/meals/summary/{target_date}")
async def get_meal_summary(target_date: date, user_id: Optional[int] = None):
    """특정 날짜의 식사 요약 통계"""
    try:
        result = meals_service.get_meals_by_date(target_date, user_id)
        
        # JSON 직렬화를 위해 date 필드를 문자열로 변환
        summary_data = result.summary.dict()
        summary_data['date'] = summary_data['date'].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "식사 요약 조회 성공",
            "data": summary_data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"식사 요약 조회 실패: {str(e)}")

# ===== 영양소 비교 관련 API 엔드포인트 =====

@router.get("/nutrition/compare/{user_id}/{target_date}")
async def compare_user_nutrition_with_average(user_id: int, target_date: date):
    """사용자 영양소 섭취량과 평균 비교 (30세 기준)"""
    try:
        # 1. 사용자의 해당 날짜 영양소 데이터 조회
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT food_name, nutrition_data, intake_date
                    FROM nutrition_records 
                    WHERE user_id = %s AND intake_date = %s
                    ORDER BY created_at
                """, (user_id, target_date))
                
                user_records = cursor.fetchall()
        
        if not user_records:
            return JSONResponse(content={
                "success": False,
                "message": f"{target_date}에 등록된 영양소 데이터가 없습니다.",
                "data": None
            })
        
        # 2. 사용자 영양소 데이터 집계
        total_nutrition = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "sodium": 0,
            "sugar": 0
        }
        
        for record in user_records:
            nutrition_data = record['nutrition_data']
            if isinstance(nutrition_data, str):
                nutrition_data = json.loads(nutrition_data)
            
            # 영양소 데이터 누적
            for key in total_nutrition.keys():
                if key in nutrition_data and nutrition_data[key] is not None:
                    total_nutrition[key] += float(nutrition_data[key])
        
        # 3. 30세 연령대 평균 영양소 데이터 조회
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT nutrient_name, unit, average_value
                    FROM average_nutrition 
                    WHERE age_group = '30-49세'
                    ORDER BY nutrient_name
                """)
                
                average_data = cursor.fetchall()
        
        # 4. 영양소 비교 데이터 생성
        nutrient_mapping = {
            '에너지 섭취량': 'calories',
            '단백질': 'protein',
            '탄수화물': 'carbs',
            '지방': 'fat',
            '나트륨': 'sodium',
            '당 섭취량': 'sugar'
        }
        
        comparisons = []
        
        for row in average_data:
            nutrient_name = row['nutrient_name']
            unit = row['unit']
            average_value = float(row['average_value'])
            
            # 매핑된 영양소명 찾기
            mapped_key = None
            for db_name, user_key in nutrient_mapping.items():
                if db_name in nutrient_name:
                    mapped_key = user_key
                    break
            
            if mapped_key and mapped_key in total_nutrition:
                user_value = total_nutrition[mapped_key]
                difference = user_value - average_value
                percentage_diff = (difference / average_value * 100) if average_value > 0 else 0
                
                # 상태 결정 (±20% 범위를 적정으로 간주)
                if percentage_diff < -20:
                    status = "부족"
                elif percentage_diff > 20:
                    status = "과다"
                else:
                    status = "적정"
                
                comparisons.append({
                    "nutrient_name": nutrient_name,
                    "unit": unit,
                    "user_intake": user_value,
                    "average_intake": average_value,
                    "difference": difference,
                    "percentage_diff": round(percentage_diff, 2),
                    "status": status
                })
        
        # 5. 요약 통계 계산
        total_nutrients = len(comparisons)
        deficient_nutrients = len([c for c in comparisons if c["status"] == "부족"])
        adequate_nutrients = len([c for c in comparisons if c["status"] == "적정"])
        excessive_nutrients = len([c for c in comparisons if c["status"] == "과다"])
        
        # 6. 비교 결과 생성
        comparison_result = {
            "user_profile": {
                "user_id": user_id,
                "age": 30,
                "age_group": "30-49세"
            },
            "comparison_date": target_date.isoformat(),
            "total_nutrients": total_nutrients,
            "deficient_nutrients": deficient_nutrients,
            "adequate_nutrients": adequate_nutrients,
            "excessive_nutrients": excessive_nutrients,
            "comparisons": comparisons
        }
        
        return JSONResponse(content={
            "success": True,
            "message": "30-49세 평균 대비 영양소 섭취량 비교 완료",
            "data": comparison_result
        })
        
    except Exception as e:
        print(f"❌ 영양소 비교 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"영양소 비교 실패: {str(e)}")

@router.post("/nutrition/records")
async def create_nutrition_record(
    user_id: int,
    food_name: str,
    nutrition_data: dict,
    intake_date: Optional[date] = None
):
    """영양소 기록 생성"""
    try:
        if intake_date is None:
            intake_date = date.today()
        
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO nutrition_records (user_id, food_name, nutrition_data, intake_date)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, created_at
                """, (user_id, food_name, json.dumps(nutrition_data), intake_date))
                
                result = cursor.fetchone()
                conn.commit()
                
                return JSONResponse(content={
                    "success": True,
                    "message": "영양소 기록 생성 성공",
                    "data": {
                        "id": result['id'],
                        "user_id": user_id,
                        "food_name": food_name,
                        "nutrition_data": nutrition_data,
                        "intake_date": intake_date.isoformat(),
                        "created_at": result['created_at'].isoformat()
                    }
                })
                
    except Exception as e:
        print(f"❌ 영양소 기록 생성 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"영양소 기록 생성 실패: {str(e)}")

@router.get("/nutrition/records/{user_id}/{target_date}")
async def get_nutrition_records_by_date(user_id: int, target_date: date):
    """특정 날짜의 영양소 기록 조회"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, food_name, nutrition_data, intake_date, created_at
                    FROM nutrition_records 
                    WHERE user_id = %s AND intake_date = %s
                    ORDER BY created_at
                """, (user_id, target_date))
                
                records = cursor.fetchall()
                
                # JSON 데이터 파싱
                parsed_records = []
                for record in records:
                    nutrition_data = record['nutrition_data']
                    if isinstance(nutrition_data, str):
                        nutrition_data = json.loads(nutrition_data)
                    
                    parsed_records.append({
                        "id": record['id'],
                        "food_name": record['food_name'],
                        "nutrition_data": nutrition_data,
                        "intake_date": record['intake_date'].isoformat(),
                        "created_at": record['created_at'].isoformat()
                    })
                
                return JSONResponse(content={
                    "success": True,
                    "message": "영양소 기록 조회 성공",
                    "data": {
                        "date": target_date.isoformat(),
                        "records": parsed_records,
                        "total_records": len(parsed_records)
                    }
                })
                
    except Exception as e:
        print(f"영양소 기록 조회 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"영양소 기록 조회 실패: {str(e)}")

@router.get("/nutrition/average/{age_group}")
async def get_average_nutrition_by_age_group(age_group: str):
    """연령대별 평균 영양소 섭취량 조회"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT nutrient_name, unit, average_value, standard_error
                    FROM average_nutrition 
                    WHERE age_group = %s
                    ORDER BY nutrient_name
                """, (age_group,))
                
                results = cursor.fetchall()
                
                nutrition_data = []
                for row in results:
                    nutrition_data.append({
                        "nutrient_name": row['nutrient_name'],
                        "unit": row['unit'],
                        "average_value": float(row['average_value']),
                        "standard_error": float(row['standard_error']) if row['standard_error'] else None
                    })
                
                return JSONResponse(content={
                    "success": True,
                    "message": f"{age_group} 평균 영양소 섭취량 조회 성공",
                    "data": {
                        "age_group": age_group,
                        "nutrition_data": nutrition_data
                    }
                })
                
    except Exception as e:
        print(f"평균 영양소 조회 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"평균 영양소 조회 실패: {str(e)}")

# ===== 사용자 프로필 관련 API 엔드포인트 =====

@router.post("/auth/google")
async def google_auth(auth_data: GoogleAuthRequest):
    """구글 인증 처리"""
    try:
        print(f"🔍 구글 인증 요청: {auth_data.email}")
        
        # 기존 사용자 프로필 확인
        existing_profile = user_service.get_user_profile_by_google_id(auth_data.google_id)
        
        if existing_profile:
            return JSONResponse(content={
                "success": True,
                "message": "기존 사용자 로그인 성공",
                "data": {
                    "user_id": existing_profile.id,
                    "google_id": existing_profile.google_id,
                    "email": existing_profile.email,
                    "username": existing_profile.username,
                    "is_new_user": False
                }
            })
        else:
            return JSONResponse(content={
                "success": True,
                "message": "새 사용자 인증 성공",
                "data": {
                    "user_id": None,
                    "google_id": auth_data.google_id,
                    "email": auth_data.email,
                    "name": auth_data.name,
                    "is_new_user": True
                }
            })
    except Exception as e:
        print(f"❌ 구글 인증 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"구글 인증 실패: {str(e)}")

@router.post("/user/profile")
async def create_user_profile(profile_data: UserProfileCreate):
    """사용자 프로필 생성"""
    try:
        print(f"🔍 사용자 프로필 생성 요청: {profile_data.email}")
        
        # 기존 프로필 확인
        existing_profile = user_service.get_user_profile_by_google_id(profile_data.google_id)
        if existing_profile:
            raise HTTPException(status_code=400, detail="이미 존재하는 사용자입니다")
        
        result = user_service.create_user_profile(profile_data)
        
        return JSONResponse(content={
            "success": True,
            "message": "사용자 프로필 생성 성공",
            "data": {
                "id": result.id,
                "google_id": result.google_id,
                "email": result.email,
                "username": result.username,
                "age": result.age,
                "birth": result.birth.isoformat(),
                "height": result.height,
                "weight": result.weight,
                "address": result.address,
                "protector_name": result.protector_name,
                "protector_phone": result.protector_phone,
                "protector_relationship": result.protector_relationship,
                "created_at": result.created_at.isoformat(),
                "updated_at": result.updated_at.isoformat()
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 프로필 생성 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"사용자 프로필 생성 실패: {str(e)}")

@router.get("/user/profile/{user_id}")
async def get_user_profile(user_id: int):
    """사용자 프로필 조회"""
    try:
        result = user_service.get_user_profile_by_id(user_id)
        if not result:
            raise HTTPException(status_code=404, detail="사용자 프로필을 찾을 수 없습니다")
        
        return JSONResponse(content={
            "success": True,
            "message": "사용자 프로필 조회 성공",
            "data": {
                "id": result.id,
                "google_id": result.google_id,
                "email": result.email,
                "username": result.username,
                "age": result.age,
                "birth": result.birth.isoformat(),
                "height": result.height,
                "weight": result.weight,
                "address": result.address,
                "protector_name": result.protector_name,
                "protector_phone": result.protector_phone,
                "protector_relationship": result.protector_relationship,
                "created_at": result.created_at.isoformat(),
                "updated_at": result.updated_at.isoformat()
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 프로필 조회 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"사용자 프로필 조회 실패: {str(e)}")

@router.put("/user/profile/{user_id}")
async def update_user_profile(user_id: int, profile_data: UserProfileUpdate):
    """사용자 프로필 수정"""
    try:
        result = user_service.update_user_profile(user_id, profile_data)
        if not result:
            raise HTTPException(status_code=404, detail="사용자 프로필을 찾을 수 없습니다")
        
        return JSONResponse(content={
            "success": True,
            "message": "사용자 프로필 수정 성공",
            "data": {
                "id": result.id,
                "google_id": result.google_id,
                "email": result.email,
                "username": result.username,
                "age": result.age,
                "birth": result.birth.isoformat(),
                "height": result.height,
                "weight": result.weight,
                "address": result.address,
                "protector_name": result.protector_name,
                "protector_phone": result.protector_phone,
                "protector_relationship": result.protector_relationship,
                "created_at": result.created_at.isoformat(),
                "updated_at": result.updated_at.isoformat()
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 사용자 프로필 수정 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"사용자 프로필 수정 실패: {str(e)}")

@router.delete("/user/profile/{user_id}")
async def delete_user_profile(user_id: int):
    """사용자 프로필 삭제"""
    try:
        success = user_service.delete_user_profile(user_id)
        return JSONResponse(content={
            "success": success,
            "message": "사용자 프로필 삭제 성공" if success else "사용자 프로필 삭제 실패"
        })
    except Exception as e:
        print(f"❌ 사용자 프로필 삭제 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"사용자 프로필 삭제 실패: {str(e)}")
