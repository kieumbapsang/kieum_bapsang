import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/Button';
import { Character } from '../Character';
import { MealRecord } from '../RecentMeals';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

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
    protein: '',
    carbs: '',
    fat: '',
  });
  const [amountUnit, setAmountUnit] = useState<string>('g');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (meal) {
      setFormData({
        foodName: meal.foodName,
        calories: meal.calories.toString(),
        grams: meal.grams.toString(),
        protein: (meal.protein || 0).toString(),
        carbs: (meal.carbs || 0).toString(),
        fat: (meal.fat || 0).toString(),
      });
      setAmountUnit(meal.unit || 'g');
    }
  }, [meal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setSelectedFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meal) return;

    if (!formData.foodName || formData.grams === '' || formData.grams === null || formData.grams === undefined) {
      alert('음식 이름과 양을 입력해주세요.');
      return;
    }

    // 탄단지 입력값 (공백 체크)
    if (formData.carbs === '' || formData.protein === '' || formData.fat === '') {
      alert('탄수화물, 단백질, 지방을 모두 입력해주세요.');
      return;
    }

    const carbs = parseFloat(formData.carbs) || 0;
    const protein = parseFloat(formData.protein) || 0;
    const fat = parseFloat(formData.fat) || 0;

    // 칼로리 입력값 (공백 체크)
    if (formData.calories === '' || formData.calories === null || formData.calories === undefined) {
      alert('칼로리를 입력해주세요.');
      return;
    }

    const calories = parseInt(formData.calories) || 0;

    onSave({
      ...meal,
      foodName: formData.foodName,
      calories: calories,
      grams: parseInt(formData.grams) || 0,
      unit: amountUnit || 'g', // 선택한 단위 사용
      carbs: carbs,
      protein: protein,
      fat: fat,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-3xl bg-white z-[100] w-full max-w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-900">식사 정보 수정</SheetTitle>
        </SheetHeader>

        <div 
          className="mt-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
          style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Character with tip */}
          <div className="flex justify-center">
            <Character 
              name="carrot"
              message="음식 정보를 수정해주세요! 😊"
              size="sm"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Required Fields */}
            <div className="space-y-4">
              {/* <h3 className="text-sm font-semibold text-gray-700">필수 정보</h3> */}
              
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

              <div>
                <label htmlFor="grams" className="block text-sm font-medium text-gray-700 mb-2">
                  양 ⚖️
                </label>
                <div className="flex gap-2">
                  <input
                    id="grams"
                    name="grams"
                    type="number"
                    value={formData.grams}
                    onChange={handleChange}
                    className="input-field flex-1"
                    placeholder="0"
                    required
                    step="0.1"
                  />
                  <select
                    id="amountUnit"
                    value={amountUnit}
                    onChange={(e) => setAmountUnit(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
              
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
                  min="0"
                />
              </div>
            </div>

            {/* Required Nutrition Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                영양 정보
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="carbs" className="block text-xs font-medium text-gray-700 mb-1">
                    탄수화물 (g) *
                  </label>
                  <input
                    id="carbs"
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label htmlFor="protein" className="block text-xs font-medium text-gray-700 mb-1">
                    단백질 (g) *
                  </label>
                  <input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label htmlFor="fat" className="block text-xs font-medium text-gray-700 mb-1">
                    지방 (g) *
                  </label>
                  <input
                    id="fat"
                    name="fat"
                    type="number"
                    value={formData.fat}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">사진 추가 (선택)</h3>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="음식 사진"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    사진이 선택되었습니다
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-green-400 transition-colors duration-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleImageUploadClick}
                      className="border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      사진 업로드
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF 최대 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs text-blue-700">
                💡 팁: 포장 음식은 영양성분표를 확인해보세요!
              </p>
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
                className="flex-1 h-12 gradient-green text-white shadow-lg btn-animation rounded-xl"
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
