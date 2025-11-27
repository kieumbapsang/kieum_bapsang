import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useMeals } from "../features/meals/hooks/useMeals";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';

interface CalendarViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarViewModal({ open, onOpenChange }: CalendarViewModalProps) {
  const [currentDate, setCurrentDate] = useState(getKoreanDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { getMealsByDate, fetchMealsByDate, loading } = useMeals();

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

  // 모달이 열릴 때 오늘 날짜 선택 및 데이터 로드
  useEffect(() => {
    if (open) {
      const today = getKoreanDate();
      setCurrentDate(today);
      setSelectedDate(today);
      fetchMealsByDate(today);
    }
  }, [open, fetchMealsByDate]);

  // 월이 변경될 때 해당 월의 모든 날짜에 대해 식사 데이터 미리 로드
  useEffect(() => {
    if (!open) return;
    
    const loadMonthMeals = async () => {
      for (const date of calendarDays) {
        if (isSameMonth(date, currentDate)) {
          fetchMealsByDate(date);
        }
      }
    };
    
    loadMonthMeals();
  }, [currentDate, open, fetchMealsByDate]);

  // 키즈 모드에서 데이터 변경 시 데이터 다시 불러오기
  useEffect(() => {
    if (!open) return;

    const handleMealDataChanged = (event: CustomEvent) => {
      const { date } = event.detail;
      if (date) {
        const changedDate = new Date(date);
        // 같은 월이면 해당 날짜 다시 불러오기
        if (isSameMonth(changedDate, currentDate)) {
          fetchMealsByDate(changedDate);
        }
      } else {
        // 날짜가 없으면 현재 월의 모든 날짜 다시 불러오기
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const days = eachDayOfInterval({
          start: calendarStart,
          end: calendarEnd
        });
        
        for (const date of days) {
          if (isSameMonth(date, currentDate)) {
            fetchMealsByDate(date);
          }
        }
      }
    };

    window.addEventListener('mealDataChanged', handleMealDataChanged as EventListener);
    return () => {
      window.removeEventListener('mealDataChanged', handleMealDataChanged as EventListener);
    };
  }, [currentDate, open, fetchMealsByDate]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 선택된 날짜의 식사 데이터 가져오기
    fetchMealsByDate(date);
  };

  // 선택된 날짜의 식사 데이터 가져오기
  const selectedDateMeals = selectedDate ? getMealsByDate(selectedDate) : [];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">식사 기록 캘린더</DialogTitle>
          <DialogDescription className="sr-only">
            날짜를 선택하여 해당 날짜의 식사 기록을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-neutral-600 hover:text-emerald-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-neutral-900">
                {format(currentDate, 'yyyy년 M월', { locale: ko })}
              </h2>
              <button
                onClick={() => {
                  const today = getKoreanDate();
                  setCurrentDate(today);
                  setSelectedDate(today);
                  fetchMealsByDate(today);
                }}
                className="text-sm text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                오늘
              </button>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 text-neutral-600 hover:text-emerald-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg p-4">
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center text-sm font-medium text-neutral-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isToday = isSameDay(date, getKoreanDate());
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
                      ${isToday ? 'bg-emerald-100 text-emerald-700 font-bold' : ''}
                      ${isSelected ? 'bg-emerald-500 text-white' : ''}
                      ${!isSelected && !isToday ? 'hover:bg-neutral-100' : ''}
                    `}
                  >
                    {format(date, 'd')}
                    {hasMeals && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Meals */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {format(selectedDate, 'M월 d일 (E)', { locale: ko })} 식사 기록
              </h3>
              
              {loading ? (
                <div className="text-center py-8 text-neutral-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                  <p>식사 데이터를 불러오는 중...</p>
                </div>
              ) : selectedDateMeals.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-neutral-900 font-medium">{meal.name}</span>
                          <div className="text-sm text-neutral-500">
                            {meal.amount}{meal.unit || 'g'} · {meal.calories}kcal
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p>이 날의 식사 기록이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
