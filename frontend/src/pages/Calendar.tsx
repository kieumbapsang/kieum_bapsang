import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMeals } from '../features/meals/hooks/useMeals';
import { MealCard, Meal } from '../features/meals/components/MealCard';
import { AddMealModal } from '../features/meals/components/AddMealModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { AlertModal } from '../components/ui/AlertModal';
import { getKoreanDate } from '../lib/utils';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(getKoreanDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  
  const { getMealsByDate, deleteMeal, updateMeal, fetchMealsByDate, loading, error } = useMeals();
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);

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
    setCurrentDate(getKoreanDate());
    setSelectedDate(getKoreanDate());
  };

  // 월이 변경될 때 해당 월의 모든 날짜에 대해 식사 데이터 미리 로드
  useEffect(() => {
    const loadMonthMeals = async () => {
      for (const date of calendarDays) {
        if (isSameMonth(date, currentDate)) {
          fetchMealsByDate(date);
        }
      }
    };
    
    loadMonthMeals();
  }, [currentDate, fetchMealsByDate]);

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 선택된 날짜의 식사 데이터 가져오기
    fetchMealsByDate(date);
  };

  // 선택된 날짜의 식사 데이터 가져오기
  const selectedDateMeals = selectedDate ? getMealsByDate(selectedDate) : [];

  // 식사 삭제 확인 핸들러
  const handleDeleteConfirm = () => {
    if (mealToDelete && selectedDate) {
      deleteMeal(selectedDate, mealToDelete.id);
      setMealToDelete(null);
    }
  };

  // 식사 삭제 핸들러
  const handleDelete = (meal: Meal) => {
    setMealToDelete(meal);
  };

  // 식사 수정 핸들러
  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsAddModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setSelectedMeal(null);
  };

  // 식사 업데이트 핸들러
  const handleMealUpdate = (updatedMeal: Meal) => {
    if (selectedMeal && selectedDate) {
      updateMeal(selectedDate, selectedMeal.id, updatedMeal);
    }
    handleModalClose();
  };

  // 식사 추가 핸들러
  const handleAddMeal = () => {
    if (!selectedDate) return;

    const today = new Date();
    if (selectedDate > today) {
      setIsFutureModalOpen(true);
      return;
    }

    setSelectedMeal(null);
    setIsAddModalOpen(true);
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
          const meals = getMealsByDate(date);
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
                ${/* hasMeals ? 'ring-2 ring-primary-200' : '' */ ''}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">
              {format(selectedDate, 'M월 d일 (E)', { locale: ko })} 식사 기록
            </h3>
            {/* <button
              onClick={handleAddMeal}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              식사 추가
            </button> */}
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-neutral-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
              <p>식사 데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>식사 데이터를 불러오는데 실패했습니다: {error}</p>
            </div>
          ) : selectedDateMeals.length > 0 ? (
            <div className="space-y-2">
              {selectedDateMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  accentColor="text-primary-500"
                  onDelete={() => handleDelete(meal)}
                  onEdit={() => handleEdit(meal)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>이 날의 식사 기록이 없습니다</p>
              <button 
                onClick={handleAddMeal}
                className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
              >
                식사 추가하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 식사 추가/수정 모달 */}
      <AddMealModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        initialMeal={selectedMeal}
        onSubmit={handleMealUpdate}
        selectedDate={selectedDate}
      />

      {/* 식사 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={mealToDelete !== null}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="식사 기록 삭제"
        message={`${mealToDelete?.name || ''} 기록을 삭제하시겠습니까?`}
      />

      {/* 미래 날짜 선택 시 경고 모달 */}
      <AlertModal
        isOpen={isFutureModalOpen}
        onClose={() => setIsFutureModalOpen(false)}
        title="식사 추가 불가"
        message="오늘 이후의 날짜에는 식사 기록을 추가할 수 없습니다."
        buttonText='확인'
      />
    </div>
  );
};
