import { useState, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function BmiCalculator() {
  const tool = getToolById('bmi-calculator')!;
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightInches, setHeightInches] = useState('');

  const bmi = useMemo(() => {
    if (unit === 'metric') {
      const h = Number(height) / 100; // cm to m
      const w = Number(weight);
      if (h <= 0 || w <= 0) return 0;
      return w / (h * h);
    } else {
      const hFt = Number(height);
      const hIn = Number(heightInches);
      const hTotal = hFt * 12 + hIn;
      const w = Number(weight);
      if (hTotal <= 0 || w <= 0) return 0;
      return (w / (hTotal * hTotal)) * 703;
    }
  }, [height, weight, heightInches, unit]);

  const getCategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const category = getCategory(bmi);

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={unit === 'metric' ? 'default' : 'outline'} size="sm" onClick={() => setUnit('metric')}>
            Metric (kg/cm)
          </Button>
          <Button variant={unit === 'imperial' ? 'default' : 'outline'} size="sm" onClick={() => setUnit('imperial')}>
            Imperial (lb/ft)
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          {unit === 'metric' ? (
            <>
              <div>
                <label className="text-sm font-medium">Height (cm)</label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Height (ft)</label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="5" />
              </div>
              <div>
                <label className="text-sm font-medium">Height (in)</label>
                <Input type="number" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} placeholder="9" />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (lb)</label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="150" />
              </div>
            </>
          )}
        </div>

        {bmi > 0 && (
          <div className="space-y-4">
            <div className="text-center rounded-xl border bg-card p-6">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-4xl font-bold">{bmi.toFixed(1)}</p>
              <p className={`text-lg font-medium ${category.color}`}>{category.label}</p>
            </div>

            {/* BMI Scale */}
            <div className="rounded-xl border bg-card p-4">
              <div className="relative h-8 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-blue-400" />
                <div className="flex-1 bg-emerald-400" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
