import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

type PieChartDataItem = {
  name: string;
  value: number;
  color: string;
  grams: number;
  isNoCalorie?: boolean;
};

export const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  accentColor, 
  onDelete,
  onEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 디버깅: 콜라의 당 정보 확인
  // if (meal.name === '콜라') {
  //   console.log(`🍯 MealCard에서 콜라 당 정보:`, meal.sugar);
  // }

  const handleDelete = () => {
    onDelete();
  };

  const handleEdit = () => {
    onEdit(meal);
  };

  // 식사 데이터 기반 영양소 그래프 (8개 영양소)
  const getPieChartData = (): PieChartDataItem[] => {
    const data: PieChartDataItem[] = [];
    
    // 값이 존재 확인 헬퍼 함수 (소수점 포함)
    const hasValue = (val: number | undefined): boolean => {
      return val !== undefined && val !== null && !isNaN(val) && val > 0;
    };
    
    // 탄수화물 
    if (hasValue(meal.carbs)) {
      const carbsValue = meal.carbs * 4; // 1g = 4kcal
      if (hasValue(meal.sugar) && meal.sugar !== undefined && meal.sugar < meal.carbs) {
        
        const sugarValue = meal.sugar;
        const carbsWithoutSugar = Math.max(0, (meal.carbs - sugarValue) * 4);
        if (carbsWithoutSugar > 0) {
          data.push({
            name: '탄수화물',
            value: carbsWithoutSugar,
            color: '#3B82F6',
            grams: Math.max(0, meal.carbs - sugarValue)
          });
        }
      } else {
        data.push({
          name: '탄수화물',
          value: carbsValue,
          color: '#3B82F6',
          grams: meal.carbs
        });
      }
    }

    // 단백질
    if (hasValue(meal.protein)) {
      data.push({
        name: '단백질',
        value: meal.protein * 4, // 1g = 4kcal
        color: '#10B981',
        grams: meal.protein
      });
    }

    // 지방
    if (hasValue(meal.fat)) {
      const saturatedFat = meal.saturatedFat || 0;
      const transFat = meal.transFat || 0;
      const fatWithoutSaturatedAndTrans = Math.max(0, meal.fat - saturatedFat - transFat);
      
      if (fatWithoutSaturatedAndTrans > 0) {
        data.push({
          name: '지방',
          value: fatWithoutSaturatedAndTrans * 9, // 1g = 9kcal
          color: '#F59E0B',
          grams: fatWithoutSaturatedAndTrans
        });
      }
    }

    // 포화지방
    if (hasValue(meal.saturatedFat)) {
      const saturatedFatValue = meal.saturatedFat!;
      data.push({
        name: '포화지방',
        value: saturatedFatValue * 9, // 1g = 9kcal
        color: '#F97316',
        grams: saturatedFatValue
      });
    }

    // 트랜스지방
    if (hasValue(meal.transFat)) {
      const transFatValue = meal.transFat!;
      data.push({
        name: '트랜스지방',
        value: transFatValue * 9, // 1g = 9kcal
        color: '#DC2626',
        grams: transFatValue
      });
    }

    // 당
    if (hasValue(meal.sugar)) {
      const sugarValue = meal.sugar!;
      data.push({
        name: '당',
        value: sugarValue * 4, // 1g = 4kcal
        color: '#8B5CF6',
        grams: sugarValue
      });
    }

    // 콜레스테롤
    if (hasValue(meal.cholesterol)) {
      data.push({
        name: '콜레스테롤',
        value: 0.001, // 칼로리 없음, 그래프에 표시하기 위한 최소값
        color: '#A78BFA',
        grams: typeof meal.cholesterol === 'number' ? meal.cholesterol : 0,
        isNoCalorie: true 
      });
    }

    // 나트륨
    if (hasValue(meal.sodium)) {
      data.push({
        name: '나트륨',
        value: 0.001, // 칼로리 없음, 그래프에 표시하기 위한 최소값
        color: '#60A5FA',
        grams: typeof meal.sodium === 'number' ? meal.sodium : 0,
        isNoCalorie: true 
      });
    }

    return data;
  };

  const pieChartData = getPieChartData();
  const calorieProvidingData = pieChartData.filter(item => !item.isNoCalorie);
  const totalMacroCalories = calorieProvidingData.reduce((sum, item) => sum + item.value, 0);

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
        className="flex items-center justify-between py-3 cursor-pointer transition-colors px-2"
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
              isExpanded ? '' : 'transform rotate-180'
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
            {/* 원 그래프 섹션 */}
            {totalMacroCalories > 0 && (
              <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="p-4">
                  <h4 className="text-md font-semibold text-gray-900 text-center">영양소 분포</h4>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[200px] h-[200px] relative mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={calorieProvidingData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {calorieProvidingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid place-items-center grid-cols-2 gap-3 w-full max-w-[320px] text-xs">
                      {pieChartData.map((item, index) => {
                        let displayValue = '';
                        
                        if (item.isNoCalorie) {
                          // 칼로리 없는 영양소 (콜레스테롤, 나트륨)
                          displayValue = `${item.grams.toFixed(1)}mg`;
                        } else {
                          // 칼로리 제공 영양소
                          const percentage = totalMacroCalories > 0 
                            ? Math.round((item.value / totalMacroCalories) * 100) 
                            : 0;
                          displayValue = `${percentage}% (${item.grams.toFixed(1)}g)`;
                        }
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{item.name}</div>
                              <div className="text-gray-500">{displayValue}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

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