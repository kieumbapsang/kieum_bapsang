import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/Button';
import { MealRecord } from '../RecentMeals';

interface EditMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: MealRecord | null;
  onSave: (meal: MealRecord) => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  open,
  onOpenChange,
  meal,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    grams: '',
    time: '',
  });

  useEffect(() => {
    if (meal) {
      setFormData({
        foodName: meal.foodName,
        calories: meal.calories.toString(),
        grams: meal.grams.toString(),
        time: meal.time,
      });
    }
  }, [meal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meal) {
      onSave({
        ...meal,
        foodName: formData.foodName,
        calories: Number(formData.calories),
        grams: Number(formData.grams),
        time: formData.time,
        unit: meal.unit || 'g', // 단위 정보 유지
      });
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">식사 정보 수정</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Food Name */}
            <div>
              <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-2">
                음식 이름 🍽️
              </label>
              <input
                id="foodName"
                name="foodName"
                type="text"
                value={formData.foodName}
                onChange={handleChange}
                className="input-field"
                placeholder="예: 김밥, 떡볶이"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                시간 ⏰
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Calories and Grams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
                  칼로리 🔥
                </label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="kcal"
                  required
                />
              </div>

              <div>
                <label htmlFor="grams" className="block text-sm font-medium text-gray-700 mb-2">
                  양 (g) ⚖️
                </label>
                <input
                  id="grams"
                  name="grams"
                  type="number"
                  value={formData.grams}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="그램"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 gradient-blue text-white shadow-lg btn-animation rounded-xl"
              >
                수정하기
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
