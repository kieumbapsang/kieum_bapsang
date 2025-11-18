/**
 * AchievementSection 컴포넌트
 *
 * Kids Mode 배지 시스템 컴포넌트
 * 
 * 9개의 배지:
 * - 연속 기록 배지 (4개): 3일, 5일, 7일, 14일 연속
 * - 첫 식사 기록 뱃지 (1개)
 * - 총 기록 수 뱃지 (1개)
 * - 패턴 뱃지 (3개): 아침, 점심, 저녁 패턴
 */

import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Trophy, Flame, LucideIcon, Target, Coffee, Utensils, Moon, Sparkles } from 'lucide-react';
import { MealRecord } from './RecentMeals';

/**
 * 배지 데이터 인터페이스
 */
interface Achievement {
  /**
   * 고유 ID
   */
  id: string;

  /**
   * 배지 아이콘 컴포넌트
   */
  icon: LucideIcon;

  /**
   * 배지 제목
   */
  title: string;

  /**
   * 배지 설명
   */
  description: string;

  /**
   * 배지 색상 (HEX)
   */
  color: string;

  /**
   * 잠금 해제 여부
   */
  unlocked: boolean;
}

interface AchievementSectionProps {
  /**
   * 식사 기록 목록
   */
  meals: MealRecord[];
}

/**
 * 시간대 구분 함수
 * @param time HH:mm 형식의 시간 문자열
 * @returns '아침' | '점심' | '저녁'
 */
const getMealPeriod = (time: string): '아침' | '점심' | '저녁' => {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 11) return '아침';
  if (hour < 15) return '점심';
  return '저녁';
};

/**
 * 날짜 문자열을 Date 객체로 변환
 */
const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Date를 YYYY-MM-DD 형식의 문자열로 변환
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * AchievementSection 컴포넌트
 *
 * Kids Mode에서 사용자의 달성 배지를 표시하는 섹션입니다.
 * 식사 기록을 기반으로 뱃지 잠금 해제 상태를 계산합니다.
 *
 * @param meals - 식사 기록 목록
 * @returns {React.ReactElement} AchievementSection UI
 *
 * @example
 * ```tsx
 * <AchievementSection meals={meals} />
 * ```
 */
export const AchievementSection: React.FC<AchievementSectionProps> = ({ meals }) => {
  // 뱃지 상태 계산
  const badgeStates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 첫 식사 기록 뱃지
    const hasFirstMeal = meals.length > 0;

    // 총 기록 수
    const totalMealCount = meals.length;

    // 날짜별 식사 기록 집계
    const mealsByDate: Record<string, boolean> = {};
    const mealsByDateAndPeriod: Record<string, Record<string, boolean>> = {};

    meals.forEach((meal) => {
      // 날짜 추출 (date 필드가 있으면 사용, 없으면 오늘 날짜로 처리)
      const mealDate = meal.date 
        ? parseDate(meal.date)
        : today;
      const dateKey = formatDate(mealDate);
      mealsByDate[dateKey] = true;

      // 시간대별 기록
      const period = getMealPeriod(meal.time);
      if (!mealsByDateAndPeriod[dateKey]) {
        mealsByDateAndPeriod[dateKey] = {};
      }
      mealsByDateAndPeriod[dateKey][period] = true;
    });

    // 연속 기록 계산 (최근 N일간 매일 식사 기록 존재)
    const checkStreak = (days: number): boolean => {
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = formatDate(checkDate);
        if (!mealsByDate[dateKey]) {
          return false;
        }
      }
      return true;
    };

    // 패턴 뱃지 계산 (특정 시간대에 7일 연속 기록)
    const checkPattern = (period: '아침' | '점심' | '저녁'): boolean => {
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = formatDate(checkDate);
        if (!mealsByDateAndPeriod[dateKey]?.[period]) {
          return false;
        }
      }
      return true;
    };

    return {
      streak_3: checkStreak(3),
      streak_5: checkStreak(5),
      streak_7: checkStreak(7),
      streak_14: checkStreak(14),
      first_meal: hasFirstMeal,
      total_count: totalMealCount,
      breakfast_pattern: checkPattern('아침'),
      lunch_pattern: checkPattern('점심'),
      dinner_pattern: checkPattern('저녁'),
    };
  }, [meals]);

  // 배지 목록 정의
  const achievements: Achievement[] = [
    // 연속 기록 배지
    {
      id: 'streak_3',
      icon: Flame,
      title: '3일 연속 기록',
      description: '최근 3일간 매일 식사 기록',
      color: '#EF4444',
      unlocked: badgeStates.streak_3,
    },
    {
      id: 'streak_5',
      icon: Flame,
      title: '5일 연속 기록',
      description: '최근 5일간 매일 식사 기록',
      color: '#F59E0B',
      unlocked: badgeStates.streak_5,
    },
    {
      id: 'streak_7',
      icon: Flame,
      title: '7일 연속 기록',
      description: '최근 7일간 매일 식사 기록',
      color: '#F97316',
      unlocked: badgeStates.streak_7,
    },
    {
      id: 'streak_14',
      icon: Flame,
      title: '14일 연속 기록',
      description: '최근 14일간 매일 식사 기록',
      color: '#DC2626',
      unlocked: badgeStates.streak_14,
    },
    // 첫 식사 기록 뱃지
    {
      id: 'first_meal',
      icon: Sparkles,
      title: '첫 식사 기록',
      description: '식사 데이터 처음 등록',
      color: '#10B981',
      unlocked: badgeStates.first_meal,
    },
    // 총 기록 수 뱃지
    {
      id: 'total_count',
      icon: Target,
      title: `총 ${badgeStates.total_count}개 기록`,
      description: '등록한 식사 데이터 개수',
      color: '#3B82F6',
      unlocked: badgeStates.total_count > 0,
    },
    // 패턴 뱃지
    {
      id: 'breakfast_pattern',
      icon: Coffee,
      title: '아침 패턴',
      description: '아침 시간 7일 연속 기록',
      color: '#FCD34D',
      unlocked: badgeStates.breakfast_pattern,
    },
    {
      id: 'lunch_pattern',
      icon: Utensils,
      title: '점심 패턴',
      description: '점심 시간 7일 연속 기록',
      color: '#FB923C',
      unlocked: badgeStates.lunch_pattern,
    },
    {
      id: 'dinner_pattern',
      icon: Moon,
      title: '저녁 패턴',
      description: '저녁 시간 7일 연속 기록',
      color: '#A78BFA',
      unlocked: badgeStates.dinner_pattern,
    },
  ];

  return (
    <Card className="p-6 border-2 bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h3 className="text-gray-900">나의 배지</h3>
      </div>

      {/* 배지 그리드 - 3열 그리드로 9개 배지 표시 */}
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;

          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                achievement.unlocked
                  ? 'bg-white border-gray-200 hover:scale-105 cursor-pointer'
                  : 'bg-gray-100 border-gray-200 opacity-50'
              }`}
            >
              {/* 아이콘 컨테이너 */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  achievement.unlocked ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor: achievement.unlocked
                    ? `${achievement.color}20`
                    : '#E5E7EB',
                }}
              >
                <Icon
                  className="w-8 h-8"
                  style={{
                    color: achievement.unlocked ? achievement.color : '#9CA3AF',
                  }}
                />
              </div>

              {/* 배지 제목 */}
              <p className="text-sm text-gray-900 font-semibold mb-1">
                {achievement.title}
              </p>

              {/* 배지 설명 */}
              <p className="text-xs text-gray-600 mb-2">
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
