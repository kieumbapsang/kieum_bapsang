import React, { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/Button';
import { Character } from '../Character';
import { MealRecord } from '../RecentMeals';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ManualInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (meal: MealRecord) => void;
}

export const ManualInputModal: React.FC<ManualInputModalProps> = ({
  open,
  onOpenChange,
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (!formData.foodName || !formData.grams) {
      return;
    }

    // 탄단지 입력값
    const carbs = parseFloat(formData.carbs) || 0;
    const protein = parseFloat(formData.protein) || 0;
    const fat = parseFloat(formData.fat) || 0;

    // 칼로리 계산: 탄수화물 4kcal/g, 단백질 4kcal/g, 지방 9kcal/g
    // 칼로리를 직접 입력했으면 그것을 사용, 아니면 탄단지로 계산
    let calculatedCalories = 0;
    if (carbs > 0 || protein > 0 || fat > 0) {
      calculatedCalories = (carbs * 4) + (protein * 4) + (fat * 9);
    }
    
    const calories = formData.calories ? parseInt(formData.calories) : Math.round(calculatedCalories);
    
    // 칼로리가 없으면 에러
    if (!calories || calories === 0) {
      alert('칼로리 또는 탄수화물/단백질/지방 중 하나를 입력해주세요.');
      return;
    }

    // 현재 시간 및 날짜 생성
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // 식사 기록 생성 (탄단지 정보 포함)
    const newMeal: MealRecord = {
      id: `meal-${Date.now()}`,
      time: timeString,
      foodName: formData.foodName,
      calories: calories,
      grams: parseInt(formData.grams) || 0,
      unit: 'g', // 기본값 g (키즈모드에서는 직접 입력 시 기본값)
      date: dateString,
      carbs: carbs,
      protein: protein,
      fat: fat,
    };

    // 저장 콜백 호출
    if (onSave) {
      onSave(newMeal);
    }

    onOpenChange(false);
    
    // 폼 초기화
    setFormData({
      foodName: '',
      calories: '',
      grams: '',
      protein: '',
      carbs: '',
      fat: '',
    });
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // 폼 초기화
    setFormData({
      foodName: '',
      calories: '',
      grams: '',
      protein: '',
      carbs: '',
      fat: '',
    });
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl bg-white">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">식사 직접 입력</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Character with tip */}
          <div className="flex justify-center">
            <Character 
              name="carrot"
              message="음식 정보를 입력해주세요! 영양소는 선택사항이에요 😊"
              size="sm"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">필수 정보</h3>
              
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
              
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
                  칼로리 🔥 (선택 - 탄단지 입력 시 자동 계산)
                </label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="kcal (자동 계산됨)"
                />
                {formData.carbs || formData.protein || formData.fat ? (
                  <p className="text-xs text-green-600 mt-1">
                    계산된 칼로리: {Math.round((parseFloat(formData.carbs || '0') * 4) + (parseFloat(formData.protein || '0') * 4) + (parseFloat(formData.fat || '0') * 9))} kcal
                  </p>
                ) : null}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                영양 정보 (탄수화물, 단백질, 지방 입력 시 칼로리 자동 계산)
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="carbs" className="block text-xs font-medium text-gray-600 mb-1">
                    탄수화물 (g)
                  </label>
                  <input
                    id="carbs"
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="protein" className="block text-xs font-medium text-gray-600 mb-1">
                    단백질 (g)
                  </label>
                  <input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="fat" className="block text-xs font-medium text-gray-600 mb-1">
                    지방 (g)
                  </label>
                  <input
                    id="fat"
                    name="fat"
                    type="number"
                    value={formData.fat}
                    onChange={handleChange}
                    className="input-field text-sm"
                    placeholder="0"
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
                추가하기
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

