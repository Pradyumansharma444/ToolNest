/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Database, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  decimalFactor: number; // multiplier from Byte
  binaryFactor: number; // multiplier from Byte
}

const UNITS: UnitDef[] = [
  { id: 'b', name: 'Bits', symbol: 'b', decimalFactor: 0.125, binaryFactor: 0.125 },
  { id: 'B', name: 'Bytes', symbol: 'B', decimalFactor: 1, binaryFactor: 1 },
  { id: 'KB', name: 'Kilobytes', symbol: 'KB / KiB', decimalFactor: 1000, binaryFactor: 1024 },
  { id: 'MB', name: 'Megabytes', symbol: 'MB / MiB', decimalFactor: 1000 ** 2, binaryFactor: 1024 ** 2 },
  { id: 'GB', name: 'Gigabytes', symbol: 'GB / GiB', decimalFactor: 1000 ** 3, binaryFactor: 1024 ** 3 },
  { id: 'TB', name: 'Terabytes', symbol: 'TB / TiB', decimalFactor: 1000 ** 4, binaryFactor: 1024 ** 4 },
  { id: 'PB', name: 'Petabytes', symbol: 'PB / PiB', decimalFactor: 1000 ** 5, binaryFactor: 1024 ** 5 },
];

export default function DataStorageConverter() {
  const tool = getToolById('data-storage-converter') || {
    id: 'data-storage-converter',
    name: 'Data Storage Converter',
    description: 'Convert values between bits, bytes, megabytes, gigabytes, and terabytes in binary or decimal.',
    metaTitle: 'Data Storage Unit Converter | ToolNest',
    metaDescription: 'Convert storage units. Supports Bits, Bytes, KB, MB, GB, TB, and PB in both base-2 (1024) and base-10 (1000) formats.',
    category: 'calculator',
  };

  const [value, setValue] = useState('1');
  const [sourceUnit, setSourceUnit] = useState('GB');
  const [system, setSystem] = useState<'binary' | 'decimal'>('binary');

  const conversions = useMemo(() => {
    const inputNum = Number(value);
    if (isNaN(inputNum) || inputNum <= 0) return [];

    const sourceDef = UNITS.find((u) => u.id === sourceUnit)!;
    const factorKey = system === 'decimal' ? 'decimalFactor' : 'binaryFactor';

    // Convert input to bytes first
    const bytesVal = inputNum * sourceDef[factorKey];

    // Compute conversions to all units
    return UNITS.map((target) => {
      const result = bytesVal / target[factorKey];

      // Format output nicely
      let formatted = '';
      if (result < 0.000001) {
        formatted = result.toExponential(4);
      } else if (result % 1 === 0) {
        formatted = result.toLocaleString();
      } else {
        // limit decimals
        formatted = Number(result.toFixed(6)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        });
      }

      return {
        ...target,
        value: result,
        formatted,
      };
    });
  }, [value, sourceUnit, system]);

  return (
    <ToolLayout tool={tool as any} resultVisible={conversions.length > 0}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
          <h3 className="font-semibold text-base mb-2 font-medium">Inputs</h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Standard Standard</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={system === 'binary' ? 'default' : 'outline'}
                onClick={() => setSystem('binary')}
                className="w-full text-xs"
              >
                Binary (Base 2)
              </Button>
              <Button
                type="button"
                variant={system === 'decimal' ? 'default' : 'outline'}
                onClick={() => setSystem('decimal')}
                className="w-full text-xs"
              >
                Decimal (Base 10)
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              {system === 'binary'
                ? 'Base-2 (1024): 1 KB = 1024 Bytes. Standard for RAM, operating systems (Windows).'
                : 'Base-10 (1000): 1 KB = 1000 Bytes. Standard for storage manufacturers (HDDs, SSDs, macOS).'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Value to Convert</label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} min="0" step="any" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Source Unit</label>
              <Select value={sourceUnit} onValueChange={setSourceUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-muted-foreground">Equivalent Sizing Results</span>
          {conversions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conversions.map((target) => (
                <div
                  key={target.id}
                  className={`rounded-xl border bg-card p-4 flex justify-between items-center shadow-sm ${
                    target.id === sourceUnit ? 'border-primary ring-1 ring-primary/30' : ''
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {target.name}
                    </span>
                    <p className="text-base font-extrabold mt-1 text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                      {target.formatted}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted border">
                    {target.symbol.split(' / ')[system === 'binary' && target.symbol.includes('/') ? 1 : 0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <Database className="w-12 h-12 mb-3 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-semibold text-base mb-1">Enter Sizing Metric</h3>
              <p className="text-sm max-w-md">
                Input your storage values and select a source unit to calculate base-2/base-10 conversions.
              </p>
            </div>
          )}

          {/* Info block */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Binary vs. Decimal Standard Notation</p>
              <p>
                Operating systems and RAM manufacturers utilize binary notation (e.g. Kibibytes `KiB`, Mebibytes `MiB`, etc.) where multipliers are factors of 1024 (2^10). However, network transmission capacities and physical hard drive vendors define standard metrics using decimal prefixes (Kilobytes `KB`, Megabytes `MB`, etc.) where multipliers are factors of 1000 (10^3). This explains why a "1 TB" drive appears as "~931 GB" on Windows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
