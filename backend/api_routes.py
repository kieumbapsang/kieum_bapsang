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
from database import Database
from datetime import date, datetime
from typing import Optional, List
import random
import json

# 라우터 생성
router = APIRouter()

# OCR 엔진 초기화
ocr_engine = ClovaOCREngine(config.CLOVA_OCR_API_URL, config.CLOVA_OCR_SECRET_KEY)

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
async def ocr_upload(file: UploadFile = File(...)):
    """파일 업로드를 통한 OCR 처리"""
    try:
        # 파일 읽기
        contents = await file.read()
        
        # 이미지 데이터를 base64로 인코딩
        import base64
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_data = f"data:{file.content_type};base64,{image_base64}"
        
        # OCR 처리
        result = ocr_engine.extract_text(image_data)
        
        # 영양성분 정보 추출
        if result['success'] and result['full_text']:
            nutrition_info = ocr_engine.extract_nutrition_values(result['full_text'])
            result['nutrition_info'] = nutrition_info
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 처리 중 오류 발생: {str(e)}")

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
        return JSONResponse(content={
            "success": True,
            "message": "식사 요약 조회 성공",
            "data": result.summary.dict()
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
        print(f"❌ 영양소 기록 조회 에러: {str(e)}")
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
        print(f"❌ 평균 영양소 조회 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"평균 영양소 조회 실패: {str(e)}")
