/**
 * AddMealButton 컴포넌트 (시안 기반)
 *
 * Kids Mode 식사 추가 버튼 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 3개 버튼: 사진으로 추가 (초록), 직접 입력하기 (파랑), 가맹점 찾기 (보라)
 * - 그리드 레이아웃: grid-cols-1 md:grid-cols-3
 * - 호버 효과: hover:shadow-lg, hover:border-color, hover:scale-110 (아이콘)
 * - 아이콘 크기: w-16 h-16 (컨테이너), w-8 h-8 (아이콘)
 */

import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Camera, PlusCircle, MapPin } from 'lucide-react';
import { AddMealModal } from '../features/meals/components/AddMealModal';
import { Meal } from '../features/meals/components/MealCard';

/**
 * AddMealButton Props 인터페이스
 */
export interface AddMealButtonProps {
  /**
   * 가맹점 찾기 클릭 시 호출되는 콜백
   */
  onNavigateToStore?: () => void;
}

/**
 * AddMealButton 컴포넌트
 *
 * Kids Mode에서 식사를 추가하는 세 가지 방법을 제공합니다:
 * 1. 사진으로 추가 - 영양성분표 촬영
 * 2. 직접 입력하기 - 음식 검색 및 선택
 * 3. 가맹점 찾기 - 근처 급식카드 사용 가능 매장
 *
 * @param {AddMealButtonProps} props - 컴포넌트 속성
 * @returns {React.ReactElement} AddMealButton UI
 *
 * @example
 * ```tsx
 * <AddMealButton onNavigateToStore={() => navigate('/stores')} />
 * ```
 */
export const AddMealButton: React.FC<AddMealButtonProps> = ({ onNavigateToStore }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * 사진으로 추가 버튼 클릭 핸들러
   * AddMealModal을 열어 카메라로 식사를 추가합니다.
   */
  const handleCameraClick = () => {
    setIsModalOpen(true);
  };

  /**
   * 직접 입력하기 버튼 클릭 핸들러
   * AddMealModal을 열어 수동으로 식사를 입력합니다.
   */
  const handleManualInputClick = () => {
    setIsModalOpen(true);
  };

  /**
   * 식사 추가 제출 핸들러
   * @param meal - 추가할 식사 데이터
   */
  const handleMealSubmit = (meal: Meal) => {
    console.log('식사 추가:', meal);
    setIsModalOpen(false);
    // TODO: 실제 식사 데이터 저장 로직 구현
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 사진으로 추가 버튼 */}
      <Card
        className="p-6 border-2 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group"
        onClick={handleCameraClick}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-gray-900 mb-1">사진으로 추가</h3>
          <p className="text-sm text-gray-600">영양성분표를 찍으면 자동으로 입력돼요</p>
        </div>
      </Card>

      {/* 직접 입력하기 버튼 */}
      <Card
        className="p-6 border-2 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
        onClick={handleManualInputClick}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-gray-900 mb-1">직접 입력하기</h3>
          <p className="text-sm text-gray-600">먹은 음식을 검색하고 선택해요</p>
        </div>
      </Card>

      {/* 가맹점 찾기 버튼 */}
      <Card
        className="p-6 border-2 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group"
        onClick={onNavigateToStore}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-gray-900 mb-1">가맹점 찾기</h3>
          <p className="text-sm text-gray-600">근처에서 급식카드를 쓸 수 있는 곳</p>
        </div>
      </Card>

      {/* 식사 추가 모달 */}
      <AddMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleMealSubmit}
      />
    </div>
  );
};
