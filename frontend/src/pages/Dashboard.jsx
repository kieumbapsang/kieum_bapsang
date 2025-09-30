import React from 'react';
import { Card } from '../components/ui/Card';

export const DashboardPage = () => {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-bold">안녕하세요, 사용자님!</h1>
      
      <div className="mb-6 rounded-lg bg-primary-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">오늘의 영양 섭취</h2>
            <p className="text-sm text-neutral-600">2023년 5월 15일</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">1,250 / 2,000 kcal</p>
            <p className="text-sm text-neutral-600">목표의 62%</p>
          </div>
        </div>
        
        <div className="mt-4 h-2 w-full rounded-full bg-neutral-200">
          <div className="h-2 rounded-full bg-primary-500" style={{ width: '62%' }}></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-medium">오늘의 식사</h2>
        <Card className="mb-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">아침</h3>
              <p className="text-sm text-neutral-600">오트밀과 과일</p>
            </div>
            <p className="font-bold">320 kcal</p>
          </div>
        </Card>
        
        <Card className="mb-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">점심</h3>
              <p className="text-sm text-neutral-600">닭가슴살 샐러드</p>
            </div>
            <p className="font-bold">450 kcal</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">간식</h3>
              <p className="text-sm text-neutral-600">그릭 요거트</p>
            </div>
            <p className="font-bold">180 kcal</p>
          </div>
        </Card>
      </div>
      
      <div>
        <h2 className="mb-3 text-lg font-medium">주간 요약</h2>
        <Card className="p-4">
          <div className="flex justify-between">
            <div className="flex flex-col items-center">
              <div className="h-20 w-6 rounded-t-lg bg-primary-200"></div>
              <p className="mt-1 text-xs">월</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-6 rounded-t-lg bg-primary-300"></div>
              <p className="mt-1 text-xs">화</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-6 rounded-t-lg bg-primary-200"></div>
              <p className="mt-1 text-xs">수</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-28 w-6 rounded-t-lg bg-primary-400"></div>
              <p className="mt-1 text-xs">목</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-6 rounded-t-lg bg-primary-300"></div>
              <p className="mt-1 text-xs">금</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-32 w-6 rounded-t-lg bg-primary-500"></div>
              <p className="mt-1 text-xs">토</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-6 rounded-t-lg bg-primary-300"></div>
              <p className="mt-1 text-xs">일</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
