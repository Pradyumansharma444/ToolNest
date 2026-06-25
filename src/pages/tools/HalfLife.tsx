import { useState, useMemo } from 'react';
import { Atom } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function HalfLife() {
  const tool = getToolById('half-life')!;
  const [initialAmount, setInitialAmount] = useState('100');
  const [halfLife, setHalfLife] = useState('10');
  const [elapsedTime, setElapsedTime] = useState('20');
  const [timeUnit, setTimeUnit] = useState('years');

  const result = useMemo(() => {
    const N0 = parseFloat(initialAmount);
    const tHalf = parseFloat(halfLife);
    const t = parseFloat(elapsedTime);
    if (isNaN(N0) || isNaN(tHalf) || isNaN(t) || N0 <= 0 || tHalf <= 0 || t < 0) return null;

    const halfLives = t / tHalf;
    const remaining = N0 * Math.pow(0.5, halfLives);
    const decayConstant = Math.LN2 / tHalf;
    const activity = N0 * decayConstant * Math.pow(0.5, halfLives);

    return {
      halfLives,
      remaining,
      decayed: N0 - remaining,
      remainingPercent: (remaining / N0) * 100,
      decayConstant,
      activity,
    };
  }, [initialAmount, halfLife, elapsedTime]);

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Initial Amount</label>
              <Input type="number" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} placeholder="100" />
            </div>
            <div>
              <label className="text-sm font-medium">Half-Life</label>
              <Input type="number" value={halfLife} onChange={(e) => setHalfLife(e.target.value)} placeholder="10" />
            </div>
            <div>
              <label className="text-sm font-medium">Elapsed Time ({timeUnit})</label>
              <Input type="number" value={elapsedTime} onChange={(e) => setElapsedTime(e.target.value)} placeholder="20" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['seconds', 'minutes', 'hours', 'days', 'years'].map((unit) => (
              <button key={unit} onClick={() => setTimeUnit(unit)}
                className={`px-3 py-1 text-xs rounded-full border ${timeUnit === unit ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                {unit}
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-card p-4 text-center">
                <Atom className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{result.halfLives.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Half-Lives Elapsed</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{result.remaining.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Remaining Amount</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{result.decayed.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Decayed Amount</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{result.remainingPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Remaining (%)</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Remaining: {result.remainingPercent.toFixed(1)}%</span>
                <span>Decayed: {(100 - result.remainingPercent).toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${result.remainingPercent}%` }} />
                <div className="h-full bg-red-400 transition-all" style={{ width: `${100 - result.remainingPercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
