import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { api } from '../api/client';

// BMI 계산 함수
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const pieChartVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

// 연령 → 연령대 문자열 매핑
const getAgeGroup = (age: number): string => {
  if (age <= 2) return '1-2세';
  if (age <= 5) return '3-5세';
  if (age <= 11) return '6-11세';
  if (age <= 18) return '12-18세';
  if (age <= 29) return '19-29세';
  if (age <= 49) return '30-49세';
  if (age <= 64) return '50-64세';
  return '65세 이상';
};

// 숫자 포맷터 (천 단위 구분)
const formatInt = (n: number) => Math.round(n).toLocaleString();
const formatGrams1 = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// 실제 식사 데이터 페칭 함수
const fetchDashboardData = async () => {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      throw new Error('사용자 ID가 없습니다.');
    }

    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘의 식사 요약 데이터 가져오기
    const { data: mealSummary, error: summaryError } = await (api.meals.getMealSummary as any)(today, parseInt(userId));
    
    console.log('Dashboard - 오늘 날짜:', today);
    console.log('Dashboard - 사용자 ID:', userId);
    console.log('Dashboard - 식사 요약 데이터:', mealSummary);
    console.log('Dashboard - 에러:', summaryError);
    
    if (summaryError) {
      console.error('식사 요약 데이터 가져오기 실패:', summaryError);
      return {
        userName: null,
        todaySummary: {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          meals_by_period: {}
        },
        alerts: [
          { id: '1', type: 'warning', message: '식사 데이터를 불러올 수 없습니다.' },
        ],
      };
    }

    // 사용자 프로필 정보 가져오기
    const { data: userProfile } = await api.user.getProfile(parseInt(userId));

    // 연령대 평균 영양소 조회 (Excel 기반 DB 데이터)
    let averageNutritionByAge: any | null = null;
    try {
      const age = userProfile?.age ?? null;
      if (typeof age === 'number' && !Number.isNaN(age)) {
        const ageGroup = getAgeGroup(age);
        const { data: avgData } = await (api.nutrition.getAverageNutrition as any)(encodeURIComponent(ageGroup));
        averageNutritionByAge = avgData?.nutrition_data || null;
      }
    } catch (e) {
      console.warn('연령대 평균 영양소 조회 실패(무시하고 진행):', e);
    }

    return {
      userName: userProfile?.username || null,
      userProfile: userProfile,
      todaySummary: mealSummary || {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meals_by_period: {}
      },
      alerts: generateAlerts(mealSummary, averageNutritionByAge, userProfile?.age ?? null),
    };
  } catch (error) {
    console.error('대시보드 데이터 가져오기 실패:', error);
    return {
      userName: null,
      todaySummary: {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meals_by_period: {}
      },
      alerts: [
        { id: '1', type: 'warning', message: '데이터를 불러올 수 없습니다.' },
      ],
    };
  }
};

