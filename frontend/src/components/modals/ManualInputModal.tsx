import React, { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/Button';
import { Character } from '../Character';
import { MealRecord } from '../RecentMeals';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../../api/client';

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
  const [amountUnit, setAmountUnit] = useState<string>('g'); // 기본값 g
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrError, setOcrError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processImageWithOCR = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrError('');

    try {
      const result = await api.ocr.uploadImage(file, false, null);
      
      if (result.error) {
        setOcrError(result.error);
        return;
      }

      if (result.data.success) {
        // 영양성분 정보가 있으면 자동으로 입력 필드에 채우기
        if (result.data.nutrition_info) {
          const nutrition = result.data.nutrition_info;
          
          // 영양성분 값을 처리하는 헬퍼 함수 (소수점 유지)
          const processNutritionValue = (value: any): string => {
            // "-" 또는 "정보없음"은 0으로 처리
            if (value === '정보없음' || value === null || value === undefined || value === '-' || value === '--') {
              return '0';
            }
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(num)) {
              return '0';
            }
            // 소수점이 있으면 그대로 유지, 없으면 정수로 표시
            if (Number.isInteger(num)) {
              return num.toString();
            } else {
              return num.toFixed(1).replace(/\.?0+$/, '');
            }
          };

          // 영양성분 입력 필드에 값 설정
          setFormData(prev => ({
            ...prev,
            calories: processNutritionValue(nutrition.칼로리),
            protein: processNutritionValue(nutrition.단백질),
            carbs: processNutritionValue(nutrition.탄수화물),
            fat: processNutritionValue(nutrition.지방),
          }));

          // 총 내용량을 양 필드에 자동 입력 (인식한 단위에 따라 처리)
          if (nutrition.총내용량 && typeof nutrition.총내용량 === 'object' && nutrition.총내용량.amount) {
            const totalContent = nutrition.총내용량;
            const originalAmount = totalContent.amount;
            const amountStr = String(originalAmount);
            let amountValue = parseFloat(amountStr);
            
            if (isNaN(amountValue)) {
              console.warn(`⚠️ 총 내용량 파싱 실패: ${originalAmount}`);
              amountValue = 0;
            }
            
            let recognizedUnit = totalContent.unit || 'g';
            
            // 단위 정규화
            if (recognizedUnit === 'ml' || recognizedUnit === 'mL' || recognizedUnit === 'ML') {
              recognizedUnit = 'ml';
            } else if (recognizedUnit === 'kg') {
              amountValue = amountValue * 1000;
              recognizedUnit = 'g';
            } else if (recognizedUnit === 'L' || recognizedUnit === 'l') {
              amountValue = amountValue * 1000;
              recognizedUnit = 'ml';
            } else {
              recognizedUnit = 'g';
            }
            
            setAmountUnit(recognizedUnit || 'g');
            setFormData(prev => ({ ...prev, grams: amountValue.toString() }));
            console.log(`📦 총 내용량을 양(${recognizedUnit}) 필드에 입력: ${amountValue}${recognizedUnit}`);
          }

          // 음식 이름도 OCR 결과에서 가져오기 (있는 경우)
          if (nutrition.음식명) {
            setFormData(prev => ({ ...prev, foodName: nutrition.음식명 }));
          }
        }
      } else {
        setOcrError(result.data.error || 'OCR 처리에 실패했습니다.');
      }
    } catch (error) {
      setOcrError('OCR 처리 중 오류가 발생했습니다.');
      console.error('OCR 처리 오류:', error);
    } finally {
      setIsProcessingOCR(false);
    }
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

      // OCR 처리
      processImageWithOCR(file);
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
      unit: amountUnit || 'g', // 선택한 단위 사용
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
    setAmountUnit('g');
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
    setAmountUnit('g');
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-3xl bg-white w-full max-w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">식사 직접 입력</SheetTitle>
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
              message="음식 정보를 입력해주세요! 😊"
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
              
              {/* OCR 처리 중 로딩 표시 */}
              {isProcessingOCR && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-blue-700">영양성분표를 분석하는 중...</p>
                </div>
              )}

              {/* OCR 에러 표시 */}
              {ocrError && !isProcessingOCR && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs text-red-700">⚠️ {ocrError}</p>
                </div>
              )}
              
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

