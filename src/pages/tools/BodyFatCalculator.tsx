/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { HeartPulse, Info, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function BodyFatCalculator() {
  const tool = getToolById('body-fat-calculator') || {
    id: 'body-fat-calculator',
    name: 'Body Fat Calculator',
    description: 'Estimate your body fat percentage using the US Navy Circumference Method.',
    metaTitle: 'Body Fat Calculator - US Navy Method | ToolNest',
    metaDescription: 'Find your body fat percentage, lean body mass, and fitness classification with waist, neck, and hip measurements.',
    category: 'health',
  };

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState(''); // Only for women

  const results = useMemo(() => {
    const hVal = Number(height);
    const nVal = Number(neck);
    const wVal = Number(waist);
    const hpVal = Number(hip);

    if (!hVal || !nVal || !wVal || hVal <= 0 || nVal <= 0 || wVal <= 0) return null;
    if (gender === 'female' && (!hpVal || hpVal <= 0)) return null;

    // Convert measurements to cm
    let heightCm = hVal;
    let neckCm = nVal;
    let waistCm = wVal;
    let hipCm = hpVal;

    if (unit === 'imperial') {
      heightCm = hVal * 2.54;
      neckCm = nVal * 2.54;
      waistCm = wVal * 2.54;
      hipCm = hpVal * 2.54;
    }

    if (gender === 'male') {
      if (waistCm <= neckCm) return null;
      // US Navy Formula (Male, metric)
      const bf = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
      return isNaN(bf) || bf <= 0 ? null : Math.round(bf * 10) / 10;
    } else {
      if (waistCm + hipCm <= neckCm) return null;
      // US Navy Formula (Female, metric)
      const bf = 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
      return isNaN(bf) || bf <= 0 ? null : Math.round(bf * 10) / 10;
    }
  }, [gender, unit, height, neck, waist, hip]);

  const classification = useMemo(() => {
    if (results === null) return null;
    const bf = results;

    if (gender === 'male') {
      if (bf < 6) return { label: 'Essential Fat', color: 'text-blue-500', bg: 'bg-blue-500' };
      if (bf < 14) return { label: 'Athletes', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if (bf < 18) return { label: 'Fitness', color: 'text-teal-500', bg: 'bg-teal-500' };
      if (bf < 25) return { label: 'Average', color: 'text-amber-500', bg: 'bg-amber-500' };
      return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500' };
    } else {
      if (bf < 14) return { label: 'Essential Fat', color: 'text-blue-500', bg: 'bg-blue-500' };
      if (bf < 21) return { label: 'Athletes', color: 'text-emerald-500', bg: 'bg-emerald-500' };
      if (bf < 25) return { label: 'Fitness', color: 'text-teal-500', bg: 'bg-teal-500' };
      if (bf < 32) return { label: 'Average', color: 'text-amber-500', bg: 'bg-amber-500' };
      return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500' };
    }
  }, [results, gender]);

  return (
    <ToolLayout tool={tool as any} resultVisible={results !== null}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specifications Form */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-base font-medium">Measurements</h3>
            <div className="flex rounded-md border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setUnit('metric')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'metric' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Metric (cm)
              </button>
              <button
                type="button"
                onClick={() => setUnit('imperial')}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  unit === 'imperial' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                }`}
              >
                Imperial (in)
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

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Height ({unit === 'metric' ? 'cm' : 'in'})</label>
              <Input
                type="number"
                placeholder={unit === 'metric' ? '175' : '69'}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Neck Circumference ({unit === 'metric' ? 'cm' : 'in'})</label>
              <Input
                type="number"
                placeholder={unit === 'metric' ? '38' : '15'}
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Waist Circumference ({unit === 'metric' ? 'cm' : 'in'})</label>
              <Input
                type="number"
                placeholder={unit === 'metric' ? '86' : '34'}
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                min="1"
              />
            </div>
            {gender === 'female' && (
              <div>
                <label className="text-sm font-medium">Hip Circumference ({unit === 'metric' ? 'cm' : 'in'})</label>
                <Input
                  type="number"
                  placeholder={unit === 'metric' ? '96' : '38'}
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results view */}
        <div className="md:col-span-2 space-y-6">
          {results !== null && classification !== null ? (
            <div className="space-y-6">
              {/* Display Result card */}
              <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Estimated Body Fat Percentage
                </span>
                <p className="text-5xl font-extrabold mt-2 text-primary">{results}%</p>
                <p className={`text-lg font-bold mt-2 ${classification.color}`}>{classification.label}</p>
              </div>

              {/* Progress Gauge */}
              <div className="rounded-xl border bg-card p-6 space-y-3">
                <h4 className="font-semibold text-sm">Body Fat Category Gauge</h4>
                <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden flex">
                  {/* Highlight bar */}
                  <div
                    className={`h-full absolute left-0 top-0 transition-all duration-500 ${classification.bg}`}
                    style={{ width: `${Math.min(100, (results / 50) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>Essential Fat</span>
                  <span>Athlete</span>
                  <span>Fitness</span>
                  <span>Average</span>
                  <span>Obese</span>
                </div>
              </div>

              {/* Guide details */}
              <div className="rounded-xl border bg-card p-6 space-y-3 text-sm">
                <h4 className="font-semibold">Classification Reference (US Navy)</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold mb-1 text-blue-500">Men</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Essential Fat: 2 - 5%</li>
                      <li>Athletes: 6 - 13%</li>
                      <li>Fitness: 14 - 17%</li>
                      <li>Average: 18 - 24%</li>
                      <li>Obese: 25% or higher</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-pink-500">Women</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Essential Fat: 10 - 13%</li>
                      <li>Athletes: 14 - 20%</li>
                      <li>Fitness: 21 - 24%</li>
                      <li>Average: 25 - 31%</li>
                      <li>Obese: 32% or higher</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Explanation tip */}
              <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">About the Navy Method</p>
                  <p>
                    The U.S. Navy Body Fat Formula provides a reliable circumference-based estimate of your body composition. While hydrostatic weighing or DXA scans are the gold standard, this method is highly accurate (typically within 3-4% error margin) for estimating metrics without expensive machinery.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <HeartPulse className="w-12 h-12 mb-3 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-semibold text-base mb-1">Enter Your Dimensions</h3>
              <p className="text-sm max-w-md">
                Input your height, neck, and waist circumferences (plus hips if female) to get an estimate of your body fat percentage.
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
