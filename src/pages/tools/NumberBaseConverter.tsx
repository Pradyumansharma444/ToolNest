import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

export default function NumberBaseConverter() {
  const tool = getToolById('number-base-converter')!;

  const [inputVal, setInputVal] = useState('');
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('2');
  
  const [result, setResult] = useState<{
    outputVal: string;
    explanation: string;
  } | null>(null);

  // Convert custom bases
  const handleConvert = () => {
    if (!inputVal.trim()) return;

    try {
      const fBase = parseInt(fromBase, 10);
      const tBase = parseInt(toBase, 10);

      // Simple implementation: split integer and fractional parts
      const parts = inputVal.trim().split('.');
      const intPart = parseInt(parts[0], fBase);
      if (isNaN(intPart)) throw new Error('Invalid number');

      let outputVal = intPart.toString(tBase);

      if (parts[1]) {
        // Simple decimal float fraction convert
        let fracDec = 0;
        for (let i = 0; i < parts[1].length; i++) {
          const val = parseInt(parts[1][i], fBase);
          fracDec += val / Math.pow(fBase, i + 1);
        }

        // Convert decimal fraction to target base (max 6 digits)
        let fracTarget = '';
        let temp = fracDec;
        for (let i = 0; i < 6; i++) {
          if (temp === 0) break;
          temp *= tBase;
          const digit = Math.floor(temp);
          fracTarget += digit.toString(tBase);
          temp -= digit;
        }
        if (fracTarget) {
          outputVal += '.' + fracTarget;
        }
      }

      const explanation = `Converted ${inputVal} (Base ${fromBase}) to ${outputVal.toUpperCase()} (Base ${toBase}).`;
      setResult({ outputVal: outputVal.toUpperCase(), explanation });
    } catch {
      setResult({ outputVal: 'Error', explanation: 'Invalid digits for the chosen input base.' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        {/* Radix selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-2xl border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Source Base</label>
            <select
              className="w-full bg-background border rounded-xl py-2 px-3 text-sm focus:outline-none"
              value={fromBase}
              onChange={(e) => setFromBase(e.target.value)}
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>Base {b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Number Input</label>
            <Input
              placeholder="Enter number..."
              className="font-bold font-mono py-4 rounded-xl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Target Base</label>
            <select
              className="w-full bg-background border rounded-xl py-2 px-3 text-sm focus:outline-none"
              value={toBase}
              onChange={(e) => setToBase(e.target.value)}
            >
              {Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
                <option key={b} value={b}>Base {b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Output */}
        {result && (
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-2 animate-fade-in text-center">
            <div className="text-xs text-muted-foreground uppercase font-bold">Conversion Output</div>
            <div className="text-2xl font-black font-mono tracking-wide text-primary break-all">{result.outputVal}</div>
            <p className="text-xs text-muted-foreground mt-2">{result.explanation}</p>
          </div>
        )}

        <Button onClick={handleConvert} disabled={!inputVal.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Convert Bases
        </Button>
      </div>
    </ToolLayout>
  );
}
