// @ts-ignore
import Papa from 'papaparse';

export interface FoodNutrition {
  id: string;
  name: string;
  category: string;
  servingSize: number; // g
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  sugar: number; // g
  fat: number; // g
  saturatedFat: number; // g
  transFat: number; // g
  cholesterol: number; // mg
  sodium: number; // mg
}

let foodDatabase: FoodNutrition[] = [];
let isLoaded = false;

// CSV 파일명 (public 폴더에 있어야 함)
const CSV_FILES = [
  '/nutrition-data-1.csv',
  '/nutrition-data-2.csv',
  '/nutrition-data-3.csv'
];

/**
 * CSV 파일에서 영양 정보를 로드
 */
export const loadFoodData = async (): Promise<void> => {
  if (isLoaded) return;

  try {
    const allData: FoodNutrition[] = [];

    for (const csvFile of CSV_FILES) {
      try {
        const response = await fetch(csvFile);
        if (!response.ok) {
          console.warn(`CSV 파일을 찾을 수 없습니다: ${csvFile}`);
          continue;
        }

        const csvText = await response.text();

        const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8',
            complete: resolve,
            error: reject
          });
        });

        if (result.data && result.data.length > 0) {
          const foods = result.data.map((row: any, index: number) => {
            // 1회 제공량 파싱 (예: "100g" -> 100)
            const servingSizeStr = row['영양성분함량기준량'] || '100g';
            const servingSize = parseFloat(servingSizeStr.toString().replace(/[^0-9.]/g, '')) || 100;

            // NaN 값을 0으로 처리하는 헬퍼 함수
            const parseNutrient = (value: any): number => {
              const parsed = parseFloat(value);
              return isNaN(parsed) ? 0 : parsed;
            };

            return {
              id: row['식품코드'] || `${csvFile}-${index}`,
              name: row['식품명'] || row['name'] || '',
              category: row['데이터구분명'] || row['category'] || '기타',
              servingSize: servingSize,
              calories: parseNutrient(row['에너지(kcal)'] || row['calories'] || '0'),
              protein: parseNutrient(row['단백질(g)'] || row['protein'] || '0'),
              carbs: parseNutrient(row['탄수화물(g)'] || row['carbs'] || '0'),
              sugar: parseNutrient(row['당류(g)'] || row['sugar'] || '0'),
              fat: parseNutrient(row['지방(g)'] || row['fat'] || '0'),
              saturatedFat: parseNutrient(row['포화지방산(g)'] || row['saturatedFat'] || '0'),
              transFat: parseNutrient(row['트랜스지방산(g)'] || row['transFat'] || '0'),
              cholesterol: parseNutrient(row['콜레스테롤(mg)'] || row['cholesterol'] || '0'),
              sodium: parseNutrient(row['나트륨(mg)'] || row['sodium'] || '0')
            } as FoodNutrition;
          }).filter((food: FoodNutrition) => food.name && food.name.trim() !== '');

          allData.push(...foods);
        }
      } catch (error) {
        console.error(`CSV 파일 로드 실패: ${csvFile}`, error);
      }
    }

    foodDatabase = allData;
    isLoaded = true;
    console.log(`총 ${foodDatabase.length}개의 음식 데이터 로드 완료`);
  } catch (error) {
    console.error('음식 데이터 로드 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 음식 검색
 */
export const searchFoodByName = (query: string, limit: number = 20): FoodNutrition[] => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  return foodDatabase
    .filter(food => food.name.toLowerCase().includes(searchTerm))
    .slice(0, limit);
};

/**
 * 카테고리별 음식 검색
 */
export const searchFoodByCategory = (category: string, limit: number = 20): FoodNutrition[] => {
  return foodDatabase
    .filter(food => food.category === category)
    .slice(0, limit);
};

/**
 * ID로 음식 찾기
 */
export const getFoodById = (id: string): FoodNutrition | undefined => {
  return foodDatabase.find(food => food.id === id);
};

/**
 * 모든 카테고리 가져오기
 */
export const getAllCategories = (): string[] => {
  const categories = new Set(foodDatabase.map(food => food.category));
  return Array.from(categories).sort();
};

/**
 * 영양소 계산 (양에 따라)
 */
export const calculateNutrients = (food: FoodNutrition, amount: number) => {
  const ratio = amount / food.servingSize;

  // NaN이나 undefined 값을 0으로 처리하는 헬퍼 함수
  const safeCalculate = (value: number, ratio: number, decimals: number = 1): number => {
    if (!value || isNaN(value)) return 0;
    const result = value * ratio;
    if (isNaN(result)) return 0;
    return Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return {
    calories: safeCalculate(food.calories, ratio, 0),
    protein: safeCalculate(food.protein, ratio, 1),
    carbs: safeCalculate(food.carbs, ratio, 1),
    sugar: safeCalculate(food.sugar, ratio, 1),
    fat: safeCalculate(food.fat, ratio, 1),
    saturatedFat: safeCalculate(food.saturatedFat, ratio, 1),
    transFat: safeCalculate(food.transFat, ratio, 1),
    cholesterol: safeCalculate(food.cholesterol, ratio, 1),
    sodium: safeCalculate(food.sodium, ratio, 1)
  };
};