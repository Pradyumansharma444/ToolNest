/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { ChefHat, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Ingredient {
  id: string;
  name: string;
  density: number; // g per ml
  notes: string;
}

const INGREDIENTS: Ingredient[] = [
  { id: 'water', name: 'Water / Volume Only', density: 1.0, notes: 'Standard 1:1 density for pure liquid conversion.' },
  { id: 'flour', name: 'All-Purpose Flour', density: 0.528, notes: '1 cup is approximately 125 grams.' },
  { id: 'sugar', name: 'Granulated Sugar', density: 0.845, notes: '1 cup is approximately 200 grams.' },
  { id: 'butter', name: 'Butter', density: 0.959, notes: '1 cup is approximately 227 grams.' },
  { id: 'milk', name: 'Milk', density: 1.03, notes: 'Slightly denser than water.' },
  { id: 'oil', name: 'Olive Oil / Vegetable Oil', density: 0.918, notes: 'Lighter than water.' },
  { id: 'honey', name: 'Honey / Maple Syrup', density: 1.42, notes: 'Very viscous, dense sweetener.' },
  { id: 'cocoa', name: 'Cocoa Powder', density: 0.423, notes: 'Light and airy, 1 cup is approx. 100 grams.' },
];

interface CookingUnit {
  id: string;
  name: string;
  type: 'volume' | 'weight';
  factor: number; // multiplier to base (ml for volume, g for weight)
}

const COOKING_UNITS: CookingUnit[] = [
  { id: 'ml', name: 'Milliliters', type: 'volume', factor: 1 },
  { id: 'L', name: 'Liters', type: 'volume', factor: 1000 },
  { id: 'cup', name: 'Cups (US)', type: 'volume', factor: 236.588 },
  { id: 'tbsp', name: 'Tablespoons (tbsp)', type: 'volume', factor: 14.7868 },
  { id: 'tsp', name: 'Teaspoons (tsp)', type: 'volume', factor: 4.9289 },
  { id: 'floz', name: 'Fluid Ounces (fl oz)', type: 'volume', factor: 29.5735 },
  { id: 'g', name: 'Grams', type: 'weight', factor: 1 },
  { id: 'oz', name: 'Ounces (oz)', type: 'weight', factor: 28.3495 },
];

export default function CookingConverter() {
  const tool = getToolById('cooking-converter') || {
    id: 'cooking-converter',
    name: 'Cooking Measure Converter',
    description: 'Convert culinary measurements between cups, spoons, grams, and ounces with ingredient-specific density factors.',
    metaTitle: 'Cooking Unit Converter - Cups to Grams | ToolNest',
    metaDescription: 'Convert recipe metrics. Adjust values between volume (cups, tbsp, ml) and weight (grams, oz) using density calculators.',
    category: 'calculator',
  };

  const [value, setValue] = useState('1');
  const [sourceUnit, setSourceUnit] = useState('cup');
  const [ingredientId, setIngredientId] = useState('flour');

  const activeIngredient = useMemo(() => INGREDIENTS.find((i) => i.id === ingredientId)!, [ingredientId]);

  const conversions = useMemo(() => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) return [];

    const srcUnitDef = COOKING_UNITS.find((u) => u.id === sourceUnit)!;
    const density = activeIngredient.density;

    // Convert input to base units (ml for volume, g for weight)
    const baseValue = num * srcUnitDef.factor;

    return COOKING_UNITS.map((target) => {
      let result = 0;

      if (srcUnitDef.type === target.type) {
        // Same type: direct conversion
        result = baseValue / target.factor;
      } else {
        // Crossed types (volume <-> weight)
        if (srcUnitDef.type === 'volume') {
          // Vol (ml) to weight (g)
          const grams = baseValue * density;
          result = grams / target.factor;
        } else {
          // Weight (g) to Vol (ml)
          const ml = baseValue / density;
          result = ml / target.factor;
        }
      }

      // Format result nicely
      const formatted =
        result % 1 === 0
          ? result.toLocaleString()
          : Number(result.toFixed(3)).toLocaleString(undefined, {
              maximumFractionDigits: 3,
            });

      return {
        ...target,
        value: result,
        formatted,
      };
    });
  }, [value, sourceUnit, activeIngredient]);

  return (
    <ToolLayout tool={tool as any} resultVisible={conversions.length > 0}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
          <h3 className="font-semibold text-base mb-2 font-medium">Recipe Inputs</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Ingredient Profile</label>
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INGREDIENTS.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal italic">
                {activeIngredient.notes}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Value</label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} min="0" step="any" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Source Unit</label>
              <Select value={sourceUnit} onValueChange={setSourceUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COOKING_UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-muted-foreground">Conversions breakdown</span>
          {conversions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conversions.map((target) => (
                <div
                  key={target.id}
                  className={`rounded-xl border bg-card p-4 flex justify-between items-center shadow-sm ${
                    target.id === sourceUnit ? 'border-primary ring-1 ring-primary/30' : ''
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {target.name}
                    </span>
                    <p className="text-base font-extrabold mt-1 text-foreground">
                      {target.formatted}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    target.type === 'volume' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-500' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                  }`}>
                    {target.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <ChefHat className="w-12 h-12 mb-3 text-muted-foreground/60 animate-bounce" />
              <h3 className="font-semibold text-base mb-1">Enter Recipe Sizing</h3>
              <p className="text-sm max-w-md">
                Input your measurements in the sidebar, select your ingredient type, and view metric and imperial equivalencies.
              </p>
            </div>
          )}

          {/* Info block */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Why do ingredients matter in conversion?</p>
              <p>
                Volume measures (like cups and tablespoons) quantify how much 3D space an ingredient occupies, while weight measures (like grams and ounces) count mass. Denser ingredients (like honey) weigh significantly more per cup than light, fluffy ingredients (like cocoa powder). Factor densities ensure your baking ratios remain precise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
