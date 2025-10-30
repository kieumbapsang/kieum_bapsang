import { useState, useEffect, useCallback } from 'react';
import { Meal } from '../components/MealCard';
import { api } from '../../../api/client';
import { toKoreanDateString } from '../../../lib/utils';

// 백엔드 API 응답을 프론트엔드 Meal 타입으로 변환
const convertApiMealToMeal = (apiMeal: any): Meal => {
  // created_at 시간을 HH:MM 형식으로 변환 (원래 생성 시간 기반)
  const createdTime = new Date(apiMeal.created_at);
  const timeString = createdTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  console.log(`🔍 변환 중인 식사: ${apiMeal.food_name}`);
  console.log(`🔍 원본 nutrition_data:`, apiMeal.nutrition_data);
  console.log(`🔍 sugar 값:`, apiMeal.nutrition_data.sugar);

  return {
    id: apiMeal.id.toString(),
    name: apiMeal.food_name,
    amount: apiMeal.nutrition_data.amount || 0, // JSONB에서 amount 가져오기
    calories: apiMeal.nutrition_data.calories,
    protein: apiMeal.nutrition_data.protein,
    carbs: apiMeal.nutrition_data.carbs,
    fat: apiMeal.nutrition_data.fat,
    sodium: apiMeal.nutrition_data.sodium,
    sugar: apiMeal.nutrition_data.sugar,
    cholesterol: apiMeal.nutrition_data.cholesterol,
    saturatedFat: apiMeal.nutrition_data.saturated_fat,
    transFat: apiMeal.nutrition_data.trans_fat,
    createdAt: apiMeal.created_at
  };
};

export const useMeals = () => {
  const [meals, setMeals] = useState<Record<string, Meal[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 특정 날짜의 식사 목록을 API에서 가져오기
  const fetchMealsByDate = useCallback(async (date: Date) => {
    const dateString = toKoreanDateString(date);
    const userId = 1; // 임시로 1번 사용자 사용
    console.log(`🔍 식사 목록 조회 시작: ${dateString}, user_id: ${userId}`);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await api.meals.getMealsByDate(dateString, userId as any);
      
      console.log(`📊 API 응답:`, { data, apiError });
      
      if (apiError) {
        console.error(`❌ API 에러:`, apiError);
        setError(apiError);
        return;
      }
      
      if (data && data.meals) {
        console.log(`✅ 조회된 식사 수: ${data.meals.length}`);
        console.log(`🔍 원본 API 데이터:`, data.meals);
        const convertedMeals = data.meals.map(convertApiMealToMeal);
        console.log(`🔄 변환된 식사:`, convertedMeals);
        console.log(`🍯 콜라 당 정보 확인:`, convertedMeals.find((meal: Meal) => meal.name === '콜라')?.sugar);
        setMeals(prev => ({
          ...prev,
          [dateString]: convertedMeals
        }));
      } else {
        console.log(`📭 해당 날짜에 식사가 없습니다: ${dateString}`);
        setMeals(prev => ({
          ...prev,
          [dateString]: []
        }));
      }
    } catch (err) {
      console.error(`💥 에러 발생:`, err);
      setError(err instanceof Error ? err.message : '식사 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []); // 빈 의존성 배열로 고정

  const getMealsByDate = (date: Date) => {
    const dateString = toKoreanDateString(date);
    return (meals[dateString] || []).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.id.localeCompare(b.id);
    });
  };

  const deleteMeal = async (date: Date, mealId: string) => {
    try {
      const { error: apiError } = await api.meals.deleteMeal(parseInt(mealId));
      
      if (apiError) {
        setError(apiError);
        return;
      }
      
      // 로컬 상태에서도 제거
      const dateString = toKoreanDateString(date);
      setMeals(prev => ({
        ...prev,
        [dateString]: (prev[dateString] || []).filter(meal => meal.id !== mealId)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '식사 삭제에 실패했습니다.');
    }
  };

  const updateMeal = async (date: Date, mealId: string, updatedMeal: Meal) => {
    try {
      // 백엔드 API 형식으로 변환
      const updateData = {
        food_name: updatedMeal.name,
        nutrition_data: {
          amount: updatedMeal.amount,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          carbs: updatedMeal.carbs,
          fat: updatedMeal.fat,
          sodium: updatedMeal.sodium,
          sugar: updatedMeal.sugar,
          cholesterol: updatedMeal.cholesterol,
          saturated_fat: updatedMeal.saturatedFat,
          trans_fat: updatedMeal.transFat
        }
      };
      
      const { error: apiError } = await api.meals.updateMeal(parseInt(mealId), updateData);
      
      if (apiError) {
        setError(apiError);
        return;
      }
      
      // 로컬 상태도 업데이트
      const dateString = toKoreanDateString(date);
      setMeals(prev => ({
        ...prev,
        [dateString]: (prev[dateString] || []).map(meal => 
          meal.id === mealId ? { ...meal, ...updatedMeal } : meal
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '식사 수정에 실패했습니다.');
    }
  };

  const addMeal = (date: Date, meal: Meal) => {
    // addMeal은 AddMealModal에서 직접 API를 호출하므로 여기서는 로컬 상태만 업데이트
    const dateString = toKoreanDateString(date);
    setMeals(prev => ({
      ...prev,
      [dateString]: [...(prev[dateString] || []), meal]
    }));
  };

  return {
    getMealsByDate,
    deleteMeal,
    updateMeal,
    addMeal,
    fetchMealsByDate,
    loading,
    error
  };
};