export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number; // 1회 제공량 (g)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  sugar?: number;
  cholesterol?: number;
  saturatedFat?: number;
  transFat?: number;
}

// 임시 음식 데이터 (알파 버전)
export const foodData: FoodItem[] = [
  {
    id: '1',
    name: '백미밥',
    category: '주식',
    servingSize: 210,
    calories: 310,
    protein: 5.6,
    carbs: 68.6,
    fat: 0.5
  },
  {
    id: '2',
    name: '현미밥',
    category: '주식',
    servingSize: 210,
    calories: 320,
    protein: 6.7,
    carbs: 67.5,
    fat: 2.2
  },
  {
    id: '3',
    name: '삼겹살',
    category: '육류',
    servingSize: 100,
    calories: 469,
    protein: 24,
    carbs: 0,
    fat: 41
  },
  {
    id: '4',
    name: '닭가슴살',
    category: '육류',
    servingSize: 100,
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6
  },
  {
    id: '5',
    name: '계란',
    category: '달걀/유제품',
    servingSize: 50,
    calories: 71,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.7
  },
  {
    id: '6',
    name: '우유',
    category: '달걀/유제품',
    servingSize: 200,
    calories: 125,
    protein: 6.5,
    carbs: 9.5,
    fat: 6.5
  }
];

export const searchFoods = (query: string): FoodItem[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return foodData.filter(food => 
    food.name.toLowerCase().includes(normalizedQuery) ||
    food.category.toLowerCase().includes(normalizedQuery)
  );
};
