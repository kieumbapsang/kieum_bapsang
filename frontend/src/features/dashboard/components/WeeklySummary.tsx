import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { formatCalories } from '../../../lib/utils';

interface NutritionData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeeklySummaryProps {
  data?: NutritionData[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ data = [] }) => {
  // 실제 데이터가 없을 경우 샘플 데이터 사용
  const weeklyData = data.length > 0 ? data : [
    { day: '월', calories: 1800, protein: 70, carbs: 220, fat: 60 },
    { day: '화', calories: 2000, protein: 75, carbs: 240, fat: 65 },
    { day: '수', calories: 1900, protein: 72, carbs: 230, fat: 62 },
    { day: '목', calories: 2100, protein: 80, carbs: 250, fat: 68 },
    { day: '금', calories: 2200, protein: 85, carbs: 260, fat: 70 },
    { day: '토', calories: 2300, protein: 90, carbs: 270, fat: 75 },
    { day: '일', calories: 1950, protein: 74, carbs: 235, fat: 64 },
  ];

  // 주간 평균 계산
  const averageCalories = Math.round(
    weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length
  );
  
  const averageProtein = Math.round(
    weeklyData.reduce((sum, day) => sum + day.protein, 0) / weeklyData.length
  );
  
  const averageCarbs = Math.round(
    weeklyData.reduce((sum, day) => sum + day.carbs, 0) / weeklyData.length
  );
  
  const averageFat = Math.round(
    weeklyData.reduce((sum, day) => sum + day.fat, 0) / weeklyData.length
  );

  const maxCalories = Math.max(...weeklyData.map(day => day.calories));
  const chartHeight = 150;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-40 gap-2">
        {weeklyData.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-primary-200 hover:bg-primary-300 w-full rounded-t-lg transition-all duration-200"
              style={{
                height: `${(day.calories / maxCalories) * chartHeight}px`,
              }}
            ></div>
            <div className="mt-2 text-sm font-medium text-gray-600">{day.day}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-4 border-t sm:grid-cols-4">
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-500">평균 칼로리</p>
          <p className="text-lg font-bold mt-1 text-primary-600">{formatCalories(averageCalories)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-500">평균 단백질</p>
          <p className="text-lg font-bold mt-1 text-blue-600">{averageProtein}g</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-500">평균 탄수화물</p>
          <p className="text-lg font-bold mt-1 text-yellow-600">{averageCarbs}g</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-500">평균 지방</p>
          <p className="text-lg font-bold mt-1 text-green-600">{averageFat}g</p>
        </div>
      </div>
    </div>
  );
};

