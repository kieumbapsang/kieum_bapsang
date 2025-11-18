import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { EditMealModal } from './modals/EditMealModal';

export interface MealRecord {
  id: string;
  time: string;
  foodName: string;
  calories: number;
  grams: number;
  date?: string; // YYYY-MM-DD 형식의 날짜 (선택적)
  carbs?: number; // 탄수화물 (g)
  protein?: number; // 단백질 (g)
  fat?: number; // 지방 (g)
}

const initialMeals: MealRecord[] = [
  {
    id: "1",
    time: "12:20",
    foodName: "김밥",
    calories: 320,
    grams: 250,
  },
  {
    id: "2",
    time: "08:30",
    foodName: "우유",
    calories: 130,
    grams: 200,
  },
  {
    id: "3",
    time: "19:00",
    foodName: "라면",
    calories: 500,
    grams: 400,
  },
  {
    id: "4",
    time: "14:15",
    foodName: "사과",
    calories: 95,
    grams: 180,
  },
];

interface RecentMealsProps {
  meals?: MealRecord[];
  onAddMeal?: (meal: MealRecord) => void;
  onUpdateMeal?: (meal: MealRecord) => void;
  onDeleteMeal?: (id: string) => void;
}

export const RecentMeals: React.FC<RecentMealsProps> = ({ 
  meals: externalMeals,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
}) => {
  const [internalMeals, setInternalMeals] = useState<MealRecord[]>(initialMeals);
  const meals = externalMeals ?? internalMeals;
  
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const handleEdit = (meal: MealRecord) => {
    setEditingMeal(meal);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedMeal: MealRecord) => {
    if (onUpdateMeal) {
      onUpdateMeal(updatedMeal);
    } else {
      setInternalMeals(
        meals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal))
      );
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (onDeleteMeal) {
      onDeleteMeal(id);
    } else {
      setInternalMeals(meals.filter((meal) => meal.id !== id));
    }
    setDeletingMealId(null);
  };

  return (
    <>
      <Card className="p-6 border-0 shadow-lg bg-white rounded-3xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-5">최근 식사 기록</h3>
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🍽️</p>
              <p>아직 기록된 식사가 없어요</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center gap-3 p-4 border-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-gray-600 min-w-[60px]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{meal.time}</span>
                </div>
                
                <div className="w-px h-10 bg-gray-200"></div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium mb-1">{meal.foodName}</p>
                  <p className="text-sm text-gray-500">
                    {meal.grams}g · {meal.calories} kcal
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 hover:scale-110 active:scale-90 transition-transform duration-200"
                    onClick={() => handleEdit(meal)}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:scale-110 active:scale-90 transition-transform duration-200"
                    onClick={() => setDeletingMealId(meal.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingMealId !== null}
        onOpenChange={(open: boolean) => !open && setDeletingMealId(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🗑️</span>
              식사 기록 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              이 식사 기록을 삭제하시겠어요? 삭제하면 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMealId && handleDelete(deletingMealId)}
              className="bg-red-500 hover:bg-red-600 rounded-xl"
            >
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* EditMealModal */}
      <EditMealModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meal={editingMeal}
        onSave={handleSave}
      />
    </>
  );
};
