import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

// Euclidean GCD
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export default function FractionCalculator() {
  const tool = getToolById('fraction-calculator')!;

  const [n1, setN1] = useState('');
  const [d1, setD1] = useState('');
  const [n2, setN2] = useState('');
  const [d2, setD2] = useState('');
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');

  const [result, setResult] = useState<{
    numerator: number;
    denominator: number;
    simplifiedNum: number;
    simplifiedDen: number;
    steps: string[];
  } | null>(null);

  const handleCalculate = () => {
    const num1 = parseInt(n1, 10);
    const den1 = parseInt(d1, 10);
    const num2 = parseInt(n2, 10);
    const den2 = parseInt(d2, 10);

    if (isNaN(num1) || isNaN(den1) || isNaN(num2) || isNaN(den2) || den1 === 0 || den2 === 0) {
      return;
    }

    let resultNum = 0;
    let resultDen = 1;
    const steps: string[] = [];

    switch (op) {
      case '+':
        resultNum = num1 * den2 + num2 * den1;
        resultDen = den1 * den2;
        steps.push(`Formula: (a × d + b × c) ÷ (b × d)`);
        steps.push(`= (${num1} × ${den2} + ${num2} × ${den1}) ÷ (${den1} × ${den2})`);
        steps.push(`= (${num1 * den2} + ${num2 * den1}) ÷ ${resultDen}`);
        steps.push(`= ${resultNum} ÷ ${resultDen}`);
        break;
      case '-':
        resultNum = num1 * den2 - num2 * den1;
        resultDen = den1 * den2;
        steps.push(`Formula: (a × d - b × c) ÷ (b × d)`);
        steps.push(`= (${num1} × ${den2} - ${num2} × ${den1}) ÷ (${den1} × ${den2})`);
        steps.push(`= (${num1 * den2} - ${num2 * den1}) ÷ ${resultDen}`);
        steps.push(`= ${resultNum} ÷ ${resultDen}`);
        break;
      case '*':
        resultNum = num1 * num2;
        resultDen = den1 * den2;
        steps.push(`Formula: (a × c) ÷ (b × d)`);
        steps.push(`= (${num1} × ${num2}) ÷ (${den1} × ${den2})`);
        steps.push(`= ${resultNum} ÷ ${resultDen}`);
        break;
      case '/':
        resultNum = num1 * den2;
        resultDen = den1 * num2;
        steps.push(`Formula: (a × d) ÷ (b × c)`);
        steps.push(`= (${num1} × ${den2}) ÷ (${den1} × ${num2})`);
        steps.push(`= ${resultNum} ÷ ${resultDen}`);
        break;
    }

    const divisor = gcd(resultNum, resultDen);
    const simplifiedNum = resultNum / divisor;
    const simplifiedDen = resultDen / divisor;

    steps.push(`Greatest Common Divisor (GCD): ${divisor}`);
    steps.push(`Simplified Fraction: ${simplifiedNum} / ${simplifiedDen}`);

    setResult({
      numerator: resultNum,
      denominator: resultDen,
      simplifiedNum,
      simplifiedDen,
      steps,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        {/* Fraction equation form inputs */}
        <div className="flex items-center gap-4 bg-muted/40 p-6 rounded-2xl border flex-wrap justify-center text-center">
          {/* Fraction 1 */}
          <div className="flex flex-col gap-2 w-16">
            <Input type="number" placeholder="Num" className="text-center font-bold" value={n1} onChange={(e) => setN1(e.target.value)} />
            <div className="border-b-2 border-foreground" />
            <Input type="number" placeholder="Den" className="text-center font-bold" value={d1} onChange={(e) => setD1(e.target.value)} />
          </div>

          {/* Operation Selector */}
          <select
            className="bg-background border rounded-xl py-2 px-3 font-extrabold focus:outline-none focus:ring-2 focus:ring-primary h-12 text-lg"
            value={op}
            onChange={(e) => setOp(e.target.value as '+' | '-' | '*' | '/')}
          >
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">×</option>
            <option value="/">÷</option>
          </select>

          {/* Fraction 2 */}
          <div className="flex flex-col gap-2 w-16">
            <Input type="number" placeholder="Num" className="text-center font-bold" value={n2} onChange={(e) => setN2(e.target.value)} />
            <div className="border-b-2 border-foreground" />
            <Input type="number" placeholder="Den" className="text-center font-bold" value={d2} onChange={(e) => setD2(e.target.value)} />
          </div>
        </div>

        {/* Results outputs */}
        {result && (
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-4 animate-fade-in text-center">
            <div className="text-xs text-muted-foreground uppercase font-bold">Calculated Output</div>
            <div className="flex justify-center items-center gap-3 text-4xl font-black font-mono">
              <div className="flex flex-col items-center">
                <span>{result.simplifiedNum}</span>
                <span className="w-16 border-b-4 border-foreground" />
                <span>{result.simplifiedDen}</span>
              </div>
            </div>
          </div>
        )}

        {/* Math steps explanation logs */}
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

        <Button onClick={handleCalculate} disabled={!n1 || !d1 || !n2 || !d2} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Calculate Equation
        </Button>
      </div>
    </ToolLayout>
  );
}