// 영양소 알림 생성 함수
const generateAlerts = (summary: any, averageNutritionByAge?: any[] | null, userAge?: number | null) => {
  const alerts: Array<{id: string, type: 'warning' | 'info', message: string}> = [];
  
  if (!summary) return alerts;
  
  const { total_calories, total_protein, total_carbs, total_fat } = summary;

  // 연령대 평균값 맵 구성 (엑셀 기반 DB 데이터)
  const averageMap: Record<string, { value: number, unit: string }> = {};
  if (Array.isArray(averageNutritionByAge)) {
    for (const item of averageNutritionByAge) {
      if (item?.nutrient_name && typeof item?.average_value === 'number') {
        averageMap[item.nutrient_name] = { value: item.average_value, unit: item.unit };
      }
    }
  }

  // 비교 대상 영양소(요약 데이터에서 제공되는 4가지 위주)
  const energyAvg = averageMap['에너지 섭취량']?.value;
  const proteinAvg = averageMap['단백질']?.value;
  const carbsAvg = averageMap['탄수화물']?.value;
  const fatAvg = averageMap['지방']?.value;

  // 칼로리: 연령대 평균 대비 80% 미만 또는 120% 초과 시 알림
  if (typeof energyAvg === 'number') {
    if (total_calories < energyAvg * 0.8) {
      alerts.push({
        id: 'calorie-low',
        type: 'warning',
        message: `칼로리 섭취가 연령대 평균의 80% 미만입니다. (${formatInt(total_calories)}/${formatInt(energyAvg)}kcal)`
      });
    } else if (total_calories > energyAvg * 1.2) {
      alerts.push({
        id: 'calorie-high',
        type: 'info',
        message: `칼로리 섭취가 연령대 평균을 초과했습니다. (${formatInt(total_calories)}/${formatInt(energyAvg)}kcal)`
      });
    }
  }

  // 단백질: 평균의 70% 미만 부족 알림
  if (typeof proteinAvg === 'number' && typeof total_protein === 'number') {
    if (total_protein < proteinAvg * 0.7) {
      alerts.push({
        id: 'protein-low',
        type: 'warning',
        message: `단백질 섭취가 부족합니다. (${formatGrams1(total_protein)}/${formatGrams1(proteinAvg)}g)`
      });
    }
  }

  // 탄수화물: 평균의 120% 초과 알림
  if (typeof carbsAvg === 'number' && typeof total_carbs === 'number') {
    if (total_carbs > carbsAvg * 1.2) {
      alerts.push({
        id: 'carbs-high',
        type: 'info',
        message: `탄수화물 섭취가 연령대 평균을 초과했습니다. (${total_carbs.toFixed(1)}/${carbsAvg.toFixed(1)}g)`
      });
    }
  }

  // 지방: 평균의 120% 초과 알림
  if (typeof fatAvg === 'number' && typeof total_fat === 'number') {
    if (total_fat > fatAvg * 1.2) {
      alerts.push({
        id: 'fat-high',
        type: 'info',
        message: `지방 섭취가 연령대 평균을 초과했습니다. (${total_fat.toFixed(1)}/${fatAvg.toFixed(1)}g)`
      });
    }
  }
  
  // 참고: 기존 하드코드 목표값 로직은 평균값이 없을 때만 백업용으로 사용하도록 유지
  if (!energyAvg || !proteinAvg || !carbsAvg || !fatAvg) {
    const calorieGoal = 2000;
    const proteinGoal = 80; // g
    const carbsGoal = 250; // g
    if (total_calories < calorieGoal * 0.8) {
      alerts.push({
        id: 'calorie-low-fallback',
        type: 'warning',
        message: `오늘 칼로리 섭취량이 목표의 80% 미만입니다. (${total_calories}/${calorieGoal}kcal)`
      });
    }
    if (typeof total_protein === 'number' && total_protein < proteinGoal * 0.7) {
      alerts.push({
        id: 'protein-low-fallback',
        type: 'warning',
        message: `단백질 섭취량이 부족합니다. (${total_protein.toFixed(1)}/${proteinGoal}g)`
      });
    }
    if (typeof total_carbs === 'number' && total_carbs > carbsGoal * 1.2) {
      alerts.push({
        id: 'carbs-high-fallback',
        type: 'info',
        message: `탄수화물 섭취량이 목표를 초과했습니다. (${total_carbs.toFixed(1)}/${carbsGoal}g)`
      });
    }
  }
  
  if (alerts.length === 0) {
    alerts.push({
      id: 'good',
      type: 'info',
      message: '오늘의 영양소 섭취가 균형잡혀 있습니다! 👍'
    });
  }
  
  return alerts;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return <div className="p-8 text-center">로딩 중...</div>;
  }

  // 실제 데이터에서 영양소 정보 추출
  const { todaySummary } = dashboardData || {};
  const totalCalories = Math.round(todaySummary?.total_calories || 0);
  const totalProtein = todaySummary?.total_protein || 0;
  const totalCarbs = todaySummary?.total_carbs || 0;
  const totalFat = todaySummary?.total_fat || 0;
  
  console.log('Dashboard 렌더링 - todaySummary:', todaySummary);
  console.log('Dashboard 렌더링 - totalCalories:', totalCalories);

  // 파이 차트 데이터 계산
  const pieChartData = [
    { 
      name: '탄수화물', 
      value: totalCarbs * 4, // 1g 탄수화물 = 4kcal
      color: '#3B82F6',
      grams: totalCarbs
    },
    { 
      name: '단백질', 
      value: totalProtein * 4, // 1g 단백질 = 4kcal
      color: '#10B981',
      grams: totalProtein
    },
    { 
      name: '지방', 
      value: totalFat * 9, // 1g 지방 = 9kcal
      color: '#F59E0B',
      grams: totalFat
    }
  ];

  // 백분율 계산
  const totalMacroCalories = pieChartData.reduce((sum, item) => sum + item.value, 0);
  const proteinPercentage = totalMacroCalories > 0 ? Math.round((pieChartData[1].value / totalMacroCalories) * 100) : 0;
  const carbsPercentage = totalMacroCalories > 0 ? Math.round((pieChartData[0].value / totalMacroCalories) * 100) : 0;
  const fatPercentage = totalMacroCalories > 0 ? Math.round((pieChartData[2].value / totalMacroCalories) * 100) : 0;

  return (
    <motion.div 
      className="container mx-auto px-4 py-6 space-y-6 max-w-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 사용자 환영 메시지 */}
      {/* <motion.div 
        className="flex items-center"
        variants={itemVariants}
      >
        <div>
          {dashboardData?.userName ? (
            <motion.h1 
              className="text-xl font-bold text-gray-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {dashboardData.userName}님, 안녕하세요 👋
            </motion.h1>
          ) : (
            <motion.h1 
              className="text-xl font-medium text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              네트워크를 확인해주세요.
            </motion.h1>
          )}
        </div>
      </motion.div> */}

      {/* 오늘의 섭취 칼로리 */}
      <motion.div variants={itemVariants}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card 
            className="cursor-pointer active:bg-gray-50 transition-colors"
            onClick={() => navigate('/meals')}
          >
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-bold text-center mb-2">오늘의 섭취 칼로리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-2">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-primary-600 tracking-tight">
                    {totalCalories.toLocaleString()} <span className="text-base text-gray-500">kcal</span>
                  </div>
                  {totalCalories === 0 && (
                    <div className="text-sm text-gray-500 mt-2">오늘 등록된 식사가 없습니다</div>
                  )}
                </div>
                {totalCalories > 0 && (
                  <>
                    <motion.div 
                      className="w-full max-w-[180px] h-[180px] relative mb-2"
                      variants={pieChartVariants}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[300px] text-center mt-2">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#3B82F6] mb-1"></div>
                        <div className="text-xs">
                          <div className="font-medium">탄수화물</div>
                          <div className="text-gray-500">{carbsPercentage}%</div>
                          <div className="text-[10px] text-gray-400">({totalCarbs.toFixed(1)}g)</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#10B981] mb-1"></div>
                        <div className="text-xs">
                          <div className="font-medium">단백질</div>
                          <div className="text-gray-500">{proteinPercentage}%</div>
                          <div className="text-[10px] text-gray-400">({totalProtein.toFixed(1)}g)</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B] mb-1"></div>
                        <div className="text-xs">
                          <div className="font-medium">지방</div>
                          <div className="text-gray-500">{fatPercentage}%</div>
                          <div className="text-[10px] text-gray-400">({totalFat.toFixed(1)}g)</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      
      {/* 근처 가맹점 */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">내 근처 가맹점</CardTitle>
              <span className="text-sm text-gray-500">{dashboardData?.userProfile?.address || ''}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  name: '키즈 키친',

                  address: '서대문구 연희동 123-45',
                  tel: '02-1234-5678'
                },
                {
                  id: 2,
                  name: '영양만점 식당',
            
                  address: '서대문구 창천동 56-78',
                  tel: '02-2345-6789'
                },
                {
                  id: 3,
                  name: '성장맘 레스토랑',
                  
                  address: '서대문구 대현동 90-12',
                  tel: '02-3456-7890'
                }
              ].map((store) => (
                <motion.div 
                  key={store.id} 
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{store.name}</h3>

                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-500">{store.address}</p>
                      <p className="text-xs text-gray-500">☎ {store.tel}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 영양 알림 */}
      <motion.div 
        className="space-y-3"
        variants={itemVariants}
      >
        <AnimatePresence>
          {dashboardData?.alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              className={`p-4 rounded-lg flex items-center space-x-3 ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1 
              }}
            >
              <div className="flex-shrink-0">
                {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <p className="text-sm">{alert.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;