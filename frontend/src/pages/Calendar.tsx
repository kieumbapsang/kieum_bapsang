import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 현재 월의 시작일과 마지막일
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 캘린더에 표시할 날짜 범위 (이전/다음 달의 일부 날짜 포함)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // 캘린더에 표시할 모든 날짜
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 샘플 데이터 (실제로는 API에서 가져올 데이터)
  const getMealsForDate = (date: Date) => {
    // 샘플 데이터 - 실제로는 API에서 가져올 데이터
    const sampleMeals: { [key: string]: string[] } = {
      '2024-01-15': ['아침: 오트밀', '점심: 샐러드', '저녁: 닭가슴살'],
      '2024-01-20': ['아침: 토스트', '점심: 파스타'],
      '2024-01-25': ['아침: 계란', '점심: 김치찌개', '저녁: 불고기']
    };
    
    const dateKey = format(date, 'yyyy-MM-dd');
    return sampleMeals[dateKey] || [];
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 text-neutral-600 hover:text-primary-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-neutral-900">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h1>
          <button
            onClick={goToToday}
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            오늘
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 text-neutral-600 hover:text-primary-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-neutral-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const meals = getMealsForDate(date);
          const hasMeals = meals.length > 0;

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                relative h-12 text-sm rounded-lg transition-colors
                ${isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400'}
                ${isToday ? 'bg-primary-100 text-primary-700 font-bold' : ''}
                ${isSelected ? 'bg-primary-500 text-white' : ''}
                ${!isSelected && !isToday ? 'hover:bg-neutral-100' : ''}
                ${hasMeals ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              {format(date, 'd')}
              {hasMeals && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-primary-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜의 식사 정보 */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            {format(selectedDate, 'M월 d일 (E)', { locale: ko })} 식사 기록
          </h3>
          {getMealsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getMealsForDate(selectedDate).map((meal: string, index: number) => (
                <div key={index} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-neutral-700">{meal}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>이 날의 식사 기록이 없습니다</p>
              <button className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
                식사 추가하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
