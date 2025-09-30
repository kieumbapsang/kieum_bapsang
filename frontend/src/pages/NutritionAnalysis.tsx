import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../api/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

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

export const NutritionAnalysisPage: React.FC = () => {
  // BMI 데이터 상태
  const [userStats, setUserStats] = useState({
    weight: 70, // kg
    height: 170, // cm
  });

  // 영양소 비교 데이터 상태
  const [nutritionComparison, setNutritionComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date()); // 현재 날짜로 설정

  const bmi = calculateBMI(userStats.weight, userStats.height);
  const bmiStatus = getBMIStatus(bmi);
  const bmiColor = getBMIColor(bmi);

  // BMI 범위 데이터
  const bmiRanges = [
    { range: '저체중', min: 0, max: 18.5, current: bmi <= 18.5 ? bmi : null },
    { range: '정상', min: 18.5, max: 23, current: bmi > 18.5 && bmi <= 23 ? bmi : null },
    { range: '과체중', min: 23, max: 25, current: bmi > 23 && bmi <= 25 ? bmi : null },
    { range: '비만', min: 25, max: 35, current: bmi > 25 ? bmi : null },
  ];

  // 영양소 비교 데이터 가져오기
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        const targetDate = selectedDate.toISOString().split('T')[0]; // 선택된 날짜
        const userId = 1; // 임시로 1번 사용자 사용

        // 영양소 비교 데이터 가져오기
        const { data: comparisonData, error: comparisonError } = await api.nutrition.compareUserNutrition(userId, targetDate);
        
        if (comparisonError) {
          setError(comparisonError);
          return;
        }

        // API 응답이 성공적이고 데이터가 있는지 확인
        if (comparisonData && comparisonData.comparisons) {
          // API 응답 데이터를 UI에 맞게 변환
          const formattedData = comparisonData.comparisons.map((item: any) => ({
            nutrient: item.nutrient_name,
            unit: item.unit,
            user: item.user_intake,
            average: item.average_intake,
            difference: item.difference,
            percentage: item.percentage_diff.toFixed(1),
            status: item.status
          }));
          
          setNutritionComparison(formattedData);
        } else {
          // 데이터가 없거나 실패한 경우 - 테이블에만 빈 배열로 설정
          setNutritionComparison([]);
        }
      } catch (err) {
        console.error('영양소 데이터 로딩 오류:', err);
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, [selectedDate]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case '부족': return 'text-red-600 bg-red-100';
      case '과다': return 'text-orange-600 bg-orange-100';
      case '적정': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '부족': return '⬇️';
      case '과다': return '⬆️';
      case '적정': return '✅';
      default: return '❓';
    }
  };


  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        <div className="text-center py-8">
          <div className="text-lg font-medium text-gray-600">영양소 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
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

  return (
    <motion.div
      className="container mx-auto px-4 py-6 space-y-6 max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <motion.h1 
        className="text-xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        영양 분석
      </motion.h1>

      {/* 날짜 선택기 */}
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
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            오늘
          </button>
        </div>
      </motion.div>

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
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold" style={{ color: bmiColor }}>
                  {bmi}
                </div>
                <div className="text-lg font-medium" style={{ color: bmiColor }}>
                  {bmiStatus}
                </div>
              </div>

              <div className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bmiRanges} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 35]} />
                    <YAxis dataKey="range" type="category" />
                    <Tooltip />
                    <Bar
                      dataKey="max"
                      fill="#E5E7EB"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="current"
                      fill={bmiColor}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-500">키</div>
                  <div className="font-medium">{userStats.height} cm</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">체중</div>
                  <div className="font-medium">{userStats.weight} kg</div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* 영양소 비교 분석 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              영양소 섭취량 비교 분석 ({selectedDate.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 기준)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* 요약 통계 */}
              {nutritionComparison.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">30세</div>
                    <div className="text-sm text-gray-600">연령대</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {nutritionComparison.filter(n => n.status === '적정').length}
                    </div>
                    <div className="text-sm text-gray-600">적정</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">
                      {nutritionComparison.filter(n => n.status === '부족').length}
                    </div>
                    <div className="text-sm text-gray-600">부족</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {nutritionComparison.filter(n => n.status === '과다').length}
                    </div>
                    <div className="text-sm text-gray-600">과다</div>
                  </div>
                </div>
              ) : null}

              {/* 영양소별 상세 비교 표 */}
              <div className="overflow-x-auto">
                {nutritionComparison.length === 0 ? (
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
                ) : (
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">영양소</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">나의 섭취량</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">평균</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">차이</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">비율</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutritionComparison.map((item, index) => (
                        <motion.tr 
                          key={index} 
                          className="border-b border-gray-100 hover:bg-gray-50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900 text-sm">
                            {item.nutrient}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-700 text-sm">
                            {item.user.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-700 text-sm">
                            {item.average.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium text-sm ${item.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.difference >= 0 ? '+' : ''}{item.difference.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium text-sm ${parseFloat(item.percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(item.percentage) >= 0 ? '+' : ''}{item.percentage}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                              {getStatusIcon(item.status)} {item.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 추가 정보 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">분석 기준</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>적정:</strong> 평균 대비 ±20% 범위 내</li>
                  <li>• <strong>부족:</strong> 평균 대비 -20% 미만</li>
                  <li>• <strong>과다:</strong> 평균 대비 +20% 초과</li>
                  <li>• 30-49세 연령대 평균 기준</li>
                </ul>
              </div>
            </motion.div>
          </CardContent>
        </Card>

    </motion.div>
  );
};