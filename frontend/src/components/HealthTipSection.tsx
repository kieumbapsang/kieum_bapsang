/**
 * TDD GREEN 단계: HealthTipSection 컴포넌트
 *
 * Kids Mode 건강 팁 섹션 컴포넌트
 *
 * **기능:**
 * - 랜덤 건강 팁 표시
 * - 이모지 및 제목 표시
 * - 커스텀 팁 배열 지원
 * - useMemo를 사용한 팁 고정 (리렌더링 시 변경 방지)
 */

import React, { useMemo } from 'react';

/**
 * 기본 건강 팁 목록
 */
const DEFAULT_HEALTH_TIPS = [
  '점심 식사 후 30분 정도 걷기를 하면 소화도 잘 되고 기분도 좋아져요!',
  '하루에 물 6~8잔을 마시면 건강에 좋아요!',
  '아침을 꼭 챙겨 먹으면 하루를 활기차게 시작할 수 있어요!',
  '과일과 채소를 다양한 색깔로 먹으면 영양소를 골고루 섭취할 수 있어요!',
  '식사할 때는 천천히 꼭꼭 씹어 먹는 것이 좋아요!',
  '야식보다는 일찍 저녁을 먹으면 숙면에 도움이 돼요!',
  '간식은 과자보다 과일이나 견과류를 선택하는 게 좋아요!',
  '매일 규칙적인 시간에 식사하면 건강에 도움이 돼요!',
  '단 음료보다는 물이나 우유를 마시는 게 더 건강해요!',
  '식사 전에 손을 깨끗이 씻는 습관을 길러요!',
];

/**
 * HealthTipSection Props 인터페이스
 */
export interface HealthTipSectionProps {
  /**
   * 커스텀 건강 팁 배열 (선택적)
   * 제공되지 않으면 기본 팁 사용
   */
  tips?: string[];

  /**
   * 추가 CSS 클래스명 (선택적)
   */
  className?: string;
}

/**
 * HealthTipSection 컴포넌트
 *
 * Kids Mode에서 사용되는 건강 팁 섹션입니다.
 * 랜덤으로 선택된 건강 팁을 이모지와 함께 표시합니다.
 *
 * **주요 기능:**
 * - 랜덤 팁 선택 (useMemo로 고정)
 * - 커스텀 팁 배열 지원
 * - 친근한 이모지 표시
 * - 중앙 정렬 레이아웃
 *
 * @param {HealthTipSectionProps} props - 컴포넌트 속성
 * @returns {React.ReactElement | null} HealthTipSection UI
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <HealthTipSection />
 *
 * // 커스텀 팁 사용
 * <HealthTipSection tips={['커스텀 팁 1', '커스텀 팁 2']} />
 * ```
 */
export const HealthTipSection: React.FC<HealthTipSectionProps> = ({
  tips,
  className = '',
}) => {
  /**
   * 사용할 팁 배열 (커스텀 또는 기본)
   */
  const tipsList = tips && tips.length > 0 ? tips : DEFAULT_HEALTH_TIPS;

  /**
   * 랜덤 건강 팁 선택 (컴포넌트 마운트 시 1회만)
   */
  const randomTip = useMemo(() => {
    if (tipsList.length === 0) {
      return null;
    }
    return tipsList[Math.floor(Math.random() * tipsList.length)];
  }, [tipsList]);

  // 팁이 없으면 렌더링하지 않음
  if (!randomTip) {
    return null;
  }

  return (
    <p className={`text-gray-700 text-center ${className}`}>
      💡 <span className="font-semibold">오늘의 건강 팁!</span> {randomTip}
    </p>
  );
};
