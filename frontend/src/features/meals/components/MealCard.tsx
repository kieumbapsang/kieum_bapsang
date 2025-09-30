import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type NutrientRowProps = {
  label: string;
  amount: string;
  percentage?: string;
  indent?: boolean;
};

const NutrientRow: React.FC<NutrientRowProps> = ({ 
  label, 
  amount, 
  percentage, 
  indent = false 
}) => (
  <div className={`flex items-center justify-between p-2 ${indent ? 'pl-6' : ''}`}>
    <span className="text-sm">{label}</span>
    <div className="flex gap-8">
      <span className="text-sm font-medium">{amount}</span>
      {percentage && (
        <span className="text-sm font-bold w-12 text-right">{percentage}</span>
      )}
    </div>
  </div>
);

export type Meal = {
  id: string;
  name: string;
  amount: number;
  imageUrl?: string;
  foodId?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  sugar?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
  createdAt?: string;
};

type MealCardProps = {
  meal: Meal;
  accentColor: string;
  onDelete: () => void;
  onEdit: (meal: Meal) => void;
};

export const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  accentColor, 
  onDelete,
  onEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 디버깅: 콜라의 당 정보 확인
  if (meal.name === '콜라') {
    console.log(`🍯 MealCard에서 콜라 당 정보:`, meal.sugar);
  }

  const handleDelete = () => {
    onDelete();
  };

  const handleEdit = () => {
    onEdit(meal);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-200 last:border-b-0"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div 
        className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors px-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            {meal.imageUrl ? (
              <img 
                src={meal.imageUrl} 
                alt={meal.name}
                className="w-12 h-12 rounded-md object-cover"
              />
            ) : (
              <motion.svg
                className="w-8 h-8 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.path
                  d="M3 5h2v14h-2zM7 5h2v14h-2zM15 5c0 0 4 0 4 4s-3 4-3 4v6h-2V5h1z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </motion.svg>
            )}
          </div>
          <div>
            {meal.createdAt && (
              <span className={`text-sm ${accentColor} block`}>
                {new Date(meal.createdAt).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
            <h3 className="font-medium text-gray-900">{meal.name}</h3>
            <span className="text-sm text-gray-500">{meal.amount}g · {meal.calories}kcal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="식사 정보 수정"
          >
            <svg 
              className={`w-4 h-4 ${accentColor}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
            title="식사 기록 삭제"
          >
            <svg 
              className="w-4 h-4 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8.25 15.75l7.5-7.5 7.5 7.5"
              className="transition-opacity duration-300"
            />
          </svg>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="pb-4 px-4 bg-white overflow-hidden"
          >
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-black text-white p-3">
                <div className="text-sm">영양정보</div>
                <div className="flex justify-between items-baseline mt-1">
                  <div>1회 제공량 {meal.amount}g</div>
                  <div>{meal.calories}kcal</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                <NutrientRow 
                  label="탄수화물" 
                  amount={`${meal.carbs}g`} 
                  percentage={Math.round((meal.carbs * 4) / 2000 * 100) + '%'}
                />
                <NutrientRow 
                  label="단백질" 
                  amount={`${meal.protein}g`}
                  percentage={Math.round((meal.protein * 4) / 2000 * 100) + '%'}
                />
                <NutrientRow 
                  label="지방" 
                  amount={`${meal.fat}g`}
                  percentage={Math.round((meal.fat * 9) / 2000 * 100) + '%'}
                />
                {meal.saturatedFat !== undefined && (
                  <NutrientRow 
                    label="포화지방" 
                    amount={`${meal.saturatedFat}g`}
                    percentage={Math.round((meal.saturatedFat * 9) / 2000 * 100) + '%'}
                    indent
                  />
                )}
                {meal.transFat !== undefined && (
                  <NutrientRow 
                    label="트랜스지방" 
                    amount={`${meal.transFat}g`}
                    indent
                  />
                )}
                {meal.cholesterol !== undefined && (
                  <NutrientRow 
                    label="콜레스테롤" 
                    amount={`${meal.cholesterol}mg`}
                    percentage={Math.round(meal.cholesterol / 300 * 100) + '%'}
                  />
                )}
                {meal.sugar !== undefined && (
                  <NutrientRow 
                    label="당" 
                    amount={`${meal.sugar}g`}
                    percentage={Math.round((meal.sugar * 4) / 2000 * 100) + '%'}
                  />
                )}
                {meal.sodium !== undefined && (
                  <NutrientRow 
                    label="나트륨" 
                    amount={`${meal.sodium}mg`}
                    percentage={Math.round(meal.sodium / 2000 * 100) + '%'}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};