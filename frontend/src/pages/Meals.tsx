import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealCard, Meal } from '../features/meals/components/MealCard';
import { AddMealModal } from '../features/meals/components/AddMealModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useMeals } from '../features/meals/hooks/useMeals';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';

export const MealsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getKoreanDate()); // 한국 시간대 현재 날짜로 설정
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const { getMealsByDate, deleteMeal, updateMeal, fetchMealsByDate } = useMeals();

  const selectedDateMeals = getMealsByDate(selectedDate);
  
  // 어제 날짜의 식사 기록 가져오기
  const yesterday = new Date(selectedDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayMeals = getMealsByDate(yesterday);

  // 컴포넌트 마운트 시와 날짜 변경 시 데이터 로드
  useEffect(() => {
    fetchMealsByDate(selectedDate);
    
    // 어제 날짜 계산
    const yesterdayDate = new Date(selectedDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    fetchMealsByDate(yesterdayDate);
  }, [selectedDate, fetchMealsByDate]);

  const handleDeleteConfirm = () => {
    if (mealToDelete) {
      const date = selectedDateMeals.includes(mealToDelete) ? selectedDate : yesterday;
      deleteMeal(date, mealToDelete.id);
      setMealToDelete(null);
    }
  };

  const handleDelete = (meal: Meal) => {
    setMealToDelete(meal);
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setSelectedMeal(null);
  };

  const handleMealUpdate = (updatedMeal: Meal) => {
    if (selectedMeal) {
      const date = selectedDateMeals.includes(selectedMeal) ? selectedDate : yesterday;
      updateMeal(date, selectedMeal.id, updatedMeal);
    }
    handleModalClose();
  };

  const formatDate = (date: Date) => {
    const today = getKoreanDate();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 날짜만 비교 (시간 제외)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return '오늘';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-6 max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">식사 기록</h1>
        {/* <motion.button
          className="bg-primary-500 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          식사 추가
        </motion.button> */}
      </motion.div>

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={toKoreanDateString(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="flex-1 p-3 border border-gray-200 rounded-lg"
          />
          <button
            onClick={() => setSelectedDate(getKoreanDate())}
            className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            오늘
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        <motion.div className="space-y-6">
          {/* 선택한 날짜의 식사 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
            layout
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold">{formatDate(selectedDate)}의 식사</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedDateMeals.length > 0 ? (
                  selectedDateMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MealCard
                        meal={meal}
                        accentColor="text-primary-500"
                        onDelete={() => handleDelete(meal)}
                        onEdit={() => handleEdit(meal)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {formatDate(selectedDate)}의 기록된 식사가 없습니다
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 어제의 식사 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
            layout
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold">{formatDate(yesterday)}의 식사</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {yesterdayMeals.length > 0 ? (
                  yesterdayMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MealCard
                        meal={meal}
                        accentColor="text-primary-500"
                        onDelete={() => handleDelete(meal)}
                        onEdit={() => handleEdit(meal)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {formatDate(yesterday)}의 기록된 식사가 없습니다
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 식사 추가 버튼 */}
          {/* {selectedDateMeals.length === 0 && yesterdayMeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <svg 
                  className="w-16 h-16 text-gray-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  기록된 식사가 없습니다
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedDate)}의 기록된 식사가 없습니다. 새로운 식사를 추가해보세요.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  식사 추가하기
                </button>
              </div>
            </motion.div>
          )} */}
        </motion.div>
      </AnimatePresence>

      <AddMealModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        initialMeal={selectedMeal}
        onSubmit={handleMealUpdate}
      />

      <ConfirmModal
        isOpen={mealToDelete !== null}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="식사 기록 삭제"
        message={`${mealToDelete?.name || ''} 기록을 삭제하시겠습니까?`}
      />
    </motion.div>
  );
};