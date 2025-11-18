/**
 * TDD REFACTOR 단계: Mode Switch 컴포넌트
 *
 * @radix-ui/react-switch 기반 모드 전환 스위치
 * Kids Mode와 Default Mode 간 전환을 담당합니다.
 */

import React, { useState, useCallback, useMemo } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { useNavigate } from 'react-router-dom';
import { useModeStore } from '../../stores/useModeStore';
import { ConfirmDialog } from './ConfirmDialog';

/** 모드 이름 상수 */
const MODE_NAMES = {
  KIDS: 'Kids Mode',
  DEFAULT: '기본 모드',
} as const;

/** 모드 설명 상수 */
const MODE_DESCRIPTIONS = {
  KIDS: 'Kids Mode (키즈 모드)',
  DEFAULT: '기본 모드 (Default Mode)',
} as const;

/** 다이얼로그 텍스트 상수 */
const DIALOG_TEXT = {
  TITLE: '모드 변경',
  CONFIRM: '변경',
  CANCEL: '취소',
} as const;

/** UI 텍스트 상수 */
const UI_TEXT = {
  SECTION_TITLE: '모드 전환',
  CURRENT_MODE_PREFIX: '현재 모드: ',
  SWITCH_ARIA_LABEL: '모드 전환 스위치',
} as const;

/**
 * ModeSwitch 컴포넌트의 Props 인터페이스
 */
export interface ModeSwitchProps {
  /**
   * 추가 CSS 클래스명
   * @example "mt-4 shadow-lg"
   */
  className?: string;
}

/**
 * Mode Switch 컴포넌트
 *
 * Kids Mode와 Default Mode를 전환하는 토글 스위치입니다.
 * 모드 변경 시 확인 다이얼로그를 표시하여 의도하지 않은 변경을 방지합니다.
 *
 * **주요 기능:**
 * - Radix UI Switch를 사용한 접근 가능한 토글
 * - 모드 변경 전 확인 다이얼로그 표시
 * - localStorage를 통한 모드 상태 영속화 (useModeStore)
 * - 키보드 및 스크린 리더 지원
 *
 * **접근성:**
 * - ARIA role="switch" 지원
 * - aria-label로 스크린 리더 지원
 * - 키보드 네비게이션 지원 (Space, Enter)
 *
 * @param {ModeSwitchProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} Mode Switch UI
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ModeSwitch />
 *
 * // 커스텀 스타일 적용
 * <ModeSwitch className="my-4 shadow-md" />
 * ```
 */
export const ModeSwitch: React.FC<ModeSwitchProps> = ({ className }) => {
  const { isKidsMode, setKidsMode } = useModeStore();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<boolean | null>(null);

  /**
   * 스위치 상태 변경 핸들러
   * 다이얼로그를 표시하고 변경하려는 모드를 임시 저장합니다.
   *
   * @param {boolean} checked - 새로운 스위치 상태 (true: Kids Mode, false: Default Mode)
   */
  const handleSwitchChange = useCallback((checked: boolean) => {
    setPendingMode(checked);
    setIsDialogOpen(true);
  }, []);

  /**
   * 모드 변경 확인 핸들러
   * 사용자가 다이얼로그에서 '변경'을 선택했을 때 실제로 모드를 변경합니다.
   * 모드 변경 후 해당 모드의 홈 화면으로 자동 이동합니다.
   */
  const handleConfirm = useCallback(() => {
    if (pendingMode !== null) {
      setKidsMode(pendingMode);
      // 모드 변경 후 해당 모드의 홈 화면으로 이동
      navigate('/home');
    }
    setPendingMode(null);
    setIsDialogOpen(false);
  }, [pendingMode, setKidsMode, navigate]);

  /**
   * 모드 변경 취소 핸들러
   * 사용자가 다이얼로그에서 '취소'를 선택했을 때 변경을 취소합니다.
   */
  const handleCancel = useCallback(() => {
    setPendingMode(null);
    setIsDialogOpen(false);
  }, []);

  /**
   * 다이얼로그에 표시할 대상 모드 (변경하려는 모드 또는 현재 모드)
   */
  const targetMode = pendingMode !== null ? pendingMode : isKidsMode;

  /**
   * 대상 모드의 이름
   */
  const targetModeName = useMemo(
    () => (targetMode ? MODE_NAMES.KIDS : MODE_NAMES.DEFAULT),
    [targetMode]
  );

  /**
   * 현재 모드 표시 텍스트
   */
  const currentModeText = useMemo(
    () => (isKidsMode ? MODE_DESCRIPTIONS.KIDS : MODE_DESCRIPTIONS.DEFAULT),
    [isKidsMode]
  );

  /**
   * 다이얼로그 설명 텍스트
   */
  const dialogDescription = useMemo(
    () => `정말 ${targetModeName}(으)로 변경하시겠습니까?`,
    [targetModeName]
  );

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{UI_TEXT.SECTION_TITLE}</h3>
            <p className="text-sm text-gray-600">
              {UI_TEXT.CURRENT_MODE_PREFIX}
              <span className="font-medium">{currentModeText}</span>
            </p>
          </div>

          <Switch.Root
            checked={isKidsMode}
            onCheckedChange={handleSwitchChange}
            className="w-14 h-8 rounded-full bg-gray-200 data-[state=checked]:bg-primary transition-colors relative cursor-pointer"
            aria-label={UI_TEXT.SWITCH_ARIA_LABEL}
          >
            <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7 shadow-md" />
          </Switch.Root>
        </div>
      </div>

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={DIALOG_TEXT.TITLE}
        description={dialogDescription}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={DIALOG_TEXT.CONFIRM}
        cancelText={DIALOG_TEXT.CANCEL}
      />
    </div>
  );
};
