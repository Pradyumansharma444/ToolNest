import { useState, useMemo } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function getPhLabel(ph: number): string {
  if (ph < 3) return 'Strong Acid';
  if (ph < 5) return 'Weak Acid';
  if (ph < 6.5) return 'Very Weak Acid';
  if (ph < 7.5) return 'Neutral';
  if (ph < 9) return 'Very Weak Base';
  if (ph < 11) return 'Weak Base';
  return 'Strong Base';
}

interface Results {
  ph: number;
  hPlus: number;
  pOH: number;
  ohMinus: number;
  error?: string;
}

export default function PhCalculator() {
  const tool = getToolById('ph-calculator')!;
  const [mode, setMode] = useState<'ph' | 'hplus'>('ph');
  const [input, setInput] = useState('');

  const results = useMemo<Results | null>(() => {
    if (!input.trim()) return null;
    if (mode === 'ph') {
      const ph = parseFloat(input);
      if (isNaN(ph) || ph < 0 || ph > 14) return { ph: 0, hPlus: 0, pOH: 0, ohMinus: 0, error: 'pH must be between 0 and 14' };
      const hPlus = Math.pow(10, -ph);
      const pOH = 14 - ph;
      const ohMinus = Math.pow(10, -pOH);
      return { ph, hPlus, pOH, ohMinus };
    } else {
      const hPlus = parseFloat(input);
      if (isNaN(hPlus) || hPlus <= 0) return { ph: 0, hPlus: 0, pOH: 0, ohMinus: 0, error: '[H+] must be a positive number' };
      const ph = -Math.log10(hPlus);
      const pOH = 14 - ph;
      const ohMinus = Math.pow(10, -pOH);
      return { ph, hPlus, pOH, ohMinus };
    }
  }, [input, mode]);

  return (
    <ToolLayout tool={tool} resultVisible={results !== null}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={mode === 'ph' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('ph'); setInput(''); }}>
            pH → [H⁺]
          </Button>
          <Button variant={mode === 'hplus' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('hplus'); setInput(''); }}>
            [H⁺] → pH
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">{mode === 'ph' ? 'Enter pH value (0-14)' : 'Enter [H⁺] concentration (mol/L)'}</label>
            <Input type="number" step="any" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'ph' ? 'e.g., 7' : 'e.g., 0.00001'} className="font-mono text-lg" />
          </div>

          {results && !results.error && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">pH</p>
                  <p className="text-xl font-bold">{results.ph.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">pOH</p>
                  <p className="text-xl font-bold">{results.pOH.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">[H⁺]</p>
                  <p className="text-xl font-bold font-mono">{results.hPlus.toExponential(3)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">[OH⁻]</p>
                  <p className="text-xl font-bold font-mono">{results.ohMinus.toExponential(3)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Acidic)</span>
                  <span className="font-bold">{getPhLabel(results.ph)}</span>
                  <span>14 (Basic)</span>
                </div>
                <div className="relative h-6 rounded-full overflow-hidden flex">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: '#3b82f6' }} />
                  ))}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-black/50" style={{ left: `${(results.ph / 14) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Acidic</span>
                  <span className="text-emerald-600">Neutral</span>
                  <span className="text-purple-600">Basic</span>
                </div>
              </div>
            </div>
          )}
          {results?.error && <p className="text-destructive text-sm">{results.error}</p>}
        </div>
      </div>
    </ToolLayout>
  );
}
