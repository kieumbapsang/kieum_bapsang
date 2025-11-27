import React, { useState, useMemo, useEffect } from 'react';
import { Character } from '../components/Character';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus } from 'lucide-react';
import { getRandomTip } from '../utils/randomTips';
import { RecentMeals, MealRecord } from '../components/RecentMeals';
import { AchievementSection } from '../components/AchievementSection';
import { ManualInputModal } from '../components/modals/ManualInputModal';
import { api } from '../api/client';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';

/**
 * HomePage Props 인터페이스
 */
export interface HomePageProps {
  onNavigateToStore?: () => void;
}

/**
 * API 응답을 MealRecord로 변환
 */
const convertApiMealToMealRecord = (apiMeal: any): MealRecord => {
  const createdTime = new Date(apiMeal.created_at);
  const timeString = createdTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // intake_date 처리: ISO 형식(YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss)에서 날짜만 추출
  let intakeDate: string;
  if (apiMeal.intake_date) {
    if (typeof apiMeal.intake_date === 'string') {
      // ISO 형식에서 날짜 부분만 추출 (YYYY-MM-DD)
      intakeDate = apiMeal.intake_date.split('T')[0];
    } else {
      // Date 객체인 경우
      intakeDate = toKoreanDateString(new Date(apiMeal.intake_date));
    }
  } else {
    // intake_date가 없으면 오늘 날짜 사용
    intakeDate = toKoreanDateString(getKoreanDate());
  }

  return {
    id: apiMeal.id.toString(),
    time: timeString,
    foodName: apiMeal.food_name,
    calories: apiMeal.nutrition_data?.calories || 0,
    grams: apiMeal.nutrition_data?.amount || 0,
    unit: apiMeal.nutrition_data?.unit || 'g', // 단위 정보 포함
    date: intakeDate,
    carbs: apiMeal.nutrition_data?.carbs || 0,
    protein: apiMeal.nutrition_data?.protein || 0,
    fat: apiMeal.nutrition_data?.fat || 0,
  };
};

/**
 * HomePage 컴포넌트 - 키즈모드 메인 페이지
 * 
 * 새 디자인 적용:
 * - 캐릭터와 랜덤 팁
 * - 직접 추가 버튼
 * - RecentMeals (식사 기록)
 * - AchievementSection (성취 배지)
 */
