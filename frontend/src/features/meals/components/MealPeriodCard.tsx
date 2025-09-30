import React from 'react';
import { Card } from '../../../components/ui/Card';
import { MealCard, Meal } from './MealCard';

type MealPeriodCardProps = {
  title: string;
  meals: Meal[];
  accentColor: string;
  onDeleteMeal: (meal: Meal) => void;
  onEditMeal: (meal: Meal) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export const MealPeriodCard: React.FC<MealPeriodCardProps> = ({ 
  title, 
  meals,
  accentColor,
  onDeleteMeal,
  onEditMeal,
  isExpanded,
  onToggle
}) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  const borderColorClass = accentColor.replace('border-l-', 'border-');

  return (
    <Card 
      className={`overflow-hidden border-2 ${borderColorClass} rounded-lg transition-all duration-500 ease-in-out shadow-sm hover:shadow-md`}
    >
      <div
        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
          isExpanded ? `bg-${accentColor.split('-')[1]}-50` : ''
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              총 {meals.length}끼
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className={`text-sm font-medium ${accentColor.replace('border-', 'text-')}`}>
              {totalCalories}kcal
            </span>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-500 ease-in-out ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div 
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'grid-rows-[1fr] opacity-100' 
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-200">
            <div 
              className={`p-4 bg-gray-50 transform transition-transform duration-500 ease-in-out ${
                isExpanded ? 'translate-y-0' : '-translate-y-4'
              }`}
            >
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-3 bg-white rounded-lg shadow-sm transform transition-all duration-500 ease-in-out border ${borderColorClass}`}>
                  <p className={`text-xs ${accentColor.replace('border-', 'text-')} mb-1`}>단백질</p>
                  <p className="text-sm font-medium text-gray-900">{totalProtein}g</p>
                </div>
                <div className={`text-center p-3 bg-white rounded-lg shadow-sm transform transition-all duration-500 ease-in-out border ${borderColorClass}`}>
                  <p className={`text-xs ${accentColor.replace('border-', 'text-')} mb-1`}>탄수화물</p>
                  <p className="text-sm font-medium text-gray-900">{totalCarbs}g</p>
                </div>
                <div className={`text-center p-3 bg-white rounded-lg shadow-sm transform transition-all duration-500 ease-in-out border ${borderColorClass}`}>
                  <p className={`text-xs ${accentColor.replace('border-', 'text-')} mb-1`}>지방</p>
                  <p className="text-sm font-medium text-gray-900">{totalFat}g</p>
                </div>
              </div>
            </div>
            <div 
              className={`divide-y divide-gray-200 transform transition-transform duration-500 ease-in-out ${
                isExpanded ? 'translate-y-0' : '-translate-y-4'
              }`}
            >
              {meals.map((meal, index) => (
                <div 
                  key={meal.id} 
                  className="px-4"
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  <MealCard 
                    meal={meal} 
                    accentColor={accentColor.replace('border-', 'text-')}
                    onDelete={() => onDeleteMeal(meal)}
                    onEdit={(meal) => onEditMeal(meal)}
                  />
                </div>
              ))}
              {meals.length === 0 && (
                <p className="text-gray-500 text-sm py-4 text-center">기록된 식사가 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};