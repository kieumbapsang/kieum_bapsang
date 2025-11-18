/**
 * WeeklyGoal 컴포넌트 (시안 기반)
 *
 * Kids Mode 주간 목표 시각화 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 프로그레스 바
 * - 퍼센트 표시
 * - 동기부여 메시지
 * - 보상 힌트 (목표 달성 시)
 * - 큰 아이콘
 */

import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Target, Gift, Sparkles } from 'lucide-react';

/**
 * WeeklyGoal Props 인터페이스
 */
export interface WeeklyGoalProps {
  /**
   * 현재 달성 일수
   */
  current: number;

  /**
   * 목표 일수
   */
  target: number;
}

/**
 * WeeklyGoal 컴포넌트
 *
 * Kids Mode에서 주간 목표 달성 현황을 시각적으로 표시합니다.
 * 진행률에 따라 동기부여 메시지가 변경되며,
 * 목표 달성 시 보상 힌트가 표시됩니다.
 *
 * 메시지 단계:
 * - 50% 미만: "힘내요!"
 * - 50-79%: "거의 다 왔어요!"
 * - 80-99%: "정말 잘하고 있어요!"
 * - 100%: "목표 달성!" + 보상 힌트
 *
 * @param {WeeklyGoalProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} WeeklyGoal UI
 *
 * @example
 * ```tsx
 * <WeeklyGoal current={5} target={7} />
 * ```
 */
export const WeeklyGoal: React.FC<WeeklyGoalProps> = ({ current, target }) => {
  /**
   * 진행률 계산 (0-100%)
   */
  const percentage = useMemo(() => {
    const calculated = (current / target) * 100;
    return Math.min(calculated, 100); // 최대 100%
  }, [current, target]);

  /**
   * 목표 달성 여부
   */
  const isCompleted = percentage >= 100;

  /**
   * 진행률에 따른 메시지
   */
  const message = useMemo(() => {
    if (percentage >= 100) {
      return '목표 달성! 🎉';
    } else if (percentage >= 80) {
      return '정말 잘하고 있어요!';
    } else if (percentage >= 50) {
      return '거의 다 왔어요!';
    } else {
      return '힘내요!';
    }
  }, [percentage]);

  /**
   * 프로그레스 바 색상
   */
  const progressColor = useMemo(() => {
    if (percentage >= 100) {
      return 'bg-gradient-to-r from-green-400 to-emerald-500';
    } else if (percentage >= 80) {
      return 'bg-green-500';
    } else if (percentage >= 50) {
      return 'bg-yellow-500';
    } else {
      return 'bg-orange-500';
    }
  }, [percentage]);

  return (
    <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          이번 주 목표
        </h3>
        {isCompleted && <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />}
      </div>

      {/* 프로그레스 바 */}
      <div className="mb-4">
        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* 달성 정보 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600">
          {current}일 / {target}일
        </span>
        <span className="text-2xl font-bold text-purple-600">{percentage.toFixed(0)}%</span>
      </div>

      {/* 동기부여 메시지 */}
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{message}</p>
      </div>

      {/* 보상 힌트 (목표 달성 시만 표시) */}
      {isCompleted && (
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300 flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 font-semibold">보상이 기다리고 있어요!</p>
        </div>
      )}
    </Card>
  );
};
