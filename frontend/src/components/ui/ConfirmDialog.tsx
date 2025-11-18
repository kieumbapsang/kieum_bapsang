/**
 * TDD REFACTOR 단계: Confirmation Dialog 컴포넌트
 *
 * @radix-ui/react-dialog 기반 확인 다이얼로그
 * 사용자 액션에 대한 확인을 요청하는 재사용 가능한 모달 다이얼로그입니다.
 */

import React, { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

/** 기본 버튼 텍스트 상수 */
const DEFAULT_BUTTON_TEXT = {
  CONFIRM: '확인',
  CANCEL: '취소',
} as const;

/**
 * ConfirmDialog 컴포넌트의 Props 인터페이스
 */
export interface ConfirmDialogProps {
  /**
   * 다이얼로그 열림 상태
   */
  open: boolean;

  /**
   * 열림 상태 변경 핸들러
   * @param {boolean} open - 새로운 열림 상태
   */
  onOpenChange: (open: boolean) => void;

  /**
   * 다이얼로그 제목
   */
  title: string;

  /**
   * 다이얼로그 설명 텍스트
   */
  description: string;

  /**
   * 확인 버튼 클릭 핸들러
   * 다이얼로그는 자동으로 닫힙니다.
   */
  onConfirm: () => void;

  /**
   * 취소 버튼 클릭 핸들러
   * 다이얼로그는 자동으로 닫힙니다.
   */
  onCancel: () => void;

  /**
   * 확인 버튼 텍스트 (선택적)
   * @default "확인"
   */
  confirmText?: string;

  /**
   * 취소 버튼 텍스트 (선택적)
   * @default "취소"
   */
  cancelText?: string;
}

/**
 * Confirmation Dialog 컴포넌트
 *
 * 사용자의 중요한 액션에 대해 확인을 요청하는 모달 다이얼로그입니다.
 * Radix UI Dialog를 기반으로 하여 접근성과 키보드 네비게이션을 지원합니다.
 *
 * **주요 기능:**
 * - ESC 키로 다이얼로그 닫기 (취소 동작 실행)
 * - 오버레이 클릭으로 닫기
 * - 포커스 트랩 (다이얼로그 내부에 포커스 유지)
 * - 포커스 복원 (닫힐 때 원래 요소로 포커스 복귀)
 *
 * **접근성:**
 * - ARIA role="dialog" 지원
 * - Dialog.Title과 Dialog.Description으로 스크린 리더 지원
 * - 키보드 네비게이션 지원 (Tab, ESC)
 *
 * @param {ConfirmDialogProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} Confirmation Dialog UI
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="삭제 확인"
 *   description="정말 삭제하시겠습니까?"
 *   onConfirm={handleDelete}
 *   onCancel={() => console.log('취소됨')}
 * />
 *
 * // 커스텀 버튼 텍스트
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="모드 변경"
 *   description="정말 모드를 변경하시겠습니까?"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   confirmText="변경"
 *   cancelText="유지"
 * />
 * ```
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = DEFAULT_BUTTON_TEXT.CONFIRM,
  cancelText = DEFAULT_BUTTON_TEXT.CANCEL,
}) => {
  /**
   * 확인 버튼 클릭 핸들러
   * 사용자 제공 onConfirm 콜백을 실행하고 다이얼로그를 닫습니다.
   */
  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  /**
   * 취소 버튼 클릭 핸들러
   * 사용자 제공 onCancel 콜백을 실행하고 다이얼로그를 닫습니다.
   */
  const handleCancel = useCallback(() => {
    onCancel();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg z-50 max-w-md w-[90%]"
          onEscapeKeyDown={handleCancel}
        >
          <Dialog.Title className="text-xl font-semibold mb-3">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            {description}
          </Dialog.Description>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
