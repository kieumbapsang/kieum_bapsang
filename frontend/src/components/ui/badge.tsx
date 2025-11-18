/**
 * Badge 컴포넌트 (시안 기반)
 *
 * 작은 라벨 또는 상태 표시 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - variant: default, secondary, outline
 * - 기본 스타일: inline-flex, rounded-md, text-xs, px-2, py-0.5
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge 스타일 변형
   */
  variant?: 'default' | 'secondary' | 'outline';
}

/**
 * Badge 컴포넌트
 *
 * 작은 라벨이나 상태를 표시하는 데 사용됩니다.
 *
 * @param {BadgeProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} Badge UI
 *
 * @example
 * ```tsx
 * <Badge>기본 배지</Badge>
 * <Badge variant="secondary">보조 배지</Badge>
 * <Badge className="bg-green-100 text-green-700">커스텀 배지</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'border-transparent bg-primary text-white',
    secondary: 'border-transparent bg-neutral-100 text-neutral-700',
    outline: 'text-neutral-700 border-neutral-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
