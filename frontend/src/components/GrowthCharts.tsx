/**
 * GrowthCharts 컴포넌트 (시안 기반)
 *
 * Kids Mode 성장 차트 슬라이더 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 3개 차트 슬라이더: 키, 체중, BMI
 * - Recharts 라이브러리 사용 (AreaChart, LineChart)
 * - 네비게이션 버튼 (이전/다음)
 * - 인디케이터 점 (3개)
 * - 그라데이션 효과
 */

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Ruler, Weight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

/**
 * 키 성장 데이터
 */
const heightData = [
  { month: '1월', height: 138 },
  { month: '2월', height: 139 },
  { month: '3월', height: 140 },
  { month: '4월', height: 141 },
  { month: '5월', height: 143 },
  { month: '6월', height: 144 },
  { month: '7월', height: 145 },
];

/**
 * 체중 변화 데이터
 */
const weightData = [
  { month: '1월', weight: 34 },
  { month: '2월', weight: 35 },
  { month: '3월', weight: 35 },
  { month: '4월', weight: 36 },
  { month: '5월', weight: 37 },
  { month: '6월', weight: 37 },
  { month: '7월', weight: 38 },
];

/**
 * BMI 추이 데이터
 */
const bmiData = [
  { month: '1월', bmi: 17.8, average: 17.5 },
  { month: '2월', bmi: 18.1, average: 17.6 },
  { month: '3월', bmi: 17.9, average: 17.6 },
  { month: '4월', bmi: 18.1, average: 17.7 },
  { month: '5월', bmi: 18.1, average: 17.7 },
  { month: '6월', bmi: 17.8, average: 17.8 },
  { month: '7월', bmi: 18.1, average: 17.8 },
];

/**
 * GrowthCharts 컴포넌트
 *
 * 키, 체중, BMI 성장 차트를 슬라이더 형태로 표시합니다.
 * 사용자는 화살표 버튼이나 인디케이터를 클릭하여 차트 간 이동할 수 있습니다.
 *
 * @returns {React.ReactElement} GrowthCharts UI
 *
 * @example
 * ```tsx
 * <GrowthCharts />
 * ```
 */
export function GrowthCharts() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const charts = [
    {
      title: '키 성장 그래프',
      icon: Ruler,
      iconColor: 'text-blue-600',
      chart: (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={heightData}>
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[130, 150]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorHeight)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
      description: (
        <p className="text-sm text-gray-600 text-center mt-4">
          🎉 지난 6개월 동안 <strong className="text-blue-600">7cm</strong>나 자랐어요!
        </p>
      ),
    },
    {
      title: '체중 변화 그래프',
      icon: Weight,
      iconColor: 'text-purple-600',
      chart: (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weightData}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[30, 40]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#colorWeight)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
      description: (
        <p className="text-sm text-gray-600 text-center mt-4">
          💪 건강하게 <strong className="text-purple-600">4kg</strong> 증가했어요!
        </p>
      ),
    },
    {
      title: 'BMI 추이 (나 vs 또래 평균)',
      icon: TrendingUp,
      iconColor: 'text-green-600',
      chart: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={bmiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[16, 20]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bmi"
              stroke="#10B981"
              strokeWidth={3}
              name="내 BMI"
              dot={{ fill: '#10B981', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="또래 평균"
              dot={{ fill: '#94A3B8', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
      description: (
        <p className="text-sm text-gray-600 text-center mt-4">
          ✨ 또래 평균과 비슷하게 건강하게 자라고 있어요!
        </p>
      ),
    },
  ];

  /**
   * 다음 슬라이드로 이동
   */
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % charts.length);
  };

  /**
   * 이전 슬라이드로 이동
   */
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + charts.length) % charts.length);
  };

  /**
   * 특정 슬라이드로 이동
   */
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentChart = charts[currentSlide];
  const Icon = currentChart.icon;

  return (
    <Card className="p-6 border-2 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${currentChart.iconColor}`} />
          {currentChart.title}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="chevron-left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="chevron-right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="touch-pan-y">{currentChart.chart}</div>

      {/* Description */}
      {currentChart.description}

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {charts.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-green-500'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`그래프 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </Card>
  );
}
