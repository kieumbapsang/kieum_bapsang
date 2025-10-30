import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { useMeals } from '../features/meals/hooks/useMeals';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';
import { startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const StatisticsPage = () => {
  const [currentWeek, setCurrentWeek] = useState(getKoreanDate());
  const [weeklyStats, setWeeklyStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    averageCalories: 0,
    averageProtein: 0,
    averageCarbs: 0,
    averageFat: 0,
    dailyCalories: []
  });
  
  // 오늘의 영양소 분석을 위한 상태
  const [todayStats, setTodayStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalSodium: 0,
    totalSugar: 0,
    totalCholesterol: 0,
    totalSaturatedFat: 0,
    totalTransFat: 0,
    meals: []
  });
  
  const { getMealsByDate, fetchMealsByDate } = useMeals();

  // 현재 주의 시작일과 마지막일 계산
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // 일요일 시작
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 주간 통계 계산 함수
  const calculateWeeklyStats = useCallback(async () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const dailyCalories = [];

    console.log('📊 Statistics: 주간 통계 계산 시작');
    console.log('📅 주간 날짜들:', weekDays.map(d => toKoreanDateString(d)));

    // 주간의 각 날짜에 대해 데이터 로드 및 통계 계산
    for (const date of weekDays) {
      const dateString = toKoreanDateString(date);
      console.log(`🔍 날짜 ${dateString} 데이터 로드 중...`);
      
      await fetchMealsByDate(date);
      const meals = getMealsByDate(date);
      
      console.log(`📋 ${dateString} 조회된 식사 수:`, meals.length);
      console.log(`🍽️ ${dateString} 식사 데이터:`, meals);
      
      const dayCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const dayProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      const dayCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
      const dayFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

      console.log(`📈 ${dateString} 일일 영양소:`, { dayCalories, dayProtein, dayCarbs, dayFat });

      totalCalories += dayCalories;
      totalProtein += dayProtein;
      totalCarbs += dayCarbs;
      totalFat += dayFat;

      dailyCalories.push({ date, calories: dayCalories });
    }

    const daysWithData = dailyCalories.filter(day => day.calories > 0).length;
    const averageDays = daysWithData > 0 ? daysWithData : 7; // 데이터가 있는 날짜 수 또는 7일

    const stats = {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      averageCalories: Math.round(totalCalories / averageDays),
      averageProtein: Math.round((totalProtein / averageDays) * 10) / 10,
      averageCarbs: Math.round((totalCarbs / averageDays) * 10) / 10,
      averageFat: Math.round((totalFat / averageDays) * 10) / 10,
      dailyCalories
    };

    console.log('📊 최종 통계 결과:', stats);
    console.log('📅 일일 칼로리:', dailyCalories.map(d => ({ date: toKoreanDateString(d.date), calories: d.calories })));

    setWeeklyStats(stats);
  }, [weekDays, getMealsByDate, fetchMealsByDate]);

  // 오늘의 영양소 분석 계산
  const calculateTodayStats = useCallback(async () => {
    const today = getKoreanDate();
    await fetchMealsByDate(today);
    const meals = getMealsByDate(today);
    
    const stats = {
      totalCalories: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      totalProtein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
      totalCarbs: meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
      totalFat: meals.reduce((sum, meal) => sum + (meal.fat || 0), 0),
      totalSodium: meals.reduce((sum, meal) => sum + (meal.sodium || 0), 0),
      totalSugar: meals.reduce((sum, meal) => sum + (meal.sugar || 0), 0),
      totalCholesterol: meals.reduce((sum, meal) => sum + (meal.cholesterol || 0), 0),
      totalSaturatedFat: meals.reduce((sum, meal) => sum + (meal.saturatedFat || 0), 0),
      totalTransFat: meals.reduce((sum, meal) => sum + (meal.transFat || 0), 0),
      meals: meals
    };
    
    setTodayStats(stats);
  }, [getMealsByDate, fetchMealsByDate]);

  // 주 변경 시 통계 재계산
  useEffect(() => {
    calculateWeeklyStats();
    calculateTodayStats();
  }, [calculateWeeklyStats, calculateTodayStats]);

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  // 이번 주로 이동
  const goToCurrentWeek = () => {
    const today = getKoreanDate();
    console.log('🕐 현재 시간:', new Date().toISOString());
    console.log('🇰🇷 한국 시간:', today.toISOString());
    console.log('📅 한국 날짜 문자열:', toKoreanDateString(today));
    setCurrentWeek(today);
  };

  // 칼로리 차트의 최대 높이 계산
  const maxCalories = Math.max(...weeklyStats.dailyCalories.map(day => day.calories), 1);
  const getBarHeight = (calories) => {
    return Math.max((calories / maxCalories) * 160, 8); // 최소 8px 높이
  };

  // 영양소 비율 계산
  const totalMacros = weeklyStats.totalProtein + weeklyStats.totalCarbs + weeklyStats.totalFat;
  const proteinRatio = totalMacros > 0 ? Math.round((weeklyStats.totalProtein / totalMacros) * 100) : 0;
  const carbsRatio = totalMacros > 0 ? Math.round((weeklyStats.totalCarbs / totalMacros) * 100) : 0;
  const fatRatio = totalMacros > 0 ? Math.round((weeklyStats.totalFat / totalMacros) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-bold">영양 통계</h1>
      
      {/* 오늘의 영양소 분석 */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-medium">오늘의 영양소 분석</h2>
        
        {/* 오늘의 총 칼로리 */}
        <Card className="mb-4 p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">오늘의 총 칼로리</h3>
            <div className="text-3xl font-bold text-primary-600">
              {todayStats.totalCalories.toLocaleString()} kcal
            </div>
          </div>
        </Card>
        
        {/* 탄단지 분석 */}
        <Card className="mb-4 p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">탄단지 분석</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayStats.totalCarbs.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">탄수화물</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayStats.totalProtein.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">단백질</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{todayStats.totalFat.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">지방</div>
            </div>
          </div>
          
          {/* 탄단지 비율 차트 */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: '탄수화물', value: todayStats.totalCarbs, color: '#3B82F6' },
                    { name: '단백질', value: todayStats.totalProtein, color: '#10B981' },
                    { name: '지방', value: todayStats.totalFat, color: '#F59E0B' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {[
                    { name: '탄수화물', color: '#3B82F6' },
                    { name: '단백질', color: '#10B981' },
                    { name: '지방', color: '#F59E0B' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* 기타 영양소 */}
        <Card className="mb-4 p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">기타 영양소</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{todayStats.totalSodium.toFixed(1)}mg</div>
              <div className="text-sm text-gray-600">나트륨</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{todayStats.totalSugar.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">당분</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{todayStats.totalCholesterol.toFixed(1)}mg</div>
              <div className="text-sm text-gray-600">콜레스테롤</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">{todayStats.totalSaturatedFat.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">포화지방</div>
            </div>
          </div>
        </Card>
        
        {/* 오늘의 식사 목록 */}
        {todayStats.meals.length > 0 && (
          <Card className="mb-6 p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">오늘의 식사 목록</h3>
            <div className="space-y-2">
              {todayStats.meals.map((meal, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{meal.name}</div>
                    <div className="text-sm text-gray-600">{meal.calories} kcal</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>탄수화물: {meal.carbs}g</div>
                    <div>단백질: {meal.protein}g</div>
                    <div>지방: {meal.fat}g</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      
      {/* 주간 선택 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium">주간 요약</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-1 text-neutral-600 hover:text-primary-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm text-neutral-600 min-w-0 flex-1 text-center">
              {weekStart.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
            </div>
            <button
              onClick={goToNextWeek}
              className="p-1 text-neutral-600 hover:text-primary-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-2 py-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
            >
              이번 주
            </button>
          </div>
        </div>
        
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 칼로리</p>
              <p className="text-xl font-bold">{weeklyStats.averageCalories.toLocaleString()} kcal</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 단백질</p>
              <p className="text-xl font-bold">{weeklyStats.averageProtein}g</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 탄수화물</p>
              <p className="text-xl font-bold">{weeklyStats.averageCarbs}g</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3 text-center">
              <p className="text-sm text-neutral-600">평균 지방</p>
              <p className="text-xl font-bold">{weeklyStats.averageFat}g</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* 칼로리 추이 차트 */}
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">칼로리 추이</h2>
        <Card className="p-4">
          <div className="flex h-40 items-end justify-between">
            {weeklyStats.dailyCalories.map((day, index) => {
              const dayName = day.date.toLocaleDateString('ko-KR', { weekday: 'short' });
              const height = getBarHeight(day.calories);
              const isToday = toKoreanDateString(day.date) === toKoreanDateString(getKoreanDate());
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-8 rounded-t-lg transition-all duration-300 ${
                      isToday ? 'bg-primary-600' : 'bg-primary-400'
                    }`}
                    style={{ height: `${height}px` }}
                    title={`${day.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}: ${day.calories} kcal`}
                  ></div>
                  <p className="mt-1 text-xs">{dayName}</p>
                  <p className="text-xs text-neutral-500">{day.calories}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      
      {/* 영양소 비율 */}
      <div>
        <h2 className="mb-2 text-lg font-medium">영양소 비율</h2>
        <Card className="p-4">
          <div className="flex justify-between">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-primary-500"></div>
              <p className="mt-2 font-medium">탄수화물</p>
              <p className="text-sm text-neutral-600">{carbsRatio}%</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-chart-500"></div>
              <p className="mt-2 font-medium">단백질</p>
              <p className="text-sm text-neutral-600">{proteinRatio}%</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full border-8 border-secondary-500"></div>
              <p className="mt-2 font-medium">지방</p>
              <p className="text-sm text-neutral-600">{fatRatio}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};