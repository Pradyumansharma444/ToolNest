import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STORAGE_KEY = 'meal-planner-data';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

const FOOD_OPTIONS: Record<string, string[]> = {
  Breakfast: ['Oatmeal', 'Scrambled Eggs', 'Pancakes', 'Smoothie', 'Cereal', 'Toast & Avocado', 'Yogurt & Granola', 'Fruit Bowl', 'Bagel & Cream Cheese', 'French Toast'],
  Lunch: ['Chicken Salad', 'Grilled Cheese & Soup', 'Caesar Salad', 'Turkey Wrap', 'Quinoa Bowl', 'Pasta Salad', 'Sushi Bowl', 'Burrito', 'Buddha Bowl', 'Tuna Sandwich'],
  Dinner: ['Grilled Chicken & Rice', 'Spaghetti Bolognese', 'Stir Fry', 'Salmon & Vegetables', 'Tacos', 'Curry & Rice', 'Roasted Veggies & Pasta', 'Steak & Potatoes', 'Pad Thai', 'Pizza'],
  Snack: ['Apple & Peanut Butter', 'Mixed Nuts', 'Hummus & Carrots', 'Protein Bar', 'Greek Yogurt', 'Trail Mix', 'Fruit Smoothie', 'Rice Cakes', 'Cheese & Crackers', 'Dark Chocolate'],
};

type Meals = Record<string, string>;

function loadMeals(): Meals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveMeals(meals: Meals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

function cellKey(day: string, meal: string): string {
  return `${day}-${meal}`;
}

export default function MealPlanner() {
  const tool = getToolById('meal-planner')!;
  const [meals, setMeals] = useState<Meals>(loadMeals);

  useEffect(() => { saveMeals(meals); }, [meals]);

  const setMeal = useCallback((day: string, meal: string, value: string) => {
    setMeals((prev) => {
      const next = { ...prev };
      const key = cellKey(day, meal);
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }, []);

  const getMeal = useCallback((day: string, meal: string) => meals[cellKey(day, meal)] || '', [meals]);

  const handleDownload = useCallback(() => {
    let text = 'Weekly Meal Plan\n\n';
    for (const day of DAYS) {
      text += `--- ${day} ---\n`;
      for (const meal of MEAL_TYPES) {
        const item = getMeal(day, meal);
        text += `${meal}: ${item || '-'}\n`;
      }
      text += '\n';
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [meals, getMeal]);

  const clearAll = useCallback(() => setMeals({}), []);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline" className="gap-2"><Download className="w-4 h-4" /> Download</Button>
          <Button onClick={clearAll} variant="outline" className="gap-2 text-red-500"><X className="w-4 h-4" /> Clear All</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-muted w-20"></th>
                {DAYS.map((day) => (
                  <th key={day} className="p-2 border bg-muted min-w-[130px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((meal) => (
                <tr key={meal}>
                  <td className="p-2 border font-medium text-xs bg-muted/50">{meal}</td>
                  {DAYS.map((day) => {
                    const key = cellKey(day, meal);
                    const current = getMeal(day, meal);
                    return (
                      <td key={key} className="p-2 border">
                        <select
                          value={current}
                          onChange={(e) => setMeal(day, meal, e.target.value)}
                          className="w-full text-xs bg-transparent border-none outline-none p-1 rounded cursor-pointer hover:bg-muted transition-colors"
                        >
                          <option value="">--</option>
                          {FOOD_OPTIONS[meal].map((food) => (
                            <option key={food} value={food}>{food}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
