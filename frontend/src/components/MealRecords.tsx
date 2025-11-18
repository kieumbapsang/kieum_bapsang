/**
 * MealRecords 컴포넌트 (시안 기반)
 *
 * Kids Mode 식사 기록 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 오늘의 식사: 아침, 점심, 저녁, 간식 (grid-cols-2 md:grid-cols-4)
 * - 기록됨: bg-white, border-gray-200
 * - 기록 안함: bg-gray-50, border-dashed, border-gray-300
 * - 총 칼로리 배지: bg-green-100, text-green-700
 * - 최근 식사 기록: 초기 1개 표시, 더보기/접기 버튼
 * - 영양 점수: 좋아요(80+), 보통(60-79), 개선필요(<60)
 */

import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/badge';
import { Button } from './ui/Button';
import {
  Coffee,
  Utensils,
  Moon,
  Apple,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  LucideIcon,
} from 'lucide-react';
import { ImageWithFallback } from './ui/ImageWithFallback';

/**
 * 식사 아이템 인터페이스
 */
interface MealItem {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  label: string;
  icon: LucideIcon;
  time?: string;
  items?: string[];
  calories?: number;
  recorded: boolean;
}

/**
 * 식사 기록 인터페이스
 */
interface MealRecord {
  id: string;
  date: string;
  time: string;
  mealType: string;
  items: string[];
  calories: number;
  imageUrl?: string;
  nutritionScore: number;
}

/**
 * 오늘의 식사 데이터 (시안 기준)
 */
const todayMeals: MealItem[] = [
  {
    type: 'breakfast',
    label: '아침',
    icon: Coffee,
    time: '08:30',
    items: ['우유', '식빵', '계란'],
    calories: 450,
    recorded: true,
  },
  {
    type: 'lunch',
    label: '점심',
    icon: Utensils,
    time: '12:20',
    items: ['김밥', '오렌지주스'],
    calories: 520,
    recorded: true,
  },
  {
    type: 'dinner',
    label: '저녁',
    icon: Moon,
    recorded: false,
  },
  {
    type: 'snack',
    label: '간식',
    icon: Apple,
    time: '15:00',
    items: ['사과'],
    calories: 95,
    recorded: true,
  },
];

/**
 * 최근 식사 기록 데이터 (시안 기준)
 */
const recentMeals: MealRecord[] = [
  {
    id: '1',
    date: '2025-10-30',
    time: '12:20',
    mealType: '점심',
    items: ['김밥', '오렌지주스', '바나나'],
    calories: 520,
    imageUrl:
      'https://images.unsplash.com/photo-1641130382532-2514a6c93859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMG1lYWx8ZW58MXx8fHwxNzYxNzE3MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    nutritionScore: 85,
  },
  {
    id: '2',
    date: '2025-10-30',
    time: '08:30',
    mealType: '아침',
    items: ['우유', '식빵', '계란'],
    calories: 450,
    imageUrl:
      'https://images.unsplash.com/photo-1578593139806-28d34e76f920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGVhdGluZyUyMGx1bmNofGVufDF8fHx8MTc2MTc5NDUwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    nutritionScore: 90,
  },
  {
    id: '3',
    date: '2025-10-29',
    time: '19:00',
    mealType: '저녁',
    items: ['라면', '주먹밥'],
    calories: 680,
    imageUrl:
      'https://images.unsplash.com/photo-1698466632388-77a7495b89b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb252ZW5pZW5jZSUyMHN0b3JlJTIwZm9vZHxlbnwxfHx8fDE3NjE3MzMzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    nutritionScore: 60,
  },
];

/**
 * 식사 타입별 색상 매핑
 */
const mealColors: Record<MealItem['type'], string> = {
  breakfast: '#FCD34D',
  lunch: '#FB923C',
  dinner: '#A78BFA',
  snack: '#FB7185',
};

/**
 * MealRecords 컴포넌트
 *
 * Kids Mode에서 사용자의 식사 기록을 표시합니다.
 * 오늘의 식사 현황과 최근 식사 기록을 보여주며,
 * 더보기/접기 기능으로 기록을 관리할 수 있습니다.
 *
 * @returns {React.ReactElement} MealRecords UI
 *
 * @example
 * ```tsx
 * <MealRecords />
 * ```
 */
export const MealRecords: React.FC = () => {
  const [showAllMeals, setShowAllMeals] = useState(false);

  /**
   * 총 칼로리 계산
   */
  const totalCalories = todayMeals
    .filter((m) => m.recorded)
    .reduce((sum, m) => sum + (m.calories || 0), 0);

  /**
   * 영양 점수에 따른 색상 반환
   */
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  /**
   * 영양 점수에 따른 라벨 반환
   */
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return '좋아요';
    if (score >= 60) return '보통';
    return '개선필요';
  };

  /**
   * 표시할 최근 식사 목록 (더보기/접기 상태에 따라)
   */
  const displayedMeals = showAllMeals ? recentMeals : recentMeals.slice(0, 1);

  return (
    <Card className="p-5 border-2">
      {/* 오늘의 식사 섹션 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900">오늘의 식사</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {totalCalories} kcal
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {todayMeals.map((meal) => {
            const Icon = meal.icon;

            return (
              <div
                key={meal.type}
                className={`p-3 rounded-xl border-2 transition-all ${
                  meal.recorded
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-dashed border-gray-300'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 mx-auto"
                  style={{
                    backgroundColor: meal.recorded
                      ? `${mealColors[meal.type]}30`
                      : '#E5E7EB',
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: meal.recorded ? mealColors[meal.type] : '#9CA3AF',
                    }}
                  />
                </div>
                <p className="text-center text-gray-900 mb-0.5">{meal.label}</p>
                {meal.recorded ? (
                  <>
                    <p className="text-center text-xs text-gray-500 mb-0.5">
                      {meal.time}
                    </p>
                    <p className="text-center text-xs text-gray-600 line-clamp-1">
                      {meal.items?.join(', ')}
                    </p>
                  </>
                ) : (
                  <p className="text-center text-xs text-gray-400">기록 안함</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t-2 border-gray-100 my-3"></div>

      {/* 최근 식사 기록 섹션 */}
      <div>
        <h3 className="text-gray-900 mb-3">최근 식사 기록</h3>
        <div className="space-y-2.5">
          {displayedMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex gap-3 p-3 border-2 border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer"
            >
              {meal.imageUrl && (
                <ImageWithFallback
                  src={meal.imageUrl}
                  alt={meal.mealType}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {meal.mealType}
                  </Badge>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: `${getScoreColor(meal.nutritionScore)}20`,
                      color: getScoreColor(meal.nutritionScore),
                    }}
                  >
                    {getScoreLabel(meal.nutritionScore)}
                  </Badge>
                </div>
                <p className="text-gray-900 mb-1 text-sm line-clamp-1">
                  {meal.items.join(', ')}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{meal.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{meal.time}</span>
                  </div>
                  <span className="font-semibold">{meal.calories} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recentMeals.length > 1 && (
          <Button
            variant="ghost"
            className="w-full mt-3 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => setShowAllMeals(!showAllMeals)}
          >
            {showAllMeals ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                더보기 ({recentMeals.length - 1}개)
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
