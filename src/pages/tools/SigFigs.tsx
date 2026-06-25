import { useState, useMemo } from 'react';
import { Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function countSigFigs(numStr: string): number {
  const trimmed = numStr.trim();
  if (!trimmed || trimmed === '0') return 0;
  const normalized = trimmed.replace(/^[+-]?0*/, '');
  if (!normalized || normalized === '.') return 0;
  const hasDecimal = normalized.includes('.');
  const digits = normalized.replace('.', '').replace(/^0+/, '');
  if (!digits) return 0;
  if (hasDecimal) {
    if (trimmed.startsWith('0')) {
      const significantStart = digits.match(/[1-9]/);
      if (!significantStart) return 0;
      return digits.slice(significantStart.index).length;
    }
    return digits.length;
  }
  const trailingZeros = digits.match(/0+$/);
  if (trailingZeros) {
    const sigPart = digits.replace(/0+$/, '');
    return sigPart.length > 0 ? sigPart.length + trailingZeros[0].length : trailingZeros[0].length;
  }
  return digits.length;
}

function roundToSigFigs(num: number, sigFigs: number): number {
  if (num === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(num)));
  const power = sigFigs - d;
  const magnitude = Math.pow(10, power);
  return Math.round(num * magnitude) / magnitude;
}

export default function SigFigs() {
  const tool = getToolById('sig-figs')!;
  const [input, setInput] = useState('');
  const [roundTo, setRoundTo] = useState('');

  const sigFigs = useMemo(() => countSigFigs(input), [input]);
  const num = parseFloat(input);

  const rounded = useMemo(() => {
    const n = parseInt(roundTo);
    if (isNaN(n) || n < 1 || isNaN(num)) return null;
    return roundToSigFigs(num, n);
  }, [num, roundTo]);

  return (
    <ToolLayout tool={tool} resultVisible={!!input.trim()}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Enter a number</label>
            <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., 0.00450 or 12300" className="font-mono text-lg" />
          </div>
        </div>

        {input.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-6 text-center">
              <Hash className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-4xl font-bold">{sigFigs}</p>
              <p className="text-sm text-muted-foreground mt-1">Significant Figures</p>
            </div>
            <div className="rounded-xl border bg-card p-6 space-y-3">
              <label className="text-sm font-medium">Round to N significant figures</label>
              <Input type="number" min="1" max="15" value={roundTo} onChange={(e) => setRoundTo(e.target.value)} placeholder="e.g., 3" />
              {rounded !== null && (
                <p className="text-2xl font-bold text-primary font-mono">{rounded.toPrecision(parseInt(roundTo))}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
