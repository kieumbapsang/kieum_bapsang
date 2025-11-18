import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface CalendarViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MealRecord {
  name: string;
  amount: string;
  calories: string;
}

export function CalendarViewModal({ open, onOpenChange }: CalendarViewModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 18)); // 2025년 9월 18일
  const [selectedDate, setSelectedDate] = useState(18);

  // 임시 식사 기록 데이터
  const mealRecords: { [key: number]: MealRecord[] } = {
    18: [
      { name: "오믈릿", amount: "150g", calories: "280kcal" },
      { name: "그릴 오지트", amount: "200g", calories: "180kcal" },
    ],
    22: [
      { name: "김치찌개", amount: "300g", calories: "320kcal" },
      { name: "밥", amount: "210g", calories: "350kcal" },
    ],
    25: [
      { name: "샐러드", amount: "200g", calories: "150kcal" },
    ],
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 이전 달의 마지막 날들
  const prevMonthDays = firstDay > 0 ? Array.from({ length: firstDay }, (_, i) => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    return prevMonth.getDate() - firstDay + i + 1;
  }) : [];

  // 다음 달의 처음 날들
  const totalCells = prevMonthDays.length + daysInMonth;
  const nextMonthDays = totalCells % 7 !== 0 ? Array.from({ length: 7 - (totalCells % 7) }, (_, i) => i + 1) : [];

  const isToday = (day: number) => {
    return day === 18 && currentDate.getMonth() === 8;
  };

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
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h2>
              <p className="text-sm text-emerald-500">오늘</p>
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
              {/* Previous Month Days */}
              {prevMonthDays.map((day, index) => (
                <div key={`prev-${index}`} className="h-12 flex items-center justify-center">
                  <span className="text-sm text-neutral-400">{day}</span>
                </div>
              ))}

              {/* Current Month Days */}
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative h-12 text-sm rounded-lg transition-colors
                    ${isToday(day) 
                      ? "bg-emerald-100 text-emerald-700 font-bold" 
                      : selectedDate === day
                      ? "bg-emerald-500 text-white"
                      : "text-neutral-900 hover:bg-neutral-100"
                    }
                  `}
                >
                  {day}
                </button>
              ))}

              {/* Next Month Days */}
              {nextMonthDays.map((day, index) => (
                <div key={`next-${index}`} className="h-12 flex items-center justify-center">
                  <span className="text-sm text-neutral-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Meals */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              {currentDate.getMonth() + 1}월 {selectedDate}일 ({weekDays[(firstDay + selectedDate - 1) % 7]}) 식사 기록
            </h3>
            
            {mealRecords[selectedDate] && mealRecords[selectedDate].length > 0 ? (
              <div className="space-y-2">
                {mealRecords[selectedDate].map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                      <div>
                        <span className="text-neutral-900 font-medium">{meal.name}</span>
                        <div className="text-sm text-neutral-500">
                          {meal.amount} · {meal.calories}
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
                <button className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">
                  식사 추가하기
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
