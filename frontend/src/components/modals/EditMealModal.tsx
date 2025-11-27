import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/Button';
import { Character } from '../Character';
import { MealRecord } from '../RecentMeals';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../../api/client';
import { 
  FoodNutrition, 
  loadFoodData, 
  searchFoodByName, 
  getFoodById,
  calculateNutrients 
} from '../../services/foodService';

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
  const [, setSelectedFile] = useState<File | null>(null); // 파일 선택 상태 관리용
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrError, setOcrError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodNutrition[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 음식 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadFoodData();
        setIsDataLoaded(true);
      } catch (error) {
        console.error('음식 데이터 로드 실패:', error);
      }
    };
    loadData();
  }, []);

  // 검색 결과 업데이트
  useEffect(() => {
    if (searchQuery.trim() && isDataLoaded) {
      const results = searchFoodByName(searchQuery, 20);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, isDataLoaded]);

  // 외부 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleFoodSelect = (food: FoodNutrition) => {
    const nutrients = calculateNutrients(food, food.servingSize);
    
    // formData 업데이트
    setFormData({
      foodName: food.name,
      calories: nutrients.calories.toString(),
      grams: food.servingSize.toString(),
      protein: nutrients.protein.toString(),
      carbs: nutrients.carbs.toString(),
      fat: nutrients.fat.toString(),
    });

    // 음식 선택 시 기본 단위는 g
    if (!amountUnit) {
      setAmountUnit('g');
    }

    setSelectedFoodId(food.id);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 양이 변경되면 선택된 음식이 있으면 영양성분 재계산
    if (name === 'grams' && selectedFoodId && isDataLoaded) {
      const newAmount = parseFloat(value) || 0;
      if (newAmount > 0) {
        const selectedFood = getFoodById(selectedFoodId);
        if (selectedFood) {
          const nutrients = calculateNutrients(selectedFood, newAmount);
          setFormData(prev => ({
            ...prev,
            calories: nutrients.calories.toString(),
            protein: nutrients.protein.toString(),
            carbs: nutrients.carbs.toString(),
            fat: nutrients.fat.toString(),
          }));
        }
      }
    }
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
        onDragStart={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
        onDragEnd={(e) => e.preventDefault()}
        onTouchStart={(e) => {
          // 모달 헤더나 빈 공간에서만 드래그 방지
          const target = e.target as HTMLElement;
          if (!target.closest('[data-scrollable]')) {
            e.preventDefault();
          }
        }}
        style={{ 
          touchAction: 'none', 
          userSelect: 'none'
        } as React.CSSProperties}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-900">식사 정보 수정</SheetTitle>
        </SheetHeader>

        <div 
          data-scrollable
          className="mt-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
          style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onDragStart={(e) => e.preventDefault()}
          onDrag={(e) => e.preventDefault()}
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
              
              {/* 음식 검색 */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  음식 검색 🔍
                </label>
                <div id="search-container" className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pr-10"
                    placeholder="음식명을 입력하세요"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                    onClick={() => setShowResults(true)}
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
                      <ul className="py-1">
                        {searchResults.map(food => (
                          <li
                            key={food.id}
                            className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors"
                            onClick={() => handleFoodSelect(food)}
                          >
                            <div className="font-medium text-gray-900">{food.name}</div>
                            <div className="text-sm text-gray-500">
                              {food.category} · {food.servingSize}g · {food.calories}kcal
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="px-4 py-3 text-sm text-gray-500">
                        검색 결과가 없습니다.
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        📸 촬영 팁: 밝은 곳에서 쫙 펴고, 흔들리지 않게 똑바로 찍어보세요!
                      </p>
                    </div>
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
