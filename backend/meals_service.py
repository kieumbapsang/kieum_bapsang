"""
식사 관련 비즈니스 로직
식사 데이터의 CRUD 작업을 처리합니다.
"""

import json
from datetime import datetime, date
from typing import List, Optional
from database import db
from models import Meal, MealCreate, MealUpdate, MealSummary, MealListResponse, NutritionData
import psycopg2

class MealsService:
    """식사 서비스 클래스"""
    
    def __init__(self):
        self.db = db
    
    def get_meals_by_date(self, target_date: date, user_id: Optional[int] = None) -> MealListResponse:
        """특정 날짜의 식사 목록 조회"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # 식사 목록 조회 (user_id가 있으면 필터링)
                    if user_id:
                        cursor.execute("""
                            SELECT 
                                id, user_id, food_name, nutrition_data, intake_date, created_at
                            FROM nutrition_records 
                            WHERE intake_date = %s AND user_id = %s
                            ORDER BY created_at ASC
                        """, (target_date, user_id))
                    else:
                        cursor.execute("""
                            SELECT 
                                id, user_id, food_name, nutrition_data, intake_date, created_at
                            FROM nutrition_records 
                            WHERE intake_date = %s
                            ORDER BY created_at ASC
                        """, (target_date,))
                    
                    meals_data = cursor.fetchall()
                    meals = [self._dict_to_meal(row) for row in meals_data]
                    
                    # 요약 통계 계산
                    summary = self._calculate_summary(target_date, meals)
                    
                    return MealListResponse(
                        date=target_date,
                        meals=meals,
                        summary=summary
                    )
        except Exception as e:
            raise Exception(f"식사 목록 조회 실패: {str(e)}")
    
    def create_meal(self, meal_data: MealCreate, user_id: Optional[int] = None) -> Meal:
        """새 식사 추가"""
        try:
            intake_date = meal_data.intake_date or date.today()
            
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # nutrition_data를 JSON으로 변환 (9개 영양소만)
                    nutrition_json = meal_data.nutrition_data.dict()
                    
                    cursor.execute("""
                        INSERT INTO nutrition_records (
                            user_id, food_name, nutrition_data, intake_date
                        ) VALUES (
                            %s, %s, %s, %s
                        ) RETURNING id, created_at
                    """, (
                        user_id, 
                        meal_data.food_name, 
                        json.dumps(nutrition_json), 
                        intake_date
                    ))
                    
                    result = cursor.fetchone()
                    meal_id = result['id']
                    created_at = result['created_at']
                    
                    conn.commit()
                    
                    return Meal(
                        id=meal_id,
                        user_id=user_id,
                        food_name=meal_data.food_name,
                        nutrition_data=meal_data.nutrition_data,
                        intake_date=intake_date,
                        created_at=created_at
                    )
        except Exception as e:
            raise Exception(f"식사 생성 실패: {str(e)}")
    
    def update_meal(self, meal_id: int, meal_data: MealUpdate) -> Meal:
        """식사 정보 수정"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # 기존 데이터 조회
                    cursor.execute("""
                        SELECT user_id, food_name, nutrition_data, intake_date, created_at
                        FROM nutrition_records 
                        WHERE id = %s
                    """, (meal_id,))
                    
                    existing = cursor.fetchone()
                    if not existing:
                        raise Exception("수정할 식사를 찾을 수 없습니다")
                    
                    # 업데이트할 데이터 준비
                    update_fields = []
                    values = []
                    
                    if meal_data.food_name is not None:
                        update_fields.append("food_name = %s")
                        values.append(meal_data.food_name)
                    
                    if meal_data.nutrition_data is not None:
                        update_fields.append("nutrition_data = %s")
                        values.append(json.dumps(meal_data.nutrition_data.dict()))
                    
                    if not update_fields:
                        raise Exception("수정할 필드가 없습니다")
                    
                    values.append(meal_id)
                    
                    cursor.execute(f"""
                        UPDATE nutrition_records 
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                    """, values)
                    
                    conn.commit()
                    
                    # 수정된 데이터 조회
                    cursor.execute("""
                        SELECT id, user_id, food_name, nutrition_data, intake_date, created_at
                        FROM nutrition_records 
                        WHERE id = %s
                    """, (meal_id,))
                    
                    result = cursor.fetchone()
                    return self._dict_to_meal(result)
        except Exception as e:
            raise Exception(f"식사 수정 실패: {str(e)}")
    
    def delete_meal(self, meal_id: int) -> bool:
        """식사 삭제"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM nutrition_records WHERE id = %s", (meal_id,))
                    
                    if cursor.rowcount == 0:
                        raise Exception("삭제할 식사를 찾을 수 없습니다")
                    
                    conn.commit()
                    return True
        except Exception as e:
            raise Exception(f"식사 삭제 실패: {str(e)}")
    
    def get_meal_by_id(self, meal_id: int) -> Optional[Meal]:
        """ID로 식사 조회"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, user_id, food_name, nutrition_data, intake_date, created_at
                        FROM nutrition_records 
                        WHERE id = %s
                    """, (meal_id,))
                    
                    result = cursor.fetchone()
                    return self._dict_to_meal(result) if result else None
        except Exception as e:
            raise Exception(f"식사 조회 실패: {str(e)}")
    
    def _dict_to_meal(self, row: dict) -> Meal:
        """데이터베이스 행을 Meal 객체로 변환"""
        # JSONB 데이터를 파싱
        nutrition_data = NutritionData(**row['nutrition_data'])
        
        return Meal(
            id=row['id'],
            user_id=row.get('user_id'),
            food_name=row['food_name'],
            nutrition_data=nutrition_data,
            intake_date=row['intake_date'],
            created_at=row['created_at']
        )
    
    def _calculate_summary(self, target_date: date, meals: List[Meal]) -> MealSummary:
        """식사 요약 통계 계산"""
        if not meals:
            return MealSummary(
                date=target_date,
                total_meals=0,
                total_calories=0.0,
                total_protein=0.0,
                total_carbs=0.0,
                total_fat=0.0,
                meals_by_period={}
            )
        
        # 총합 계산
        total_calories = sum(meal.nutrition_data.calories for meal in meals)
        total_protein = sum(meal.nutrition_data.protein for meal in meals)
        total_carbs = sum(meal.nutrition_data.carbs for meal in meals)
        total_fat = sum(meal.nutrition_data.fat for meal in meals)
        total_sodium = sum(meal.nutrition_data.sodium for meal in meals if meal.nutrition_data.sodium)
        total_sugar = sum(meal.nutrition_data.sugar for meal in meals if meal.nutrition_data.sugar)
        total_cholesterol = sum(meal.nutrition_data.cholesterol for meal in meals if meal.nutrition_data.cholesterol)
        total_saturated_fat = sum(meal.nutrition_data.saturated_fat for meal in meals if meal.nutrition_data.saturated_fat)
        total_trans_fat = sum(meal.nutrition_data.trans_fat for meal in meals if meal.nutrition_data.trans_fat)
        
        # 시간대별 식사 수 계산 (생성 시간 기준)
        meals_by_period = {}
        for meal in meals:
            # created_at 시간을 기준으로 식사 시간대 판단
            hour = meal.created_at.hour
            if hour < 11:
                period = "아침"
            elif hour < 15:
                period = "점심"
            elif hour < 20:
                period = "저녁"
            else:
                period = "간식"
            
            meals_by_period[period] = meals_by_period.get(period, 0) + 1
        
        return MealSummary(
            date=target_date,
            total_meals=len(meals),
            total_calories=total_calories,
            total_protein=total_protein,
            total_carbs=total_carbs,
            total_fat=total_fat,
            total_sodium=total_sodium if total_sodium > 0 else None,
            total_sugar=total_sugar if total_sugar > 0 else None,
            total_cholesterol=total_cholesterol if total_cholesterol > 0 else None,
            total_saturated_fat=total_saturated_fat if total_saturated_fat > 0 else None,
            total_trans_fat=total_trans_fat if total_trans_fat > 0 else None,
            meals_by_period=meals_by_period
        )
    

# 전역 서비스 인스턴스
meals_service = MealsService()