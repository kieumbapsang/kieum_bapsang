import React from 'react';
import { Card } from '../components/ui/Card';

export const StatisticsPage = () => {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-bold">영양 통계</h1>
      
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium">주간 요약</h2>
          <div className="text-sm text-neutral-600">5월 10일 - 5월 16일</div>
        </div>
        
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 칼로리</p>
              <p className="text-xl font-bold">1,850 kcal</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 단백질</p>
              <p className="text-xl font-bold">75g</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 탄수화물</p>
              <p className="text-xl font-bold">220g</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 지방</p>
              <p className="text-xl font-bold">60g</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">칼로리 추이</h2>
        <Card className="p-4">
          <div className="flex h-40 items-end justify-between">
            <div className="flex flex-col items-center">
              <div className="h-20 w-8 rounded-t-lg bg-primary-300"></div>
              <p className="mt-1 text-xs">월</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-28 w-8 rounded-t-lg bg-primary-400"></div>
              <p className="mt-1 text-xs">화</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-8 rounded-t-lg bg-primary-200"></div>
              <p className="mt-1 text-xs">수</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-32 w-8 rounded-t-lg bg-primary-500"></div>
              <p className="mt-1 text-xs">목</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-8 rounded-t-lg bg-primary-400"></div>
              <p className="mt-1 text-xs">금</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-8 rounded-t-lg bg-primary-300"></div>
              <p className="mt-1 text-xs">토</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-8 rounded-t-lg bg-primary-200"></div>
              <p className="mt-1 text-xs">일</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div>
        <h2 className="mb-2 text-lg font-medium">영양소 비율</h2>
        <Card className="p-4">
          <div className="flex justify-between">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-primary-500"></div>
              <p className="mt-2 font-medium">탄수화물</p>
              <p className="text-sm text-neutral-600">50%</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-chart-500"></div>
              <p className="mt-2 font-medium">단백질</p>
              <p className="text-sm text-neutral-600">30%</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-secondary-500"></div>
              <p className="mt-2 font-medium">지방</p>
              <p className="text-sm text-neutral-600">20%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
