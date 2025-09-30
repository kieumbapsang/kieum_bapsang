import React, { useState, useEffect } from 'react';
import { Meal } from './MealCard';
import { FoodItem, searchFoods } from '../data/foodData';
import { api } from '../../../api/client';

export interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMeal?: Meal | null;
  onSubmit: (meal: Meal) => void;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  initialMeal,
  onSubmit
}) => {
  const [mealData, setMealData] = useState<Partial<Meal>>(() => {
    if (initialMeal) {
      return { 
        ...initialMeal,
        name: initialMeal.name || '',
        amount: initialMeal.amount || 0
      };
    }
    return {
      name: '',
      amount: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sodium: 0,
      sugar: 0,
      cholesterol: 0,
      saturatedFat: 0,
      transFat: 0
    };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrError, setOcrError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  // 영양성분 입력 필드용 별도 상태 (문자열로 처리)
  const [nutritionInputs, setNutritionInputs] = useState(() => {
    if (initialMeal) {
      return {
        calories: initialMeal.calories?.toString() || '',
        protein: initialMeal.protein?.toString() || '',
        carbs: initialMeal.carbs?.toString() || '',
        fat: initialMeal.fat?.toString() || '',
        sodium: initialMeal.sodium?.toString() || '',
        sugar: initialMeal.sugar?.toString() || '',
        cholesterol: initialMeal.cholesterol?.toString() || '',
        saturatedFat: initialMeal.saturatedFat?.toString() || '',
        transFat: initialMeal.transFat?.toString() || ''
      };
    }
    return {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      sodium: '',
      sugar: '',
      cholesterol: '',
      saturatedFat: '',
      transFat: ''
    };
  });


  const processImageWithOCR = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrError('');

    try {
      const result = await api.ocr.uploadImage(file);
      
      if (result.error) {
        setOcrError(result.error);
        return;
      }

      if (result.data.success) {
        // 영양성분 정보가 있으면 자동으로 입력 필드에 채우기
        if (result.data.nutrition_info) {
          const nutrition = result.data.nutrition_info;
          
          // 영양성분 값을 처리하는 헬퍼 함수
          const processNutritionValue = (value: any): string => {
            if (value === '정보없음' || value === null || value === undefined) {
              return '직접입력 필요';
            }
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(num)) {
              return '직접입력 필요';
            }
            return num.toString();
          };

          // 영양성분 입력 필드에 값 설정
          setNutritionInputs({
            calories: processNutritionValue(nutrition.칼로리),
            protein: processNutritionValue(nutrition.단백질),
            carbs: processNutritionValue(nutrition.탄수화물),
            fat: processNutritionValue(nutrition.지방),
            sodium: processNutritionValue(nutrition.나트륨),
            sugar: processNutritionValue(nutrition.당류),
            cholesterol: processNutritionValue(nutrition.콜레스테롤),
            saturatedFat: processNutritionValue(nutrition.포화지방),
            transFat: processNutritionValue(nutrition.트랜스지방),
          });
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
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchFoods(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

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

  const calculateNutrients = (food: FoodItem, amount: number) => {
    const ratio = amount / food.servingSize;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      sodium: Math.round((food.sodium || 0) * ratio * 10) / 10,
      sugar: Math.round((food.sugar || 0) * ratio * 10) / 10,
      cholesterol: Math.round((food.cholesterol || 0) * ratio * 10) / 10,
      saturatedFat: Math.round((food.saturatedFat || 0) * ratio * 10) / 10,
      transFat: Math.round((food.transFat || 0) * ratio * 10) / 10
    };
  };

  // 영양성분 입력 검증 함수
  const validateNutritionInputs = () => {
    const requiredFields = [
      { key: 'calories', label: '칼로리' },
      { key: 'protein', label: '단백질' },
      { key: 'carbs', label: '탄수화물' },
      { key: 'fat', label: '지방' },
      { key: 'sodium', label: '나트륨' },
      { key: 'sugar', label: '당' },
      { key: 'cholesterol', label: '콜레스테롤' },
      { key: 'saturatedFat', label: '포화지방' },
      { key: 'transFat', label: '트랜스지방' }
    ];

    const missingFields = requiredFields.filter(field => {
      const value = nutritionInputs[field.key as keyof typeof nutritionInputs];
      return !value || value.trim() === '' || value === '직접입력 필요';
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.label).join(', ');
      setValidationError(`다음 영양성분을 입력해주세요: ${fieldNames}`);
      return false;
    }

    // 숫자 형식 검증
    for (const field of requiredFields) {
      const value = nutritionInputs[field.key as keyof typeof nutritionInputs];
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setValidationError(`${field.label}은(는) 0 이상의 숫자여야 합니다.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleFoodSelect = (food: FoodItem) => {
    const nutrients = calculateNutrients(food, food.servingSize);
    setMealData(prev => ({
      ...prev,
      name: food.name,
      amount: food.servingSize,
      foodId: food.id,
      ...nutrients
    }));
    setSearchQuery('');
    setShowResults(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setSearchQuery('');
      setShowResults(false);
      setIsProcessingOCR(false);
      setOcrError('');
      setValidationError('');
      setNutritionInputs({
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        sodium: '',
        sugar: '',
        cholesterol: '',
        saturatedFat: '',
        transFat: ''
      });
    } else if (initialMeal) {
      // 수정 모드일 때 기존 데이터로 필드 초기화
      setMealData({
        name: initialMeal.name || '',
        amount: initialMeal.amount || 0
      });
      setNutritionInputs({
        calories: initialMeal.calories?.toString() || '',
        protein: initialMeal.protein?.toString() || '',
        carbs: initialMeal.carbs?.toString() || '',
        fat: initialMeal.fat?.toString() || '',
        sodium: initialMeal.sodium?.toString() || '',
        sugar: initialMeal.sugar?.toString() || '',
        cholesterol: initialMeal.cholesterol?.toString() || '',
        saturatedFat: initialMeal.saturatedFat?.toString() || '',
        transFat: initialMeal.transFat?.toString() || ''
      });
    }
  }, [isOpen, initialMeal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 기본 필드 검증
    if (!mealData.name || !mealData.amount) {
      setValidationError('음식명과 양을 모두 입력해주세요.');
      return;
    }

    // 영양성분 입력 검증
    if (!validateNutritionInputs()) {
      return;
    }

    const parseNutritionValue = (value: string): number => {
      if (value === '직접입력 필요' || value === '') return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    // 백엔드 API 형식에 맞게 데이터 변환
    const backendMealData = {
      food_name: mealData.name,
      nutrition_data: {
        amount: parseInt(mealData.amount?.toString() || '0'),
        calories: parseNutritionValue(nutritionInputs.calories),
        protein: parseNutritionValue(nutritionInputs.protein),
        carbs: parseNutritionValue(nutritionInputs.carbs),
        fat: parseNutritionValue(nutritionInputs.fat),
        sodium: parseNutritionValue(nutritionInputs.sodium),
        sugar: parseNutritionValue(nutritionInputs.sugar),
        cholesterol: parseNutritionValue(nutritionInputs.cholesterol),
        saturated_fat: parseNutritionValue(nutritionInputs.saturatedFat),
        trans_fat: parseNutritionValue(nutritionInputs.transFat),
      },
      intake_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
    };

    // 백엔드로 식사 추가/수정 요청
    try {
      if (initialMeal) {
        // 수정 모드
        const { data, error } = await api.meals.updateMeal(parseInt(initialMeal.id), backendMealData);
        if (error) {
          setValidationError(`식사 수정 실패: ${error}`);
          return;
        }
        console.log('✅ 식사 수정 성공');
      } else {
        // 추가 모드
        const { data, error } = await api.meals.addMeal(backendMealData, 1 as any); // user_id: 1
        if (error) {
          setValidationError(`식사 추가 실패: ${error}`);
          return;
        }
        console.log('✅ 식사 추가 성공');
      }
      
      // 성공 시 모달 닫기
      onClose();
      
      // 페이지 새로고침으로 최신 데이터 로드
      window.location.reload();
    } catch (error) {
      setValidationError(`식사 ${initialMeal ? '수정' : '추가'} 중 오류가 발생했습니다: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 pb-20">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {initialMeal ? '식사 정보 수정' : '식사 추가'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                음식 검색
              </label>
              <div id="search-container" className="mt-1 relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
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
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {searchResults.map(food => (
                        <li
                          key={food.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleFoodSelect(food)}
                        >
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500">
                            {food.category} · {food.servingSize}g · {food.calories}kcal
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                    <div className="px-4 py-3 text-sm text-gray-500">
                      검색 결과가 없습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                음식명
              </label>
              <input
                type="text"
                id="name"
                value={mealData.name}
                onChange={(e) => setMealData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                양 (g)
              </label>
                <input
                  type="number"
                  id="amount"
                  value={mealData.amount || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const newAmount = Number(e.target.value);
                    const selectedFood = searchResults.find(food => food.id === mealData.foodId);
                    if (selectedFood) {
                      const nutrients = calculateNutrients(selectedFood, newAmount);
                      setMealData(prev => ({
                        ...prev,
                        amount: newAmount,
                        ...nutrients
                      }));
                    } else {
                      setMealData(prev => ({ ...prev, amount: newAmount }));
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  min="0"
                  required
                />
            </div>


            {/* 영양소 입력 필드들 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                  칼로리 (kcal)
                </label>
                <input
                  type="number"
                  id="calories"
                  value={nutritionInputs.calories}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, calories: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="칼로리 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                  단백질 (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  value={nutritionInputs.protein}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, protein: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="단백질 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                  탄수화물 (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  value={nutritionInputs.carbs}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, carbs: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="탄수화물 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="fat" className="block text-sm font-medium text-gray-700">
                  지방 (g)
                </label>
                <input
                  type="number"
                  id="fat"
                  value={nutritionInputs.fat}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, fat: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="지방 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="sodium" className="block text-sm font-medium text-gray-700">
                  나트륨 (mg)
                </label>
                <input
                  type="number"
                  id="sodium"
                  value={nutritionInputs.sodium}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, sodium: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="나트륨 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="sugar" className="block text-sm font-medium text-gray-700">
                  당 (g)
                </label>
                <input
                  type="number"
                  id="sugar"
                  value={nutritionInputs.sugar}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, sugar: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="당 입력"
                  min="0"
                  step="0.1"
                />
              </div>


              <div>
                <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700">
                  콜레스테롤 (mg)
                </label>
                <input
                  type="number"
                  id="cholesterol"
                  value={nutritionInputs.cholesterol}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, cholesterol: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="콜레스테롤 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="saturatedFat" className="block text-sm font-medium text-gray-700">
                  포화지방 (g)
                </label>
                <input
                  type="number"
                  id="saturatedFat"
                  value={nutritionInputs.saturatedFat}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, saturatedFat: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="포화지방 입력"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="transFat" className="block text-sm font-medium text-gray-700">
                  트랜스지방 (g)
                </label>
                <input
                  type="number"
                  id="transFat"
                  value={nutritionInputs.transFat}
                  onChange={(e) => setNutritionInputs(prev => ({ ...prev, transFat: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="트랜스지방 입력"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                사진 추가
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center w-full">
                  {selectedImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="mx-auto h-48 w-full max-w-sm object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex flex-col gap-3 items-center mt-4">
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          사진 업로드
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const file = e.target.files[0];
                                setSelectedImage(file);
                                processImageWithOCR(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* OCR 처리 중 로딩 표시 */}
            {isProcessingOCR && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  이미지에서 영양성분을 추출하는 중...
                </div>
              </div>
            )}

            {/* OCR 에러 표시 */}
            {ocrError && !isProcessingOCR && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">
                  <p className="font-medium">OCR 처리 실패:</p>
                  <p>{ocrError}</p>
                </div>
              </div>
            )}

            {/* 검증 에러 표시 */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">
                  <p className="font-medium">입력 오류:</p>
                  <p>{validationError}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {initialMeal ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};