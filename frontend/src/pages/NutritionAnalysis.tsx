import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { api } from '../api/client';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isBefore, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useModeStore } from '../stores/useModeStore';

const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const getBMIStatus = (bmi: number): string => {
  if (bmi < 18.5) return '저체중';
  if (bmi < 23) return '정상';
  if (bmi < 25) return '과체중';
  return '비만';
};

const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return '#3B82F6'; // 저체중 - 파란색
  if (bmi < 23) return '#10B981'; // 정상 - 초록색
  if (bmi < 25) return '#F59E0B'; // 과체중 - 주황색
  return '#EF4444'; // 비만 - 빨간색
};

// 0-19세만 지원
const getAgeGroup = (age: number): string => {
  if (age <= 2) return '1-2세';
  if (age <= 5) return '3-5세';
  if (age <= 11) return '6-11세';
  if (age <= 18) return '12-18세';
  return '19세'; 
};

const formatInt = (n: number) => Math.round(n).toLocaleString();

export const NutritionAnalysisPage: React.FC = () => {
  const { isKidsMode } = useModeStore();
  const [userStats, setUserStats] = useState({
    weight: 0,
    height: 0,
  });

  const [todayNutrition, setTodayNutrition] = useState<any>(null);
  const [weeklyNutrition, setWeeklyNutrition] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getKoreanDate());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [averageByAgeGroup, setAverageByAgeGroup] = useState<any[] | null>(null);

  const bmi = calculateBMI(userStats.weight, userStats.height);
  const bmiStatus = getBMIStatus(bmi);
  const bmiColor = getBMIColor(bmi);

  const bmiRanges = [
    { name: '저체중', min: 0, max: 18.5, color: '#3B82F6' },
    { name: '정상', min: 18.5, max: 23, color: '#10B981' },
    { name: '과체중', min: 23, max: 25, color: '#F59E0B' },
    { name: '비만', min: 25, max: 35, color: '#EF4444' },
  ];

  const averageWeight = userStats.height > 0 ? 
    Math.round((userStats.height / 100) * (userStats.height / 100) * 22) : 0;

  // 사용자 프로필 데이터 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('사용자 정보를 찾을 수 없습니다. 로그인해주세요.');
          return;
        }

        const { data: profileData, error: profileError } = await api.user.getProfile(parseInt(userId));
        
        if (profileError) {
          console.error('사용자 프로필 로딩 오류:', profileError);
          setError('사용자 정보를 불러올 수 없습니다.');
          return;
        }

        if (profileData) {
          setUserProfile(profileData);
          setUserStats({
            weight: profileData.weight,
            height: profileData.height
          });
        }
      } catch (err) {
        console.error('사용자 프로필 로딩 오류:', err);
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    };

    fetchUserProfile();
  }, []);

  // 연령대 평균 영양 데이터 가져오기
  useEffect(() => {
    const fetchAverageByAge = async () => {
      if (!userProfile || typeof userProfile.age !== 'number') return;
      const ageGroup = getAgeGroup(userProfile.age);
      console.log('📊 연령대별 평균 영양소 조회:', ageGroup);
      const { data, error } = await api.nutrition.getAverageNutrition(encodeURIComponent(ageGroup));
      if (error) {
        console.error('연령대별 평균 영양소 조회 실패:', error);
        return;
      }
      console.log('연령대별 평균 영양소 데이터:', data?.nutrition_data);
      setAverageByAgeGroup(data?.nutrition_data || null);
    };
    fetchAverageByAge();
  }, [userProfile]);

  // 키즈 모드에서 데이터 변경 시 데이터 다시 불러오기
  useEffect(() => {
    const handleMealDataChanged = () => {
      // 영양소 데이터 다시 불러오기 (기존 useEffect가 자동으로 실행되도록 강제)
      // selectedDate를 변경하지 않고 직접 fetchTodayNutrition 로직 실행
      const fetchTodayNutrition = async () => {
        try {
          const targetDate = toKoreanDateString(selectedDate);
          const userId = localStorage.getItem('user_id');
          
          if (!userId) {
            return;
          }

          const userIdNum = parseInt(userId);
          if (isNaN(userIdNum)) {
            return;
          }

          // 오늘의 식사 요약 데이터 가져오기
          const { data: mealSummary, error: summaryError } = await api.meals.getMealSummary(targetDate, userIdNum as any);
          
          if (summaryError) {
            console.error('식사 요약 데이터 가져오기 실패:', summaryError);
            return;
          }

          if (mealSummary) {
            // 영양소 데이터 업데이트
            const nutritionData: any = {
              calories: mealSummary.total_calories || 0,
              protein: mealSummary.total_protein || 0,
              carbs: mealSummary.total_carbs || 0,
              fat: mealSummary.total_fat || 0,
              sodium: 0,
              sugar: 0,
            };
            setTodayNutrition(nutritionData);
          }
        } catch (error) {
          console.error('영양소 데이터 가져오기 실패:', error);
        }
      };
      
      fetchTodayNutrition();
    };

    window.addEventListener('mealDataChanged', handleMealDataChanged);
    return () => {
      window.removeEventListener('mealDataChanged', handleMealDataChanged);
    };
  }, [selectedDate]);

  // 오늘의 영양소 데이터 가져오기
  useEffect(() => {
    const fetchTodayNutrition = async () => {
      try {
        setLoading(true);
        const targetDate = toKoreanDateString(selectedDate);
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
          setError('사용자 정보를 찾을 수 없습니다. 로그인해주세요.');
          return;
        }

        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) {
          setError('사용자 ID가 유효하지 않습니다.');
          return;
        }

        // 오늘의 식사 요약 데이터 가져오기
        const { data: mealSummary, error: summaryError } = await api.meals.getMealSummary(targetDate, userIdNum as any);
        
        if (summaryError) {
          console.error('식사 요약 데이터 가져오기 실패:', summaryError);
          setTodayNutrition(null);
          return;
        }

        if (mealSummary) {
          // 기본 영양소 데이터 설정
          const nutritionData: any = {
            calories: mealSummary.total_calories || 0,
            protein: mealSummary.total_protein || 0,
            carbs: mealSummary.total_carbs || 0,
            fat: mealSummary.total_fat || 0,
            sodium: mealSummary.total_sodium || 0,
            sugar: mealSummary.total_sugar || 0,
            cholesterol: mealSummary.total_cholesterol || 0,
            saturatedFat: mealSummary.total_saturated_fat || 0,
            transFat: mealSummary.total_trans_fat || 0,
          };

          // 영양소 비교 데이터 가져오기
          try {
            const { data: comparisonData } = await api.nutrition.compareUserNutrition(userIdNum, targetDate);
            
            if (comparisonData && comparisonData.comparisons && comparisonData.comparisons.length > 0) {
              // 평균값과 비교
              const nutritionList = comparisonData.comparisons.map((item: any) => {
                const nutrientName = item.nutrient_name;
                const userValue = item.user_intake;
                const averageValue = item.average_intake;
                const status = item.status;

                return {
                  name: nutrientName,
                  unit: item.unit,
                  user: userValue,
                  average: averageValue,
                  status: status,
                  percentage: averageValue > 0 ? Math.round((userValue / averageValue) * 100) : 0
                };
              });

              setTodayNutrition({
                ...nutritionData,
                list: nutritionList
              });
            } else {
              setTodayNutrition({
                ...nutritionData,
                list: []
              });
            }
          } catch (err) {
            console.warn('영양소 비교 데이터 가져오기 실패:', err);
            setTodayNutrition({
              ...nutritionData,
              list: []
            });
          }
        } else {
          setTodayNutrition(null);
        }
      } catch (err) {
        console.error('영양소 데이터 로딩 오류:', err);
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayNutrition();
  }, [selectedDate]);

  // 주간 영양소 데이터
  useEffect(() => {
    const fetchWeeklyNutrition = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) return;

        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // 월요일 시작
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const today = getKoreanDate(); // 오늘 날짜
        
        // 주간 전체 날짜 생성 (월~일)
        const allWeekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        // 오늘 날짜까지만 데이터 가져오기
        const weeklyData = await Promise.all(
          allWeekDays.map(async (day) => {
            // 오늘 이후 날짜는 데이터를 가져오지 않음
            const isFuture = isBefore(today, day) && !isSameDay(today, day);
            
            if (isFuture) {
              // 미래 날짜는 빈 데이터로 표시
              return {
                date: day,
                dateStr: toKoreanDateString(day),
                day: format(day, 'EEE', { locale: ko }),
                protein: 0,
                carbs: 0,
                fat: 0,
                isEmpty: true,
              };
            }
            
            const dateStr = toKoreanDateString(day);
            const { data: mealSummary } = await api.meals.getMealSummary(dateStr, userIdNum as any);
            
            return {
              date: day,
              dateStr: dateStr,
              day: format(day, 'EEE', { locale: ko }),
              protein: mealSummary?.total_protein || 0,
              carbs: mealSummary?.total_carbs || 0,
              fat: mealSummary?.total_fat || 0,
              isEmpty: false,
            };
          })
        );

        setWeeklyNutrition(weeklyData);
      } catch (err) {
        console.error('주간 영양소 데이터 로딩 오류:', err);
      }
    };

    fetchWeeklyNutrition();
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '부족': return 'text-red-600 bg-red-100';
      case '과다': return 'text-orange-600 bg-orange-100';
      case '적정': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNutrientColor = (nutrient: string) => {
    const colors: Record<string, string> = {
      '칼로리': '#9CA3AF',
      '탄수화물': '#3B82F6',
      '단백질': '#10B981',
      '지방': '#F59E0B',
      '당류': '#EF4444',
      '포화지방': '#A855F7',
      '트랜스지방': '#EC4899',
      '콜레스테롤': '#06B6D4',
      '나트륨': '#10B981',
    };
    return colors[nutrient] || '#6B7280';
  };

  const getNutrientInfo = (nutrient: string) => {
    if (!todayNutrition) return { user: 0, average: 0, status: '적정', percentage: 0 };
    
    // 영양소 이름을 todayNutrition 속성명으로 매핑
    const nutrientMap: Record<string, string> = {
      '칼로리': 'calories',
      '탄수화물': 'carbs',
      '단백질': 'protein',
      '지방': 'fat',
      '당류': 'sugar',
      '포화지방': 'saturatedFat',
      '트랜스지방': 'transFat',
      '콜레스테롤': 'cholesterol',
      '나트륨': 'sodium',
    };
    
    // Excel 파일의 영양소 이름
    const excelNutrientMap: Record<string, string[]> = {
      '칼로리': ['에너지 섭취량', '에너지'],
      '탄수화물': ['탄수화물'],
      '단백질': ['단백질'],
      '지방': ['지방'],
      '당류': ['당류', '당'],
      '포화지방': ['포화지방산', '포화지방'],
      '트랜스지방': ['트랜스지방산', '트랜스지방'],
      '콜레스테롤': ['콜레스테롤'],
      '나트륨': ['나트륨'],
    };
    
    // 사용자 섭취량 가져오기
    const propertyName = nutrientMap[nutrient];
    const value = propertyName ? (todayNutrition[propertyName] || 0) : 0;
    
    // 포화지방, 트랜스지방, 콜레스테롤은 연령대별 고정 기준값 사용
    const userAge = userProfile?.age || 0;
    let avg = 0;
    let isLimitBased = false;
    
    if (nutrient === '포화지방' || nutrient === '트랜스지방' || nutrient === '콜레스테롤') {
      isLimitBased = true;
      
      if (nutrient === '포화지방') {
        if (userAge <= 2) {
          avg = 0;
        } else if (userAge <= 18) {
          avg = 8; 
        } else if (userAge === 19) {
          avg = 7; 
        } else {
          avg = 7; 
        }
      } else if (nutrient === '트랜스지방') {
        if (userAge <= 2) {
          avg = 0;
        } else {
          avg = 1; // (18세까지, 19세 모두 동일)
        }
      } else if (nutrient === '콜레스테롤') {
        avg = 170; // (19세 이하 기준)
      }
    } else {
      const excelNutrientNames = excelNutrientMap[nutrient] || [nutrient];
      
      if (averageByAgeGroup && averageByAgeGroup.length > 0) {
        // 여러 가능한 이름으로 찾기
        for (const name of excelNutrientNames) {
          const found = averageByAgeGroup.find((a: any) => 
            a.nutrient_name === name || 
            a.nutrient_name?.includes(name) ||
            name.includes(a.nutrient_name)
          );
          if (found) {
            avg = found.average_value || 0;
            break;
          }
        }
        
        // 찾지 못한 경우 디버깅
        if (avg === 0 && value > 0) {
          console.warn(`${nutrient}의 평균값을 찾을 수 없습니다.`, {
            nutrient,
            excelNutrientNames,
            availableNames: averageByAgeGroup.map((a: any) => a.nutrient_name)
          });
        }
      }
    }
    
    // percentage와 status 계산
    let percentage = 0;
    let status = '적정';
    
    if (isLimitBased) {
      // 미만 기준: 0이면 부족, 기준값보다 작으면 적정, 크거나 같으면 과다
      if (avg > 0) {
        percentage = Math.round((value / avg) * 100);
      }
      if (value === 0) {
        status = '부족';
      } else if (value < avg) {
        status = '적정';
      } else {
        status = '과다';
      }
    } else {
      // 일반 영양소: 평균 대비 비율로 판단
      percentage = avg > 0 ? Math.round((value / avg) * 100) : 0;
      if (percentage < 80) {
        status = '부족';
      } else if (percentage > 100) {
        status = '과다';
      } else {
        status = '적정';
      }
    }
    
    return { user: value, average: avg, status, percentage };
  };

  // 주간 평균 계산 (데이터가 있는 날짜만 계산)
  const daysWithData = weeklyNutrition.filter(day => !day.isEmpty);
  const weeklyAverage = daysWithData.length > 0 ? {
    protein: Math.round((daysWithData.reduce((sum, day) => sum + day.protein, 0) / daysWithData.length) * 10) / 10,
    carbs: Math.round((daysWithData.reduce((sum, day) => sum + day.carbs, 0) / daysWithData.length) * 10) / 10,
    fat: Math.round((daysWithData.reduce((sum, day) => sum + day.fat, 0) / daysWithData.length) * 10) / 10,
  } : { protein: 0, carbs: 0, fat: 0 };

  // 주간 그래프의 최대값 계산 (실제 데이터가 있는 날짜만 기반)
  const maxWeeklyValue = daysWithData.length > 0 
    ? Math.max(...daysWithData.map(day => day.protein + day.carbs + day.fat))
    : 600;
  const graphMaxValue = Math.ceil(maxWeeklyValue / 150) * 150;

  // 권장량 (연령대 평균 기준)
  const recommended = averageByAgeGroup ? {
    protein: averageByAgeGroup.find((a: any) => a.nutrient_name === '단백질')?.average_value || 80,
    carbs: averageByAgeGroup.find((a: any) => a.nutrient_name === '탄수화물')?.average_value || 300,
    fat: averageByAgeGroup.find((a: any) => a.nutrient_name === '지방')?.average_value || 60,
  } : { protein: 80, carbs: 300, fat: 60 };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        <div className="text-center py-8">
          <div className="text-lg font-medium text-gray-600">영양소 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        <div className="text-center py-8">
          <div className="text-lg font-medium text-red-600">데이터를 불러올 수 없습니다.</div>
          <div className="text-sm text-gray-500 mt-2">{error}</div>
        </div>
      </div>
    );
  }

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  return (
    <motion.div
      className="container mx-auto px-4 py-6 space-y-6 max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold">영양분석</h1>

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">분석 날짜:</label>
          <input
            type="date"
            value={toKoreanDateString(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={() => setSelectedDate(getKoreanDate())}
            className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            오늘
          </button>
        </div>
      </motion.div>

      {/* BMI 분석 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">BMI 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {userStats.weight > 0 && userStats.height > 0 ? (
              <>
                <div className="text-center space-y-2 mb-6">
                  <div className="text-lg">
                    신체질량지수(BMI)는 <span className="font-bold text-lg" style={{ color: bmiColor }}>{bmi}</span> 로 
                    '<span className="font-bold" style={{ color: bmiColor }}>{bmiStatus}</span>' 입니다.
                  </div>
                  <div className="text-sm text-gray-600">
                    평균체중은 <span className="font-bold">{averageWeight}kg</span> 입니다.
                  </div>
                </div>

                <div className="relative mt-4">
                  {bmi > 0 && (
                    <div
                      className="absolute top-0 flex flex-col items-center z-10"
                      style={{
                        left: `${(() => {
                          const visualRatios = [35, 25, 15, 25];
                          
                          if (bmi < 18.5) {
                            return (bmi / 18.5) * 35;
                          } else if (bmi < 23) {
                            const rangeStart = 35;
                            const rangeWidth = 25;
                            const bmiInRange = bmi - 18.5;
                            const rangeRatio = bmiInRange / (23 - 18.5);
                            return rangeStart + (rangeRatio * rangeWidth);
                          } else if (bmi < 25) {
                            const rangeStart = 35 + 25;
                            const rangeWidth = 15;
                            const bmiInRange = bmi - 23;
                            const rangeRatio = bmiInRange / (25 - 23);
                            return rangeStart + (rangeRatio * rangeWidth);
                          } else {
                            const rangeStart = 35 + 25 + 15;
                            const rangeWidth = 25;
                            const bmiInRange = bmi - 25;
                            const rangeRatio = Math.min(bmiInRange / (35 - 25), 1);
                            return rangeStart + (rangeRatio * rangeWidth);
                          }
                        })()}%`,
                        transform: 'translateX(-50%) translateY(-100%)',
                      }}
                    >
                      <div className="text-xl text-gray-800 font-bold leading-none">▼</div>
                    </div>
                  )}
                  
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                    {bmiRanges.map((range, index) => {
                      const visualRatios = [35, 25, 15, 25];
                      let startPercent = 0;
                      
                      for (let i = 0; i < index; i++) {
                        startPercent += visualRatios[i];
                      }
                      
                      const widthPercent = visualRatios[index];
                      
                      return (
                        <div key={range.name}>
                          <div
                            className="absolute h-full"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: range.color,
                            }}
                          />
                          <div
                            className="absolute h-full flex items-center justify-center"
                            style={{
                              left: `${startPercent + (widthPercent / 2)}%`,
                              width: `${widthPercent}%`,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <span className="text-xs font-medium text-white drop-shadow-lg whitespace-nowrap">
                              {range.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="relative text-xs text-gray-500 mt-2 mb-2">
                    <span className="absolute" style={{ left: '0%', transform: 'translateX(-50%)' }}>0</span>
                    <span className="absolute" style={{ left: '35%', transform: 'translateX(-50%)' }}>18.5</span>
                    <span className="absolute" style={{ left: '60%', transform: 'translateX(-50%)' }}>23</span>
                    <span className="absolute" style={{ left: '75%', transform: 'translateX(-50%)' }}>25</span>
                    <span className="absolute" style={{ left: '100%', transform: 'translateX(-50%)' }}>30</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center mt-5">
                    <div className="text-gray-500">키</div>
                    <div className="font-medium">{userStats.height}cm</div>
                  </div>
                  <div className="text-center mt-5">
                    <div className="text-gray-500">체중</div>
                    <div className="font-medium">{userStats.weight}kg</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg font-medium text-gray-600 mb-2">
                  BMI 분석을 위한 정보가 없습니다
                </div>
                <div className="text-sm text-gray-500">
                  내정보 페이지에서 키와 체중을 입력해주세요
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* 오늘의 영양소 섭취량 분석 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg pb-2">
            {isSameDay(selectedDate, getKoreanDate()) 
              ? '오늘의 영양소 섭취량 분석' 
              : `${format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}의 섭취량 분석`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {todayNutrition ? (
              <>
                {(isKidsMode 
                  ? ['칼로리', '탄수화물', '단백질', '지방'] 
                  : ['칼로리', '탄수화물', '단백질', '지방', '당류', '포화지방', '트랜스지방', '콜레스테롤', '나트륨']
                ).map((nutrient) => {
                  const info = getNutrientInfo(nutrient);
                  const color = getNutrientColor(nutrient);
                  const unit = nutrient === '칼로리' ? 'kcal' : nutrient === '나트륨' || nutrient === '콜레스테롤' ? 'mg' : 'g';
                  
                  return (
                    <div key={nutrient} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{nutrient}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(info.status)}`}>
                            {info.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <span className="font-medium">{formatInt(info.user)}</span>
                          {' / '}
                          <span className="font-medium">{formatInt(info.average)}</span>
                          <span className="text-gray-500">{unit}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(info.percentage, 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          <span style={{
                            color: info.percentage > 50 ? 'white' : '#374151',
                            textShadow: info.percentage > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                            fontWeight: 600
                          }}>
                            {info.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg font-medium">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}에 등록된 식사 데이터가 없습니다.
                </div>
                <div className="text-sm mt-2">해당 날짜에 식사를 추가한 후 다시 확인해주세요.</div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* 주간 영양소 섭취 현황 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold pb-2">주간 영양소 섭취 현황</CardTitle>
            <div className="text-sm text-gray-600 pb-2">
              {format(weekStart, 'M월 d일', { locale: ko })} ~ {format(weekEnd, 'M월 d일', { locale: ko })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-64">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90 origin-center">
                <span className="text-sm font-medium text-gray-700">섭취량 (g)</span>
              </div>
              
              <div className="absolute left-6 top-0 h-full flex flex-col justify-between text-xs text-gray-500 font-medium pr-2">
                <span>{graphMaxValue}</span>
                <span>{Math.round(graphMaxValue * 0.8)}</span>
                <span>{Math.round(graphMaxValue * 0.6)}</span>
                <span>{Math.round(graphMaxValue * 0.4)}</span>
                <span>{Math.round(graphMaxValue * 0.2)}</span>
                <span>0</span>
              </div>
              
              <div className="ml-16 h-full relative overflow-visible">
                <div className="absolute inset-0">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div 
                      key={i}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${i * 20}%` }}
                    />
                  ))}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between gap-1 overflow-visible">
                  {weeklyNutrition.map((day, index) => {
                    const total = day.protein + day.carbs + day.fat;
                    
                    const totalHeightPercent = Math.min((total / graphMaxValue) * 100, 100);
                    
                    const proteinRatio = total > 0 ? day.protein / total : 0;
                    const fatRatio = total > 0 ? day.fat / total : 0;
                    const carbsRatio = total > 0 ? day.carbs / total : 0;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1 flex flex-col items-center h-full relative"
                      >
                        <div className="relative w-full h-full flex items-end">
                          {!day.isEmpty ? (
                            <div className="relative w-full overflow-hidden rounded-t cursor-pointer" style={{ 
                              height: `${totalHeightPercent}%`,
                              minHeight: total > 0 ? '4px' : '0'
                            }}>
                              {day.protein > 0 && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-green-500"
                                  style={{ 
                                    height: `${proteinRatio * 100}%`,
                                    minHeight: proteinRatio > 0 ? '2px' : '0'
                                  }}
                                />
                              )}
                              {day.fat > 0 && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-orange-500"
                                  style={{ 
                                    height: `${fatRatio * 100}%`,
                                    bottom: `${proteinRatio * 100}%`,
                                    minHeight: fatRatio > 0 ? '2px' : '0'
                                  }}
                                />
                              )}
                              {day.carbs > 0 && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t"
                                  style={{ 
                                    height: `${carbsRatio * 100}%`,
                                    bottom: `${(proteinRatio + fatRatio) * 100}%`,
                                    minHeight: carbsRatio > 0 ? '2px' : '0'
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-0"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between gap-1 mt-4 ml-16">
              {weeklyNutrition.map((day, index) => (
                <div key={index} className="flex-1 flex justify-center">
                  <div className="text-xs text-gray-600 font-medium">{day.day}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">단백질</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">지방</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">탄수화물</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900">단백질</span>
                </div>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(weeklyAverage.protein)}g</div>
                  <div className="text-xs text-gray-600">주간 평균</div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex justify-between items-center text-sm text-gray-900">
                    <span>권장</span>
                    <span>{Math.round(recommended.protein)}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {recommended.protein > 0 ? (
                    <>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((weeklyAverage.protein / recommended.protein) * 100)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        weeklyAverage.protein < recommended.protein * 0.8 
                          ? 'bg-yellow-100 text-gray-900' 
                          : weeklyAverage.protein > recommended.protein * 1.0
                          ? 'bg-orange-100 text-gray-900'
                          : 'bg-green-100 text-gray-900'
                      }`}>
                        {weeklyAverage.protein < recommended.protein * 0.8 ? '부족' : weeklyAverage.protein > recommended.protein * 1.0 ? '과다' : '적정'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-900">지방</span>
                </div>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(weeklyAverage.fat)}g</div>
                  <div className="text-xs text-gray-600">주간 평균</div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex justify-between items-center text-sm text-gray-900">
                    <span>권장</span>
                    <span>{Math.round(recommended.fat)}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {recommended.fat > 0 ? (
                    <>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((weeklyAverage.fat / recommended.fat) * 100)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        weeklyAverage.fat < recommended.fat * 0.8 
                          ? 'bg-yellow-100 text-gray-900' 
                          : weeklyAverage.fat > recommended.fat * 1.0
                          ? 'bg-orange-100 text-gray-900'
                          : 'bg-green-100 text-gray-900'
                      }`}>
                        {weeklyAverage.fat < recommended.fat * 0.8 ? '부족' : weeklyAverage.fat > recommended.fat * 1.0 ? '과다' : '적정'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-900">탄수화물</span>
                </div>
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(weeklyAverage.carbs)}g</div>
                  <div className="text-xs text-gray-600">주간 평균</div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex justify-between items-center text-sm text-gray-900">
                    <span>권장</span>
                    <span>{Math.round(recommended.carbs)}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {recommended.carbs > 0 ? (
                    <>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((weeklyAverage.carbs / recommended.carbs) * 100)}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        weeklyAverage.carbs < recommended.carbs * 0.8 
                          ? 'bg-yellow-100 text-gray-900' 
                          : weeklyAverage.carbs > recommended.carbs * 1.0
                          ? 'bg-orange-100 text-gray-900'
                          : 'bg-green-100 text-gray-900'
                      }`}>
                        {weeklyAverage.carbs < recommended.carbs * 0.8 ? '부족' : weeklyAverage.carbs > recommended.carbs * 1.0 ? '과다' : '적정'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
