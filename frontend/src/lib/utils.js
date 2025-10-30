import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// 한국 시간대를 고려한 날짜를 YYYY-MM-DD 형식으로 변환
export const toKoreanDateString = (date) => {
  if (!date) return '';
  
  // 로컬 시간대를 그대로 사용 (브라우저가 한국 시간대에 설정되어 있다면)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 한국 시간대를 고려한 현재 날짜 반환
export const getKoreanDate = () => {
  // 현재 로컬 시간을 그대로 사용 (브라우저가 한국 시간대에 설정되어 있다면)
  return new Date();
};

// 날짜 포맷팅 함수
export const formatDate = (dateString, formatStr = 'yyyy년 MM월 dd일') => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ko });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return dateString;
  }
};

// 숫자 포맷팅 함수
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

// 영양소 단위 포맷팅
export const formatNutrient = (value, unit = 'g') => {
  return `${value}${unit}`;
};

// 칼로리 포맷팅
export const formatCalories = (calories) => {
  return `${formatNumber(calories)} kcal`;
};

// 클래스 이름 조합 유틸리티
export const cn = (...inputs) => {
  return inputs
    .flatMap(input => {
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return input;
    })
    .filter(Boolean)
    .join(' ');
};

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key, defaultValue) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`스토리지 가져오기 오류 (${key}):`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`스토리지 저장 오류 (${key}):`, error);
    }
  },
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`스토리지 삭제 오류 (${key}):`, error);
    }
  },
};