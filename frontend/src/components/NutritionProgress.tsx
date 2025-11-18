/**
 * NutritionProgress 컴포넌트 (시안 기반)
 *
 * Kids Mode 영양 진행률 표시 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 큰 프로그레스 바 (green/yellow/red 색상 코딩)
 * - 큰 아이콘
 * - 피드백 메시지 ("잘하고 있어요!", "조금만 더!", "더 필요해요")
 * - 진행률 퍼센트 표시
 */

import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

/**
 * NutritionProgress Props 인터페이스
 */
export interface NutritionProgressProps {
  /**
   * 현재 섭취량
   */
  current: number;

  /**
   * 목표 섭취량
   */
  target: number;

  /**
   * 영양소 라벨 (예: "칼로리", "단백질")
   */
  label: string;

  /**
   * 단위 (기본값: "")
   */
  unit?: string;
}

/**
 * NutritionProgress 컴포넌트
 *
 * Kids Mode에서 영양 진행률을 시각적으로 표시합니다.
 * 진행률에 따라 색상과 메시지가 변경됩니다:
 * - 80% 이상: 초록색 + "잘하고 있어요!"
 * - 60-79%: 노란색 + "조금만 더!"
 * - 60% 미만: 빨간색 + "더 필요해요"
 *
 * @param {NutritionProgressProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} NutritionProgress UI
 *
 * @example
 * ```tsx
 * <NutritionProgress current={80} target={100} label="칼로리" unit="kcal" />
 * ```
 */
export const NutritionProgress: React.FC<NutritionProgressProps> = ({
  current,
  target,
  label,
  unit = '',
}) => {
  /**
   * 진행률 계산 (0-100%)
   */
  const percentage = useMemo(() => {
    const calculated = (current / target) * 100;
    return Math.min(calculated, 100); // 최대 100%
  }, [current, target]);

  /**
   * 진행률에 따른 상태 정보
   */
  const status = useMemo(() => {
    if (percentage >= 80) {
      return {
        color: 'green',
        bgColor: 'bg-green-500',
        lightBg: 'bg-green-50',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        message: '잘하고 있어요!',
      };
    } else if (percentage >= 60) {
      return {
        color: 'yellow',
        bgColor: 'bg-yellow-500',
        lightBg: 'bg-yellow-50',
        icon: AlertCircle,
        iconColor: 'text-yellow-600',
        message: '조금만 더!',
      };
    } else {
      return {
        color: 'red',
        bgColor: 'bg-red-500',
        lightBg: 'bg-red-50',
        icon: XCircle,
        iconColor: 'text-red-600',
        message: '더 필요해요',
      };
    }
  }, [percentage]);

  const Icon = status.icon;

  return (
    <Card className={`p-6 border-2 ${status.lightBg}`}>
      <div className="flex items-center gap-4">
        {/* 아이콘 */}
        <div className={`w-16 h-16 ${status.lightBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-12 h-12 ${status.iconColor}`} />
        </div>

        {/* 프로그레스 정보 */}
        <div className="flex-1">
          {/* 라벨 및 메시지 */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-900 font-semibold">{label}</h4>
            <span className={`text-sm font-semibold ${status.iconColor}`}>{status.message}</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${status.bgColor} transition-all duration-500 rounded-full`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* 수치 표시 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {current.toFixed(1)}
              {unit} / {target.toFixed(1)}
              {unit}
            </span>
            <span className="text-gray-900 font-semibold">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
