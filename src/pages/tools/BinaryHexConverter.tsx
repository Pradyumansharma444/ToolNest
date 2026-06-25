import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

export default function BinaryHexConverter() {
  const tool = getToolById('binary-hex-converter')!;

  const [inputVal, setInputVal] = useState('');
  const [inputBase, setInputBase] = useState<'2' | '8' | '10' | '16'>('10');
  
  const [conversions, setConversions] = useState<{
    binary: string;
    octal: string;
    decimal: string;
    hex: string;
    steps: string[];
  } | null>(null);

  // Trigger base conversions
  const handleConvert = () => {
    if (!inputVal.trim()) return;

    try {
      const parsedInt = parseInt(inputVal.trim(), parseInt(inputBase, 10));
      if (isNaN(parsedInt)) throw new Error('Invalid number format');

      const binary = parsedInt.toString(2);
      const octal = parsedInt.toString(8);
      const decimal = parsedInt.toString(10);
      const hex = parsedInt.toString(16).toUpperCase();

      // Build step-by-step math explanation (using decimal base 10 divisions)
      const steps: string[] = [];
      let temp = parsedInt;
      steps.push(`Converting Decimal ${parsedInt} to Binary:`);
      while (temp > 0) {
        const remainder = temp % 2;
        steps.push(`${temp} ÷ 2 = ${Math.floor(temp / 2)} (Remainder: ${remainder})`);
        temp = Math.floor(temp / 2);
      }
      steps.reverse(); // show order of digits correctly

      setConversions({ binary, octal, decimal, hex, steps });
    } catch {
      setConversions(null);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={conversions !== null}>
      <div className="space-y-6">
        
        {/* Input selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-2xl border">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Number Input Value</label>
            <Input
              placeholder="Enter numeric digits..."
              className="py-5 rounded-xl font-mono font-bold"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Input Base Radix</label>
            <select
              className="w-full bg-background border rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={inputBase}
              onChange={(e) => setInputBase(e.target.value as '2' | '8' | '10' | '16')}
            >
              <option value="2">Binary (Base 2)</option>
              <option value="8">Octal (Base 8)</option>
              <option value="10">Decimal (Base 10)</option>
              <option value="16">Hexadecimal (Base 16)</option>
            </select>
          </div>
        </div>

        {/* Results grid */}
        {conversions && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-muted/40 p-4 rounded-xl border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Binary (Base 2)</div>
              <div className="text-lg font-bold font-mono break-all">{conversions.binary}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Octal (Base 8)</div>
              <div className="text-lg font-bold font-mono break-all">{conversions.octal}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Decimal (Base 10)</div>
              <div className="text-lg font-bold font-mono break-all">{conversions.decimal}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Hexadecimal (Base 16)</div>
              <div className="text-lg font-bold font-mono break-all">{conversions.hex}</div>
            </div>
          </div>
        )}

        {/* Conversion steps logs */}
        {conversions && conversions.steps.length > 0 && (
          <div className="rounded-2xl border bg-muted/20 p-5 space-y-2 animate-fade-in font-mono text-xs">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Calculation Steps</div>
            <div className="space-y-1">
              {conversions.steps.map((step, idx) => (
                <div key={idx} className="border-b border-muted py-0.5">{step}</div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleConvert} disabled={!inputVal.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Convert Numeric Base
        </Button>
      </div>
    </ToolLayout>
  );
}
