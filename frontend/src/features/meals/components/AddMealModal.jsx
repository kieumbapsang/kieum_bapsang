import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';

export const AddMealModal = ({ isOpen, onClose }) => {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제 구현에서는 API 호출 등의 로직이 들어갑니다
    console.log('식사 추가:', { mealName, calories });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">식사 추가</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">식사 이름</label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-2"
              placeholder="예: 아침, 점심, 간식 등"
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">칼로리 (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-2"
              placeholder="예: 500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">추가하기</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
