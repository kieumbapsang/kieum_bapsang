"""
데이터 모델 정의
Pydantic 모델들을 정의합니다.
"""

from __future__ import annotations
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, Dict, Any, List


class NutritionData(BaseModel):
    """영양소 데이터 모델"""
    amount: float
    calories: float
    protein: float
    carbs: float
    fat: float
    sodium: Optional[float] = None
    sugar: Optional[float] = None
    cholesterol: Optional[float] = None
    saturated_fat: Optional[float] = None
    trans_fat: Optional[float] = None


class Meal(BaseModel):
    """식사 데이터 모델"""
    id: int
    user_id: Optional[int] = None
    food_name: str
    nutrition_data: NutritionData
    intake_date: date
    created_at: datetime


class MealCreate(BaseModel):
    """식사 생성 요청 모델"""
    food_name: str
    nutrition_data: NutritionData
    intake_date: Optional[date] = None


class MealUpdate(BaseModel):
    """식사 수정 요청 모델"""
    food_name: Optional[str] = None
    nutrition_data: Optional[NutritionData] = None


class MealSummary(BaseModel):
    """식사 요약 통계 모델"""
    date: date
    total_meals: int
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_sodium: Optional[float] = None
    total_sugar: Optional[float] = None
    total_cholesterol: Optional[float] = None
    total_saturated_fat: Optional[float] = None
    total_trans_fat: Optional[float] = None
    meals_by_period: Dict[str, int]


class MealListResponse(BaseModel):
    """식사 목록 응답 모델"""
    date: date
    meals: List[Meal]
    summary: MealSummary


class ApiResponse(BaseModel):
    """API 응답 기본 모델"""
    success: bool
    message: str
    data: Optional[Any] = None