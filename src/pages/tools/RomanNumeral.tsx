import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return '';
  const vals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [val, sym] of vals) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

function fromRoman(roman: string): number {
  const vals: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let result = 0;
  let i = 0;
  const s = roman.toUpperCase().trim();
  while (i < s.length) {
    if (i + 1 < s.length && vals[s.slice(i, i + 2)]) {
      result += vals[s.slice(i, i + 2)];
      i += 2;
    } else if (vals[s[i]]) {
      result += vals[s[i]];
      i++;
    } else {
      return -1;
    }
  }
  return result;
}

export default function RomanNumeral() {
  const tool = getToolById('roman-numeral')!;
  const [mode, setMode] = useState<'to' | 'from'>('to');
  const [input, setInput] = useState('');

  interface RomanResult {
    roman: string;
    number: number;
    error?: string;
  }

  const result = useMemo<RomanResult | null>(() => {
    if (!input.trim()) return null;
    if (mode === 'to') {
      const num = parseInt(input);
      if (isNaN(num) || num < 1 || num > 3999) return { roman: '', number: 0, error: 'Enter a number between 1 and 3999' };
      return { roman: toRoman(num), number: num };
    } else {
      const num = fromRoman(input);
      if (num < 1 || num > 3999) return { roman: '', number: 0, error: 'Invalid Roman numeral' };
      return { roman: input.trim().toUpperCase(), number: num };
    }
  }, [input, mode]);

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={mode === 'to' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('to'); setInput(''); }}>
            Number → Roman
          </Button>
          <Button variant={mode === 'from' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('from'); setInput(''); }}>
            Roman → Number
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">{mode === 'to' ? 'Enter a number (1-3999)' : 'Enter a Roman numeral'}</label>
            <Input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'to' ? 'e.g., 2024' : 'e.g., MMXXIV'} className="font-mono text-lg" />
          </div>

          {result && !result.error && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Roman Numeral</p>
                <p className="text-2xl font-bold font-mono">{result.roman}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Number</p>
                <p className="text-2xl font-bold">{result.number.toLocaleString()}</p>
              </div>
            </div>
          )}
          {result?.error && <p className="text-destructive text-sm">{result.error}</p>}
        </div>
      </div>
    </ToolLayout>
  );
}
