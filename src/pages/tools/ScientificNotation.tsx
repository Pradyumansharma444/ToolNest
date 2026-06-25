import { useState, useMemo } from 'react';
import { Superscript, ArrowLeftRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function ScientificNotation() {
  const tool = getToolById('scientific-notation')!;
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === 'standard') {
      const num = parseFloat(input);
      if (isNaN(num)) return { error: 'Invalid number' };
      if (num === 0) return { value: '0', exponent: '0', display: '0 × 10⁰' };
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mantissa = num / Math.pow(10, exp);
      const exponentStr = String(exp).replace(/-/g, '⁻').replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹');
      return {
        value: mantissa.toFixed(mantissa % 1 === 0 ? 0 : 10).replace(/\.?0+$/, ''),
        exponent: String(exp),
        display: `${mantissa.toFixed(mantissa % 1 === 0 ? 0 : 10).replace(/\.?0+$/, '')} × 10${exponentStr}`,
        engineering: (num / Math.pow(10, exp - (exp % 3))).toFixed(4).replace(/\.?0+$/, '') + ` × 10${String(exp - (exp % 3)).replace(/-/g, '⁻').replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹')}`,
      };
    } else {
      const match = input.match(/^([+-]?\d+\.?\d*)\s*[×x*]\s*10\s*[\^]?\s*([+-]?\d+)$/i);
      if (!match) return { error: 'Format: M × 10^E (e.g., 1.234 × 10^3)' };
      const mantissa = parseFloat(match[1]);
      const exponent = parseInt(match[2]);
      if (isNaN(mantissa) || isNaN(exponent)) return { error: 'Invalid number' };
      const num = mantissa * Math.pow(10, exponent);
      return { standard: num.toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 20 }) };
    }
  }, [input, mode]);

  return (
    <ToolLayout tool={tool} resultVisible={!!input.trim()}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={mode === 'standard' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('standard'); setInput(''); }}>
            Standard → Scientific
          </Button>
          <Button variant={mode === 'scientific' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('scientific'); setInput(''); }}>
            Scientific → Standard
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <label className="text-sm font-medium">{mode === 'standard' ? 'Enter a number' : 'Enter scientific notation'}</label>
          <Input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'standard' ? 'e.g., 1234 or 0.000567' : 'e.g., 1.234 × 10^3'} className="font-mono text-lg" />

          {result && !result.error && (
            <div className="space-y-3">
              {mode === 'standard' && (
                <>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <Superscript className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold font-mono">{result.display}</p>
                    <p className="text-sm text-muted-foreground mt-1">Scientific Notation</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-lg font-bold font-mono">{result.engineering}</p>
                    <p className="text-sm text-muted-foreground mt-1">Engineering Notation</p>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Mantissa: {result.value} × 10<sup>{result.exponent}</sup>
                  </div>
                </>
              )}
              {mode === 'scientific' && (
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <ArrowLeftRight className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">{result.standard}</p>
                  <p className="text-sm text-muted-foreground mt-1">Standard Notation</p>
                </div>
              )}
            </div>
          )}
          {result?.error && (
            <p className="text-destructive text-sm">{result.error}</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
