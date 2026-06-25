import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function OhmsLaw() {
  const tool = getToolById('ohms-law')!;
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');
  const [locked, setLocked] = useState<Set<string>>(new Set());

  const toggleLock = (field: string) => {
    setLocked(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const fields = useMemo(() => {
    const v = parseFloat(voltage);
    const i = parseFloat(current);
    const r = parseFloat(resistance);
    const p = parseFloat(power);
    const defined = [['V', v, !isNaN(v)], ['I', i, !isNaN(i)], ['R', r, !isNaN(r)], ['P', p, !isNaN(p)]].filter(([, , d]) => d).length;
    if (defined < 2) return { V: '', I: '', R: '', P: '' };

    const known = new Map<string, number>();
    if (!isNaN(v)) known.set('V', v);
    if (!isNaN(i)) known.set('I', i);
    if (!isNaN(r)) known.set('R', r);
    if (!isNaN(p)) known.set('P', p);

    let V = known.get('V');
    let I = known.get('I');
    let R = known.get('R');
    let P = known.get('P');

    if (V !== undefined && I !== undefined) { R = V / I; P = V * I; }
    else if (V !== undefined && R !== undefined) { I = V / R; P = V * V / R; }
    else if (V !== undefined && P !== undefined) { I = P / V; R = V * V / P; }
    else if (I !== undefined && R !== undefined) { V = I * R; P = I * I * R; }
    else if (I !== undefined && P !== undefined) { V = P / I; R = P / (I * I); }
    else if (R !== undefined && P !== undefined) { V = Math.sqrt(P * R); I = Math.sqrt(P / R); }

    return {
      V: V !== undefined ? V.toFixed(4) : '',
      I: I !== undefined ? I.toFixed(4) : '',
      R: R !== undefined ? R.toFixed(4) : '',
      P: P !== undefined ? P.toFixed(4) : '',
    };
  }, [voltage, current, resistance, power]);

  const handleChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Voltage (V)', symbol: 'V', value: voltage, setter: setVoltage, result: fields.V, unit: 'V' },
            { label: 'Current (I)', symbol: 'I', value: current, setter: setCurrent, result: fields.I, unit: 'A' },
            { label: 'Resistance (R)', symbol: 'R', value: resistance, setter: setResistance, result: fields.R, unit: 'Ω' },
            { label: 'Power (P)', symbol: 'P', value: power, setter: setPower, result: fields.P, unit: 'W' },
          ].map((f) => (
            <div key={f.symbol} className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{f.label}</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className={locked.has(f.symbol) ? 'text-primary' : 'text-muted-foreground'}
                  onClick={() => toggleLock(f.symbol)}
                >
                  {locked.has(f.symbol) ? '🔒' : '🔓'}
                </Button>
              </div>
              <Input
                type="number"
                value={f.value}
                onChange={(e) => handleChange(f.symbol, e.target.value, f.setter)}
                placeholder={f.symbol}
                disabled={locked.has(f.symbol)}
              />
              {f.result && (
                <p className="text-lg font-bold text-primary">
                  {f.result} {f.unit}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-4 text-center text-sm text-muted-foreground">
          <Calculator className="w-5 h-5 inline mr-2" />
          Enter any 2 values to calculate the rest. Click 🔒 to lock a field.
        </div>
      </div>
    </ToolLayout>
  );
}
