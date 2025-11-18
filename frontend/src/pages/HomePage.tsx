import React, { useState, useMemo } from 'react';
import { Character } from '../components/Character';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { getRandomTip } from '../utils/randomTips';
import { RecentMeals, MealRecord } from '../components/RecentMeals';
import { AchievementSection } from '../components/AchievementSection';
import { ManualInputModal } from '../components/modals/ManualInputModal';

/**
 * HomePage Props 인터페이스
 */
export interface HomePageProps {
  onNavigateToStore?: () => void;
}

/**
 * HomePage 컴포넌트 - 키즈모드 메인 페이지
 * 
 * 새 디자인 적용:
 * - 캐릭터와 랜덤 팁
 * - 직접 추가 버튼
 * - RecentMeals (식사 기록)
 * - AchievementSection (성취 배지)
 */
// 초기 식사 데이터 생성 (테스트용)
const getInitialMeals = (): MealRecord[] => {
  const today = new Date();
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: "1",
      time: "12:20",
      foodName: "김밥",
      calories: 320,
      grams: 250,
      date: formatDate(today), // 오늘
    },
    {
      id: "2",
      time: "08:30",
      foodName: "우유",
      calories: 130,
      grams: 200,
      date: formatDate(today), // 오늘
    },
    {
      id: "3",
      time: "19:00",
      foodName: "라면",
      calories: 500,
      grams: 400,
      date: formatDate(today), // 오늘
    },
    {
      id: "4",
      time: "14:15",
      foodName: "사과",
      calories: 95,
      grams: 180,
      date: formatDate(today), // 오늘
    },
  ];
};

const initialMeals: MealRecord[] = getInitialMeals();

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToStore }) => {
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [meals, setMeals] = useState<MealRecord[]>(initialMeals);
  const randomTip = useMemo(() => getRandomTip(), []);

  const handleAddMeal = (meal: MealRecord) => {
    setMeals([meal, ...meals]);
  };

  const handleUpdateMeal = (updatedMeal: MealRecord) => {
    setMeals(meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Welcome Character & Add Meal Button */}
      <div className="flex items-center justify-between gap-4">
        <Character 
          name="bunny"
          message={randomTip}
        />
        <Button
          onClick={() => setIsManualInputOpen(true)}
          className="gradient-green text-white rounded-2xl h-11 px-6 shadow-lg btn-animation flex-shrink-0"
        >
          <Plus className="w-5 h-5 mr-1" />
          직접추가
        </Button>
      </div>

      {/* Recent Meals */}
      <RecentMeals 
        meals={meals}
        onAddMeal={handleAddMeal}
        onUpdateMeal={handleUpdateMeal}
        onDeleteMeal={handleDeleteMeal}
      />

      {/* Achievement Badges */}
      <AchievementSection meals={meals} />

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

