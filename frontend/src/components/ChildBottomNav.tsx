/**
 * 키즈모드 전용 하단 네비게이션
 * 새 디자인 적용 - 그라데이션 활성 탭, 애니메이션 효과
 */

import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, MapPin, User, LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

export interface ChildBottomNavProps {
  className?: string;
}

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
  ariaLabel: string;
  gradient: string; // 새 디자인: 각 탭별 그라데이션
}

// 네비게이션 아이템 배열 - 새 디자인 그라데이션 추가
const NAV_ITEMS: NavItem[] = [
  {
    path: '/home',
    label: '홈',
    Icon: Home,
    ariaLabel: '홈',
    gradient: 'gradient-green', // from-green-400 to-emerald-500
  },
  {
    path: '/growth',
    label: '성장기록',
    Icon: TrendingUp,
    ariaLabel: '성장기록',
    gradient: 'gradient-blue', // from-blue-400 to-cyan-500
  },
  {
    path: '/stores',
    label: '가맹점',
    Icon: MapPin,
    ariaLabel: '가맹점',
    gradient: 'gradient-purple', // from-purple-400 to-pink-500
  },
  {
    path: '/mypage',
    label: '내정보',
    Icon: User,
    ariaLabel: '내정보',
    gradient: 'gradient-orange', // from-orange-400 to-yellow-500
  },
];

export const ChildBottomNav: React.FC<ChildBottomNavProps> = ({ className }) => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        const Icon = item.Icon;

        if (active) {
          // 활성 탭 - 새 디자인 적용
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1"
              aria-label={item.ariaLabel}
              aria-current="page"
            >
              <div className={`nav-tab ${item.gradient} text-white nav-tab-active`}>
                <Icon className="w-7 h-7" aria-hidden="true" />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            </Link>
          );
        }

        // 비활성 탭
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex-1"
            aria-label={item.ariaLabel}
          >
            <div className="nav-tab text-gray-600 hover:text-green-600 hover:bg-green-50">
              <Icon className="w-7 h-7" aria-hidden="true" />
              <span className="text-xs font-semibold">{item.label}</span>
            </div>
          </Link>
        );
      }),
    [location.pathname]
  );

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-0 shadow-2xl rounded-t-[2rem] z-50 ${className || ''}`}
      role="navigation"
      aria-label="키즈모드 메인 네비게이션"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-4 gap-3">
          {navItems}
        </div>
      </div>
    </nav>
  );
};