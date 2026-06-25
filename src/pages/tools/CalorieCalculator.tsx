/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { HeartPulse, Info, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function CalorieCalculator() {
  const tool = getToolById('calorie-calculator') || {
    id: 'calorie-calculator',
    name: 'Calorie & TDEE Calculator',
    description: 'Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) to find your daily calories.',
    metaTitle: 'Calorie & TDEE Calculator | ToolNest',
    metaDescription: 'Find your daily maintenance, bulking, and cutting calories based on your activity level using the Mifflin-St Jeor equation.',
    category: 'health',
  };

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState(''); // kg or lbs
  const [height, setHeight] = useState(''); // cm or inches
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [activity, setActivity] = useState<string>('1.2');

  const tdeeResults = useMemo(() => {
    const ageVal = Number(age);
    const weightVal = Number(weight);
    const heightVal = Number(height);
    const activityMultiplier = Number(activity);

    if (!ageVal || !weightVal || !heightVal || ageVal <= 0 || weightVal <= 0 || heightVal <= 0) {
      return null;
    }

    // Convert to metric if imperial
    let wKg = weightVal;
    let hCm = heightVal;
    if (unit === 'imperial') {
      wKg = weightVal * 0.45359237;
      hCm = heightVal * 2.54;
    }

    // Mifflin-St Jeor Equation
    let bmr = 10 * wKg + 6.25 * hCm - 5 * ageVal;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = Math.round(bmr * activityMultiplier);
    const roundedBmr = Math.round(bmr);

    // Goal adjustments
    const cutting = Math.max(1200, Math.round(tdee - 500));
    const bulking = Math.round(tdee + 500);

    // Macro splits helper (40/30/30 Carb/Protein/Fat)
    const getMacros = (calories: number) => {
      // 1g carb = 4 kcal, 1g protein = 4 kcal, 1g fat = 9 kcal
      const carbs = Math.round((calories * 0.40) / 4);
      const protein = Math.round((calories * 0.30) / 4);
      const fat = Math.round((calories * 0.30) / 9);
      return { carbs, protein, fat };
    };

    return {
      bmr: roundedBmr,
      maintenance: tdee,
      cutting,
      bulking,
      maintenanceMacros: getMacros(tdee),
      cuttingMacros: getMacros(cutting),
      bulkingMacros: getMacros(bulking),
    };
  }, [gender, age, weight, height, unit, activity]);

  return (
    <ToolLayout tool={tool as any} resultVisible={!!tdeeResults}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-base">Body Specs</h3>
            <div className="flex rounded-md border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setUnit('metric')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'metric' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'imperial' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={gender === 'male' ? 'default' : 'outline'}
                onClick={() => setGender('male')}
                className="w-full"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={gender === 'female' ? 'default' : 'outline'}
                onClick={() => setGender('female')}
                className="w-full"
              >
                Female
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Age (Years)</label>
              <Input
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Height ({unit === 'metric' ? 'cm' : 'inches'})
              </label>
              <Input
                type="number"
                placeholder={unit === 'metric' ? '175' : '69'}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="30"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <Input
              type="number"
              placeholder={unit === 'metric' ? '70' : '154'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Activity Level</label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2">Sedentary (Little/No Exercise)</SelectItem>
                <SelectItem value="1.375">Lightly Active (1-3 days/week)</SelectItem>
                <SelectItem value="1.55">Moderately Active (3-5 days/week)</SelectItem>
                <SelectItem value="1.725">Very Active (6-7 days/week)</SelectItem>
                <SelectItem value="1.9">Extra Active (Hard physical job/training)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {tdeeResults ? (
            <div className="space-y-6">
              {/* Main Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    BMR (Basal Metabolic Rate)
                  </span>
                  <p className="text-3xl font-extrabold mt-1 text-primary">{tdeeResults.bmr}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Calories burned at complete rest</p>
                </div>
                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    TDEE (Daily Maintenance)
                  </span>
                  <p className="text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-500">
                    {tdeeResults.maintenance}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Calories to maintain current weight</p>
                </div>
              </div>

              {/* Goal Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Weight Loss */}
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">Weight Loss</span>
                    <span className="text-xs text-muted-foreground">-500 kcal</span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{tdeeResults.cutting}</p>
                    <p className="text-[10px] text-muted-foreground">kcal / day</p>
                  </div>
                  <div className="text-[11px] space-y-1 bg-muted p-2 rounded">
                    <div className="flex justify-between">
                      <span>Carbs (40%)</span>
                      <span className="font-medium">{tdeeResults.cuttingMacros.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein (30%)</span>
                      <span className="font-medium">{tdeeResults.cuttingMacros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat (30%)</span>
                      <span className="font-medium">{tdeeResults.cuttingMacros.fat}g</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance */}
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">Maintain</span>
                    <span className="text-xs text-muted-foreground">Stable</span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{tdeeResults.maintenance}</p>
                    <p className="text-[10px] text-muted-foreground">kcal / day</p>
                  </div>
                  <div className="text-[11px] space-y-1 bg-muted p-2 rounded">
                    <div className="flex justify-between">
                      <span>Carbs (40%)</span>
                      <span className="font-medium">{tdeeResults.maintenanceMacros.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein (30%)</span>
                      <span className="font-medium">{tdeeResults.maintenanceMacros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat (30%)</span>
                      <span className="font-medium">{tdeeResults.maintenanceMacros.fat}g</span>
                    </div>
                  </div>
                </div>

                {/* Muscle Gain */}
                <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-semibold text-sm text-rose-600 dark:text-rose-400">Weight Gain</span>
                    <span className="text-xs text-muted-foreground">+500 kcal</span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{tdeeResults.bulking}</p>
                    <p className="text-[10px] text-muted-foreground">kcal / day</p>
                  </div>
                  <div className="text-[11px] space-y-1 bg-muted p-2 rounded">
                    <div className="flex justify-between">
                      <span>Carbs (40%)</span>
                      <span className="font-medium">{tdeeResults.bulkingMacros.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein (30%)</span>
                      <span className="font-medium">{tdeeResults.bulkingMacros.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat (30%)</span>
                      <span className="font-medium">{tdeeResults.bulkingMacros.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Info */}
              <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">About These Calculations</p>
                  <p>
                    Calculations are based on the Mifflin-St Jeor formula, widely considered the most accurate
                    standard method for predicting daily caloric requirements. Total Daily Energy Expenditure (TDEE)
                    factors in both resting metabolism and the thermal effect of your selected activity level.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <HeartPulse className="w-12 h-12 mb-3 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-semibold text-base mb-1">Enter Your Specifications</h3>
              <p className="text-sm max-w-md">
                Fill in your gender, age, height, and weight measurements in the side panel to view your customized caloric requirements and macro breakdown targets.
              </p>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This tool is for informational and educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always consult with a qualified health professional or dietitian before starting a new diet or exercise regimen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
