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

import React, { useMemo, useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Trophy, Flame, LucideIcon, Target, Coffee, Utensils, Moon, Sparkles } from 'lucide-react';
import { MealRecord } from './RecentMeals';
import { api } from '../api/client';

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
   * 식사 기록 목록 (총 기록 수 계산용)
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
  // YYYY-MM-DD 형식 또는 ISO 형식 처리
  const dateStr = dateString.split('T')[0]; // ISO 형식인 경우 T 이전 부분만 사용
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0); // 시간을 0으로 설정하여 날짜만 비교
  return date;
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
  const [badgeTypes, setBadgeTypes] = useState<string[]>([]);
  const [totalMealCount, setTotalMealCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 백엔드에서 뱃지 데이터와 총 식사 기록 수 가져오기
  useEffect(() => {
    const fetchBadgesAndStats = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          console.warn('사용자 ID가 없습니다.');
          setBadgeTypes([]);
          setTotalMealCount(0);
          setLoading(false);
          return;
        }

        // 뱃지 데이터와 식사 통계를 병렬로 가져오기
        const [badgesResult, statsResult] = await Promise.all([
          api.badges.getMyBadges(parseInt(userId)),
          api.badges.getMealStats(parseInt(userId))
        ]);

        // 뱃지 데이터 처리
        if (badgesResult.error) {
          console.error('뱃지 조회 실패:', badgesResult.error);
          setBadgeTypes([]);
        } else if (badgesResult.data && badgesResult.data.badges) {
          const badgeStrings = badgesResult.data.badges.map((badge: string) => badge);
          console.log('✅ 백엔드에서 받은 뱃지:', badgeStrings);
          setBadgeTypes(badgeStrings);
        } else {
          setBadgeTypes([]);
        }

        // 총 식사 기록 수 처리
        if (statsResult.error) {
          console.error('식사 통계 조회 실패:', statsResult.error);
          setTotalMealCount(meals.length); // 폴백: 전달받은 meals 길이 사용
        } else if (statsResult.data && typeof statsResult.data.total_meals === 'number') {
          console.log('✅ 백엔드에서 받은 총 식사 기록 수:', statsResult.data.total_meals);
          setTotalMealCount(statsResult.data.total_meals);
        } else {
          setTotalMealCount(meals.length); // 폴백: 전달받은 meals 길이 사용
        }
      } catch (error) {
        console.error('뱃지/통계 조회 중 오류:', error);
        setBadgeTypes([]);
        setTotalMealCount(meals.length); // 폴백: 전달받은 meals 길이 사용
      } finally {
        setLoading(false);
      }
    };

    fetchBadgesAndStats();
  }, [meals]); // meals가 변경되면 다시 조회

  // 뱃지 상태 계산
  const badgeStates = useMemo(() => {
    // 백엔드에서 받은 뱃지 타입을 기반으로 상태 계산
    const hasBadge = (badgeType: string) => badgeTypes.includes(badgeType);

    return {
      streak_3: hasBadge('THREE_MEALS_A_DAY'),
      streak_5: hasBadge('FIVE_MEALS_A_DAY'),
      streak_7: hasBadge('SEVEN_MEALS_A_DAY'),
      streak_14: hasBadge('FOURTEEN_MEALS_A_DAY'),
      first_meal: hasBadge('FIRST_MEAL'),
      total_count: totalMealCount, // 백엔드에서 가져온 총 식사 기록 수 사용
      breakfast_pattern: hasBadge('SEVEN_MORNING_MEALS'),
      lunch_pattern: hasBadge('SEVEN_LUNCH_MEALS'),
      dinner_pattern: hasBadge('SEVEN_DINNER_MEALS'),
    };
  }, [badgeTypes, totalMealCount]);

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
