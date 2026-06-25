import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';


// Prime check helper
function isPrime(num: number): { result: boolean; divisor?: number } {
  if (num <= 1) return { result: false };
  if (num <= 3) return { result: true };
  if (num % 2 === 0) return { result: false, divisor: 2 };
  if (num % 3 === 0) return { result: false, divisor: 3 };

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0) return { result: false, divisor: i };
    if (num % (i + 2) === 0) return { result: false, divisor: i + 2 };
  }
  return { result: true };
}

// Factorization helper
function getPrimeFactors(num: number): number[] {
  const factors: number[] = [];
  let d = 2;
  while (num > 1) {
    while (num % d === 0) {
      factors.push(d);
      num /= d;
    }
    d++;
    if (d * d > num) {
      if (num > 1) factors.push(num);
      break;
    }
  }
  return factors;
}

export default function PrimeChecker() {
  const tool = getToolById('prime-checker')!;

  const [inputVal, setInputVal] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const [output, setOutput] = useState<{
    isPrimeResult: boolean;
    explanation: string;
    factors: number[];
  } | null>(null);

  const [primesRange, setPrimesRange] = useState<number[] | null>(null);

  const handleCheck = () => {
    const num = parseInt(inputVal.trim(), 10);
    if (isNaN(num)) return;

    const { result, divisor } = isPrime(num);
    let explanation = '';
    let factors: number[] = [];

    if (result) {
      explanation = `${num} is a prime number. It is only divisible by 1 and itself.`;
    } else {
      explanation = `${num} is a composite number.`;
      if (divisor) {
        explanation += ` It is divisible by ${divisor} (e.g. ${divisor} × ${num / divisor} = ${num}).`;
      }
      factors = getPrimeFactors(num);
    }

    setOutput({ isPrimeResult: result, explanation, factors });
    setPrimesRange(null);
  };

  const handleGenerateRange = () => {
    const start = parseInt(rangeStart.trim(), 10);
    const end = parseInt(rangeEnd.trim(), 10);

    if (isNaN(start) || isNaN(end) || start > end) return;

    const list: number[] = [];
    // Limit range to prevent browser freezing
    const capEnd = Math.min(start + 5000, end);

    for (let i = Math.max(2, start); i <= capEnd; i++) {
      if (isPrime(i).result) {
        list.push(i);
      }
    }

    setPrimesRange(list);
    setOutput(null);
  };

  return (
    <ToolLayout tool={tool} resultVisible={output !== null || primesRange !== null}>
      <div className="space-y-6">
        
        {/* Toggle Mode Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Check prime */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Verify Integer</h3>
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Enter positive integer..."
                className="py-5 rounded-xl font-bold font-mono text-base"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
            <Button onClick={handleCheck} disabled={!inputVal} className="w-full font-bold gap-1.5 rounded-xl">
              Check Prime
            </Button>
          </div>

          {/* Section 2: Primes in Range */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Primes Range Finder</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Start"
                className="py-5 rounded-xl font-bold text-center"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
              <Input
                type="number"
                placeholder="End"
                className="py-5 rounded-xl font-bold text-center"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateRange} disabled={!rangeStart || !rangeEnd} className="w-full font-bold gap-1.5 rounded-xl">
              List Primes
            </Button>
          </div>
        </div>

        {/* Output verification */}
        {output && (
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Check results</span>
              <span className={`font-mono text-sm font-bold ${output.isPrimeResult ? 'text-emerald-500' : 'text-destructive'}`}>
                {output.isPrimeResult ? 'Is Prime' : 'Is Composite'}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{output.explanation}</p>
            {output.factors.length > 0 && (
              <div className="text-xs font-mono">
                <span className="text-muted-foreground">Prime Factorization: </span>
                <span className="font-bold">{output.factors.join(' × ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Output range lists */}
        {primesRange && (
          <div className="rounded-2xl border bg-muted/20 p-5 space-y-3 animate-fade-in">
            <div className="text-xs font-semibold text-muted-foreground uppercase border-b pb-2">Primes Found ({primesRange.length})</div>
            <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto font-mono text-xs pr-2">
              {primesRange.map((p) => (
                <span key={p} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                  {p}
                </span>
              ))}
              {primesRange.length === 0 && (
                <div className="text-muted-foreground text-center py-4 w-full">No primes found in this range.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
