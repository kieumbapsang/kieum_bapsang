/**
 * 사용자 정보 관리 Context
 * - 전역적으로 사용자 정보(키, 몸무게, 나이, 거주지 등) 관리
 * - 로그인 후 추가 정보 입력 시 저장되며 앱 전체에서 사용
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 보호자 정보 타입
interface GuardianInfo {
  name: string;          // 보호자 이름
  phone: string;         // 보호자 연락처
  relationship: string;  // 관계 (부모, 조부모 등)
}

// 사용자 정보 타입
interface UserInfo {
  name: string;          // 사용자 이름
  email: string;         // 이메일
  height: string;        // 키 (cm)
  weight: string;        // 몸무게 (kg)
  age: string;           // 나이
  birthDate: string;     // 생년월일 (YYYY-MM-DD)
  address: string;       // 거주지 (예: 서울시 마포구)
  guardian?: GuardianInfo; // 보호자 정보 (선택사항)
}

// Context 타입
interface UserContextType {
  userInfo: UserInfo;
  updateUserInfo: (info: Partial<UserInfo>) => void; // 부분 업데이트
  setUserInfo: (info: UserInfo) => void;              // 전체 설정
}

// 기본 사용자 정보
const defaultUserInfo: UserInfo = {
  name: '',
  email: '',
  height: '',
  weight: '',
  age: '',
  birthDate: '',
  address: ''
};

// Context 생성
const UserContext = createContext<UserContextType | undefined>(undefined);

// localStorage 키
const STORAGE_KEY = 'nutureTableUserInfo';

// Provider 컴포넌트
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // localStorage에서 초기 데이터 로드
  const [userInfo, setUserInfoState] = useState<UserInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('localStorage에서 사용자 정보 로드:', parsed);
        return { ...defaultUserInfo, ...parsed };
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
    return defaultUserInfo;
  });

  // userInfo가 변경될 때마다 localStorage에 저장
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
      console.log('localStorage에 사용자 정보 저장:', userInfo);
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    }
  }, [userInfo]);

  // 부분 업데이트 함수
  const updateUserInfo = (info: Partial<UserInfo>) => {
    setUserInfoState(prev => {
      const updated = { ...prev, ...info };
      console.log('사용자 정보 업데이트:', updated);
      return updated;
    });
  };

  // 전체 설정 함수
  const setUserInfo = (info: UserInfo) => {
    console.log('사용자 정보 전체 설정:', info);
    setUserInfoState(info);
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

// useUser 훅 - 컴포넌트에서 사용자 정보 접근
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};