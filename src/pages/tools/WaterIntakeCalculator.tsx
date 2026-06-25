import { useState, useMemo } from 'react';
import { GlassWater, Info, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function WaterIntakeCalculator() {
  const tool = getToolById('water-intake') || {
    id: 'water-intake',
    name: 'Water Intake Calculator',
    description: 'Calculate your recommended daily water intake and log your drinking progress throughout the day.',
    metaTitle: 'Daily Water Intake Calculator & Tracker | ToolNest',
    metaDescription: 'Find your target fluid hydration levels based on weight, exercise, and climate, with a built-in cup tracker logging to local storage.',
    category: 'health',
    path: '/tools/water-intake',
    icon: 'GlassWater',
    keywords: ['water', 'intake', 'hydration', 'health', 'tracker'],
  };

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [exercise, setExercise] = useState('');
  const [climate, setClimate] = useState<string>('temperate');
  const [loggedWater, setLoggedWater] = useState(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('water-tracker-date');
    const storedAmount = localStorage.getItem('water-tracker-amount');
    if (storedDate === today && storedAmount) {
      return Number(storedAmount);
    }
    localStorage.setItem('water-tracker-date', today);
    localStorage.setItem('water-tracker-amount', '0');
    return 0;
  });

  const dailyTarget = useMemo(() => {
    const wVal = Number(weight);
    const exVal = Number(exercise);

    if (!wVal || wVal <= 0) return 0;

    let targetMl = 0;

    if (unit === 'metric') {
      // Base: 35ml per kg of body weight
      targetMl = wVal * 35;
    } else {
      // Imperial base: weight in lbs * 0.5 oz -> convert to ml (1 oz = 29.5735 ml)
      const targetOz = wVal * 0.5;
      targetMl = targetOz * 29.5735;
    }

    // Exercise modifier: +350 ml (12 oz) for every 30 minutes
    if (exVal > 0) {
      targetMl += (exVal / 30) * 350;
    }

    // Climate modifier
    if (climate === 'hot') {
      targetMl += 500;
    } else if (climate === 'cold') {
      targetMl -= 250;
    }

    // Return target rounded to nearest 50ml
    return Math.max(1000, Math.round(targetMl / 50) * 50);
  }, [weight, exercise, climate, unit]);

  const progressPercentage = useMemo(() => {
    if (dailyTarget === 0) return 0;
    return Math.min(100, Math.round((loggedWater / dailyTarget) * 100));
  }, [loggedWater, dailyTarget]);

  const logWater = (amountMl: number) => {
    const newVal = Math.max(0, loggedWater + amountMl);
    setLoggedWater(newVal);
    localStorage.setItem('water-tracker-amount', String(newVal));
  };

  const resetTracker = () => {
    setLoggedWater(0);
    localStorage.setItem('water-tracker-amount', '0');
  };

  return (
    <ToolLayout tool={tool} resultVisible={dailyTarget > 0}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specs Input Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-base">Personal Parameters</h3>
            <div className="flex rounded-md border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setUnit('metric')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'metric' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Metric (kg)
              </button>
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'imperial' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Imperial (lbs)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
              <Input
                type="number"
                placeholder={unit === 'metric' ? '70' : '150'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Daily Exercise (Minutes)</label>
              <Input
                type="number"
                placeholder="45"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Climate / Environment</label>
              <Select value={climate} onValueChange={setClimate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select climate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold (Less sweating)</SelectItem>
                  <SelectItem value="temperate">Temperate (Moderate)</SelectItem>
                  <SelectItem value="hot">Hot or Humid (High sweating)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tracker & Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {dailyTarget > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cup Animation tracker */}
              <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center space-y-4 shadow-sm relative overflow-hidden">
                <h4 className="font-semibold text-sm self-start mb-2">Daily Hydration Log</h4>

                {/* Glass Visual */}
                <div className="relative w-28 h-44 border-4 border-t-0 border-muted-foreground/40 rounded-b-2xl overflow-hidden bg-muted/20 flex items-end">
                  <div
                    className="w-full bg-blue-400 dark:bg-blue-600 transition-all duration-700 ease-out"
                    style={{ height: `${progressPercentage}%` }}
                  />
                  {/* Bubble Overlay */}
                  <div className="absolute inset-0 flex justify-center items-center font-bold text-lg pointer-events-none drop-shadow">
                    <span className={progressPercentage > 40 ? 'text-white' : 'text-foreground'}>
                      {progressPercentage}%
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium">
                    Logged: <span className="font-bold text-blue-500">{loggedWater} ml</span> / {dailyTarget} ml
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unit === 'imperial'
                      ? `(${Math.round(loggedWater / 29.57)} oz / ${Math.round(dailyTarget / 29.57)} oz)`
                      : `(${(loggedWater / 1000).toFixed(2)} L / ${(dailyTarget / 1000).toFixed(2)} L)`}
                  </p>
                </div>
              </div>

              {/* Log actions panel */}
              <div className="rounded-xl border bg-card p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <h4 className="font-semibold text-sm mb-4">Add Water Intake</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => logWater(250)} className="gap-1">
                      <Plus className="w-4 h-4" /> 250 ml (1 Cup)
                    </Button>
                    <Button variant="outline" onClick={() => logWater(350)} className="gap-1">
                      <Plus className="w-4 h-4" /> 350 ml (Can)
                    </Button>
                    <Button variant="outline" onClick={() => logWater(500)} className="gap-1">
                      <Plus className="w-4 h-4" /> 500 ml (Bottle)
                    </Button>
                    <Button variant="outline" onClick={() => logWater(750)} className="gap-1">
                      <Plus className="w-4 h-4" /> 750 ml (Large)
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => logWater(-250)} className="flex-1" disabled={loggedWater === 0}>
                    Subtract 250ml
                  </Button>
                  <Button variant="ghost" onClick={resetTracker} size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" title="Reset daily tracker">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <GlassWater className="w-12 h-12 mb-3 text-muted-foreground/60 animate-bounce" />
              <h3 className="font-semibold text-base mb-1">Compute Hydration Goal</h3>
              <p className="text-sm max-w-md">
                Input your weight in the sidebar panel to calculate your personalized daily water consumption target and open the tracking cup interface.
              </p>
            </div>
          )}

          {/* Explanation Tip */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Why Track Hydration?</p>
              <p>
                Proper hydration supports cognitive functions, energy levels, physical stamina, kidney health, and digestive comfort. Daily hydration needs scale significantly with body mass, elevated temperature levels, and cellular recovery from exercise.
              </p>
            </div>
          </div>

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
