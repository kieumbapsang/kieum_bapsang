/**
 * TDD REFACTOR 단계: Mode State Store 구현
 *
 * Zustand를 사용한 Kids Mode 상태 관리 Store
 * - isKidsMode: 현재 모드 상태
 * - setKidsMode: 모드 변경 함수
 * - toggleMode: 모드 토글 함수
 * - localStorage 연동 (persistence)
 *
 * @module useModeStore
 * @description 전역 애플리케이션 모드 상태를 관리하는 Zustand Store
 * @see https://docs.pmnd.rs/zustand/getting-started/introduction
 */

import { create } from 'zustand';

/** localStorage 저장 키 상수 */
const STORAGE_KEY = 'mode' as const;

/** 기본 모드 상태 (Kids Mode 비활성화) */
const DEFAULT_MODE_STATE = false;

/**
 * localStorage에 저장되는 모드 데이터 구조
 */
interface ModeStorageData {
  isKidsMode: boolean;
}

/**
 * Mode State Store 인터페이스
 *
 * @interface ModeState
 * @property {boolean} isKidsMode - 현재 Kids Mode 활성화 여부
 * @property {function} setKidsMode - Kids Mode 상태를 직접 설정하는 함수
 * @property {function} toggleMode - 현재 모드를 반전시키는 함수
 */
interface ModeState {
  /** 현재 Kids Mode 활성화 여부 */
  isKidsMode: boolean;

  /**
   * Kids Mode 상태를 설정합니다.
   *
   * @param {boolean} value - 설정할 모드 값 (true: Kids Mode, false: Default Mode)
   */
  setKidsMode: (value: boolean) => void;

  /**
   * 현재 모드를 토글합니다 (Kids Mode ↔ Default Mode)
   */
  toggleMode: () => void;
}

/**
 * localStorage에서 초기 모드 상태를 로드합니다.
 *
 * @returns {boolean} 저장된 모드 상태 (없거나 에러 시 기본값 반환)
 *
 * @example
 * const initialMode = loadInitialState();
 * // Returns: false (기본값) 또는 저장된 값
 */
const loadInitialState = (): boolean => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return DEFAULT_MODE_STATE;
    }

    const parsed: ModeStorageData = JSON.parse(savedState);

    // 타입 검증: isKidsMode가 boolean인지 확인
    if (typeof parsed.isKidsMode !== 'boolean') {
      console.warn('Invalid mode state type in localStorage, using default');
      return DEFAULT_MODE_STATE;
    }

    return parsed.isKidsMode;
  } catch (error) {
    // localStorage 접근 실패 또는 JSON 파싱 에러 시 기본값 반환
    console.warn('Failed to load mode state from localStorage:', error);
    return DEFAULT_MODE_STATE;
  }
};

/**
 * localStorage에 모드 상태를 저장합니다.
 *
 * @param {boolean} isKidsMode - 저장할 모드 상태
 *
 * @remarks
 * 저장 실패 시에도 앱 상태는 유지되며, 경고만 표시됩니다.
 * QuotaExceededError 등의 에러가 발생해도 앱 동작에는 영향을 주지 않습니다.
 *
 * @example
 * saveToStorage(true);  // Kids Mode 저장
 * saveToStorage(false); // Default Mode 저장
 */
const saveToStorage = (isKidsMode: boolean): void => {
  try {
    const data: ModeStorageData = { isKidsMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // localStorage 저장 실패 시 경고만 표시 (상태는 유지)
    console.warn('Failed to save mode state to localStorage:', error);
  }
};

/**
 * Zustand Store: useModeStore
 *
 * 전역 모드 상태를 관리하는 스토어입니다.
 * Kids Mode와 Default Mode 간의 전환을 처리하고,
 * localStorage를 통해 상태를 영속화합니다.
 *
 * @example
 * ```tsx
 * // 컴포넌트에서 사용
 * function MyComponent() {
 *   const { isKidsMode, setKidsMode, toggleMode } = useModeStore();
 *
 *   return (
 *     <div>
 *       <p>현재 모드: {isKidsMode ? 'Kids Mode' : 'Default Mode'}</p>
 *       <button onClick={toggleMode}>모드 전환</button>
 *       <button onClick={() => setKidsMode(true)}>Kids Mode로 전환</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 특정 상태만 구독 (성능 최적화)
 * function KidsModeIndicator() {
 *   const isKidsMode = useModeStore((state) => state.isKidsMode);
 *   return <span>{isKidsMode ? '🧒' : '👤'}</span>;
 * }
 * ```
 */
export const useModeStore = create<ModeState>((set) => ({
  // 초기 상태: localStorage에서 로드
  isKidsMode: loadInitialState(),

  // Kids Mode 설정 함수
  setKidsMode: (value: boolean) => {
    set({ isKidsMode: value });
    saveToStorage(value);
  },

  // 모드 토글 함수 (최적화: set 콜백 내에서 저장까지 처리)
  toggleMode: () => {
    set((state) => {
      const newMode = !state.isKidsMode;
      saveToStorage(newMode);
      return { isKidsMode: newMode };
    });
  },
}));
