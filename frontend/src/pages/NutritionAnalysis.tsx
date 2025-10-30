import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../api/client';
import { getKoreanDate, toKoreanDateString } from '../lib/utils';

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
    weight: 0, // kg
    height: 0, // cm
  });

  // 영양소 비교 데이터 상태
  const [nutritionComparison, setNutritionComparison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getKoreanDate()); // 한국 시간대 현재 날짜로 설정
  const [userProfile, setUserProfile] = useState<any>(null);

  const bmi = calculateBMI(userStats.weight, userStats.height);
  const bmiStatus = getBMIStatus(bmi);
  const bmiColor = getBMIColor(bmi);

  // BMI 범위 데이터 (수평 막대 차트용) - 4가지 색상
  const bmiRanges = [
    { name: '저체중', min: 0, max: 18.5, color: '#3B82F6' }, // 파란색
    { name: '정상', min: 18.5, max: 23, color: '#10B981' }, // 초록색
    { name: '과체중', min: 23, max: 25, color: '#F59E0B' }, // 주황색
    { name: '비만', min: 25, max: 35, color: '#EF4444' }, // 빨간색
  ];

  // 평균 체중 계산 (BMI 22 기준)
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
          console.log('✅ 사용자 프로필 로딩 완료:', profileData);
        }
      } catch (err) {
        console.error('사용자 프로필 로딩 오류:', err);
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    };

    fetchUserProfile();
  }, []);

  // 영양소 비교 데이터 가져오기
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        const targetDate = toKoreanDateString(selectedDate); // 선택된 날짜
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
          setError('사용자 정보를 찾을 수 없습니다. 로그인해주세요.');
          return;
        }

        // 영양소 비교 데이터 가져오기
        const { data: comparisonData, error: comparisonError } = await api.nutrition.compareUserNutrition(parseInt(userId), targetDate);
        
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
      <h1 className="text-2xl font-bold">영양분석</h1>

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
                  {/* BMI 정보 텍스트 */}
                  <div className="text-center space-y-2 mb-4">
                    <div className="text-lg">
                      신체질량지수(BMI)는 <span className="font-bold text-lg" style={{ color: bmiColor }}>{bmi}</span> 로 
                      '<span className="font-bold" style={{ color: bmiColor }}>{bmiStatus}</span>' 입니다.
                    </div>
                    <div className="text-sm text-gray-600">
                      평균체중은 <span className="font-bold">{averageWeight}kg</span> 입니다.
                    </div>
                  </div>

                  {/* 수평 BMI 차트 */}
                  <div className="relative">
                    <div className="h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                      {bmiRanges.map((range, index) => {
                        // 시각적 균형을 위한 조정된 비율 (저체중 비율 줄임)
                        const visualRatios = [35, 25, 15, 25]; // 저체중, 정상, 과체중, 비만
                        let startPercent = 0;
                        
                        // 이전 구간들의 누적 비율 계산
                        for (let i = 0; i < index; i++) {
                          startPercent += visualRatios[i];
                        }
                        
                        const widthPercent = visualRatios[index];
                        const endPercent = startPercent + widthPercent;
                        
                        return (
                          <div key={range.name}>
                            {/* 시각적 균형에 따른 배경 */}
                            <div
                              className="absolute h-full"
                              style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                backgroundColor: range.color,
                              }}
                            />
                            
                            {/* 텍스트 라벨 (범위 중앙에 배치) */}
                            <div
                              className="absolute h-full flex items-center justify-center"
                              style={{
                                left: `${startPercent + (widthPercent / 2)}%`,
                                width: `${widthPercent}%`,
                                transform: 'translateX(-50%)',
                              }}
                            >
                              <span 
                                className="text-xs font-medium text-white drop-shadow-lg whitespace-nowrap"
                              >
                                {range.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* BMI 마커 (삼각형) - 차트 상단에 배치 */}
                      <div
                        className="absolute top-0 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-black"
                        style={{
                          left: `${Math.min((bmi / 30) * 100, 95)}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                    
                    {/* BMI 스케일 라벨 */}
                    <div className="relative text-xs text-gray-500 mt-2 mb-2">
                      <span className="absolute" style={{ left: '0%', transform: 'translateX(-50%)' }}>0</span>
                      <span className="absolute" style={{ left: '35%', transform: 'translateX(-50%)' }}>18.5</span>
                      <span className="absolute" style={{ left: '60%', transform: 'translateX(-50%)' }}>23</span>
                      <span className="absolute" style={{ left: '75%', transform: 'translateX(-50%)' }}>25</span>
                      <span className="absolute" style={{ left: '100%', transform: 'translateX(-50%)' }}>30</span>
                    </div>
                  </div>

                  {/* 사용자 정보 */}
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
                        {/* <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">차이</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">비율</th> */}
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
                          {/* <td className="text-right py-3 px-4">
                            <span className={`font-medium text-sm ${item.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.difference >= 0 ? '+' : ''}{item.difference.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-medium text-sm ${parseFloat(item.percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(item.percentage) >= 0 ? '+' : ''}{item.percentage}%
                            </span>
                          </td> */}
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

        {/* 일주일간 영양소 비교 분석 그래프 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              영양소 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
                {/* 꺾은선 그래프 */}
                <div className="relative h-96">
                  {/* Y축 눈금 */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 font-medium">
                    <span>260</span>
                    <span>195</span>
                    <span>130</span>
                    <span>65</span>
                    <span>0</span>
                  </div>
                  
                  {/* 그래프 영역 */}
                  <div className="ml-16 h-full relative">
                    {/* 격자선 */}
                    <div className="absolute inset-0">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div 
                          key={i}
                          className="absolute w-full border-t border-gray-200"
                          style={{ top: `${i * 25}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* 꺾은선 그래프 */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* 탄수화물 (파란색) - 상단 */}
                      <polyline
                        points="0,8 16.67,5 33.33,15 50,3 66.67,8 83.33,5 100,3"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* 단백질 (초록색) - 중간 */}
                      <polyline
                        points="0,73 16.67,70 33.33,78 50,65 66.67,73 83.33,70 100,68"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* 지방 (주황색) - 하단 */}
                      <polyline
                        points="0,88 16.67,90 33.33,85 50,88 66.67,90 83.33,88 100,89"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    
                    {/* 데이터 포인트 */}
                    <div className="absolute inset-0">
                      {/* 탄수화물 포인트 */}
                      {[
                        { x: 0, y: 8, value: 220 },
                        { x: 16.67, y: 5, value: 240 },
                        { x: 33.33, y: 15, value: 200 },
                        { x: 50, y: 3, value: 260 },
                        { x: 66.67, y: 8, value: 220 },
                        { x: 83.33, y: 5, value: 250 },
                        { x: 100, y: 3, value: 260 }
                      ].map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1.5 -translate-y-1.5 border border-blue-500 shadow-sm"
                          style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        />
                      ))}
                      
                      {/* 단백질 포인트 */}
                      {[
                        { x: 0, y: 73, value: 65 },
                        { x: 16.67, y: 70, value: 70 },
                        { x: 33.33, y: 78, value: 60 },
                        { x: 50, y: 65, value: 75 },
                        { x: 66.67, y: 73, value: 65 },
                        { x: 83.33, y: 70, value: 70 },
                        { x: 100, y: 68, value: 75 }
                      ].map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1.5 -translate-y-1.5 border border-green-500 shadow-sm"
                          style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        />
                      ))}
                      
                      {/* 지방 포인트 */}
                      {[
                        { x: 0, y: 88, value: 60 },
                        { x: 16.67, y: 90, value: 55 },
                        { x: 33.33, y: 85, value: 65 },
                        { x: 50, y: 88, value: 60 },
                        { x: 66.67, y: 90, value: 55 },
                        { x: 83.33, y: 88, value: 60 },
                        { x: 100, y: 89, value: 58 }
                      ].map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1.5 -translate-y-1.5 border border-orange-500 shadow-sm"
                          style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* X축 라벨 */}
                  <div className="absolute bottom-0 left-16 right-0 flex justify-between text-sm text-gray-600 font-medium">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                      <div key={day} className="text-center" style={{ width: `${100/7}%` }}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 요약 정보 - 이미지와 정확히 동일한 스타일 */}
                <div className="mt-8 flex justify-center space-x-12">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">78g</div>
                    <div className="text-sm text-gray-600">단백질</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">244g</div>
                    <div className="text-sm text-gray-600">탄수화물</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">66g</div>
                    <div className="text-sm text-gray-600">지방</div>
                  </div>
                </div>
            </motion.div>
          </CardContent>
        </Card>

    </motion.div>
  );
};