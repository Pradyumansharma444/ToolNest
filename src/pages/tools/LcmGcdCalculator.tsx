import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export default function LcmGcdCalculator() {
  const tool = getToolById('lcm-gcd')!;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    lcmVal: number;
    gcdVal: number;
    steps: string[];
  } | null>(null);

  const handleCalculate = () => {
    const nums = input
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (nums.length < 2) return;

    let currentGcd = nums[0];
    let currentLcm = nums[0];
    const steps: string[] = [];

    steps.push(`Numbers List: ${nums.join(', ')}`);

    for (let i = 1; i < nums.length; i++) {
      const prevGcd = currentGcd;
      const prevLcm = currentLcm;
      currentGcd = gcd(currentGcd, nums[i]);
      currentLcm = lcm(currentLcm, nums[i]);

      steps.push(`Round ${i}:`);
      steps.push(`- GCD of (${prevGcd}, ${nums[i]}) = ${currentGcd}`);
      steps.push(`- LCM of (${prevLcm}, ${nums[i]}) = ${currentLcm}`);
    }

    setResult({
      lcmVal: currentLcm,
      gcdVal: currentGcd,
      steps,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Comma Separated Integers</label>
          <Input
            placeholder="e.g. 12, 18, 30"
            className="py-6 rounded-xl font-bold font-mono text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Output values */}
        {result && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-muted/40 p-4 rounded-xl border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Least Common Multiple (LCM)</div>
              <div className="text-2xl font-black text-primary">{result.lcmVal}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Greatest Common Divisor (GCD)</div>
              <div className="text-2xl font-black text-emerald-500">{result.gcdVal}</div>
            </div>
          </div>
        )}

        {/* Euclid logic steps */}
        {result && result.steps.length > 0 && (
          <div className="rounded-2xl border bg-muted/20 p-5 space-y-2 animate-fade-in font-mono text-xs">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Calculation Steps</div>
            <div className="space-y-1">
              {result.steps.map((step, idx) => (
                <div key={idx} className="border-b border-muted py-0.5">{step}</div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} disabled={!input} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Compute LCM & GCD
        </Button>
      </div>
    </ToolLayout>
  );
}