export const HomePage: React.FC<HomePageProps> = ({ onNavigateToStore }) => {
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [allMeals, setAllMeals] = useState<MealRecord[]>([]); // 뱃지용 전체 식사 데이터
  const [loading, setLoading] = useState(true);
  const randomTip = useMemo(() => getRandomTip(), []);

  // 오늘 날짜의 식사 데이터 가져오기 (RecentMeals용)
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.warn('사용자 ID가 없습니다.');
        setMeals([]);
        return;
      }

      const today = toKoreanDateString(getKoreanDate());
      const { data, error } = await api.meals.getMealsByDate(today, parseInt(userId) as any);

      if (error) {
        console.error('식사 데이터 가져오기 실패:', error);
        setMeals([]);
        return;
      }

      if (data && data.meals) {
        const convertedMeals = data.meals.map(convertApiMealToMealRecord);
        // 최신순으로 정렬
        convertedMeals.sort((a: MealRecord, b: MealRecord) => {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          if (timeA[0] !== timeB[0]) return timeB[0] - timeA[0];
          return timeB[1] - timeA[1];
        });
        setMeals(convertedMeals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.error('식사 데이터 가져오기 중 오류:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // 모든 식사 데이터 가져오기 (뱃지용)
  const fetchAllMeals = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.warn('사용자 ID가 없습니다.');
        setAllMeals([]);
        return;
      }

      const { data, error } = await api.meals.getAllMeals(parseInt(userId) as any);

      if (error) {
        console.error('❌ 전체 식사 데이터 가져오기 실패:', error);
        setAllMeals([]);
        return;
      }

      console.log('🎯 HomePage - API 응답 데이터:', data);
      
      if (data && data.meals) {
        console.log('🎯 HomePage - 원본 식사 데이터 개수:', data.meals.length, '개');
        const convertedMeals = data.meals.map(convertApiMealToMealRecord);
        console.log('🎯 HomePage - 변환된 식사 데이터 개수:', convertedMeals.length, '개');
        console.log('🎯 HomePage - 첫 번째 식사 데이터 샘플:', convertedMeals[0]);
        console.log('🎯 HomePage - 마지막 식사 데이터 샘플:', convertedMeals[convertedMeals.length - 1]);
        
        // 날짜별로 그룹화하여 확인
        const mealsByDate: Record<string, number> = {};
        convertedMeals.forEach((meal: MealRecord) => {
          const date = meal.date || '날짜 없음';
          mealsByDate[date] = (mealsByDate[date] || 0) + 1;
        });
        console.log('🎯 HomePage - 날짜별 식사 기록:', mealsByDate);
        
        setAllMeals(convertedMeals);
      } else {
        console.warn('⚠️ HomePage - 전체 식사 데이터가 없습니다. data:', data);
        setAllMeals([]);
      }
    } catch (error) {
      console.error('전체 식사 데이터 가져오기 중 오류:', error);
      setAllMeals([]);
    }
  };

  useEffect(() => {
    fetchMeals();
    fetchAllMeals();
  }, []);

  // 식사 데이터 변경 이벤트 리스너
  useEffect(() => {
    const handleMealDataChanged = () => {
      fetchMeals();
      fetchAllMeals();
    };

    window.addEventListener('mealDataChanged', handleMealDataChanged);
    return () => {
      window.removeEventListener('mealDataChanged', handleMealDataChanged);
    };
  }, []);

  const handleAddMeal = async (meal: MealRecord) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('사용자 ID가 없습니다.');
        return;
      }

      // API 형식으로 변환 (탄단지 정보 포함)
      const mealData = {
        food_name: meal.foodName,
        nutrition_data: {
          amount: meal.grams,
          unit: meal.unit || 'g', // 단위 정보 포함
          calories: meal.calories,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
        },
        intake_date: meal.date || toKoreanDateString(getKoreanDate()),
      };

      const { data, error } = await api.meals.addMeal(mealData, parseInt(userId) as any);

      if (error) {
        console.error('식사 추가 실패:', error);
        return;
      }

      // 식사 목록 다시 불러오기
      await fetchMeals();
      await fetchAllMeals();
      
      // 기본 모드에 데이터 변경 알림
      window.dispatchEvent(new CustomEvent('mealDataChanged', { 
        detail: { action: 'add', date: meal.date || toKoreanDateString(getKoreanDate()) }
      }));
    } catch (error) {
      console.error('식사 추가 중 오류:', error);
    }
  };

  const handleUpdateMeal = async (updatedMeal: MealRecord) => {
    try {
      const mealData = {
        food_name: updatedMeal.foodName,
        nutrition_data: {
          amount: updatedMeal.grams,
          unit: updatedMeal.unit || 'g', // 단위 정보 포함
          calories: updatedMeal.calories,
          protein: updatedMeal.protein || 0,
          carbs: updatedMeal.carbs || 0,
          fat: updatedMeal.fat || 0,
        },
      };

      const { error } = await api.meals.updateMeal(parseInt(updatedMeal.id), mealData);

      if (error) {
        console.error('식사 수정 실패:', error);
        return;
      }

      // 식사 목록 다시 불러오기
      await fetchMeals();
      await fetchAllMeals();
      
      // 기본 모드에 데이터 변경 알림
      window.dispatchEvent(new CustomEvent('mealDataChanged', { 
        detail: { action: 'update', date: updatedMeal.date || toKoreanDateString(getKoreanDate()) }
      }));
    } catch (error) {
      console.error('식사 수정 중 오류:', error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const { error } = await api.meals.deleteMeal(parseInt(id));

      if (error) {
        console.error('식사 삭제 실패:', error);
        return;
      }

      // 식사 목록 다시 불러오기
      await fetchMeals();
      await fetchAllMeals();
      
      // 기본 모드에 데이터 변경 알림
      const today = toKoreanDateString(getKoreanDate());
      window.dispatchEvent(new CustomEvent('mealDataChanged', { 
        detail: { action: 'delete', date: today }
      }));
    } catch (error) {
      console.error('식사 삭제 중 오류:', error);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Welcome Character & Add Meal Button */}
      <div className="flex items-center justify-between gap-4">
        <Character 
          name="bunny"
          message={randomTip}
        />
        {/* <Button
          onClick={() => setIsManualInputOpen(true)}
          className="gradient-green text-white rounded-2xl h-11 px-6 shadow-lg btn-animation flex-shrink-0"
        >
          <Plus className="w-5 h-5 mr-1" />
          직접추가
        </Button> */}
      </div>

      {/* Recent Meals */}
      {loading ? (
        <Card className="p-6 border-0 shadow-lg bg-white rounded-3xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-3"></div>
            <p className="text-gray-500">식사 데이터를 불러오는 중...</p>
          </div>
        </Card>
      ) : (
        <RecentMeals 
          meals={meals}
          onAddMeal={handleAddMeal}
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
        />
      )}

      {/* Achievement Badges */}
      <AchievementSection meals={allMeals} />

      {/* Health Tip Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 오늘의 건강 팁</h3>
        <p className="text-gray-700">{randomTip}</p>
      </div>

      {/* Manual Input Modal */}
      <ManualInputModal
        open={isManualInputOpen}
        onOpenChange={setIsManualInputOpen}
        onSave={handleAddMeal}
      />
    </div>
  );
};

