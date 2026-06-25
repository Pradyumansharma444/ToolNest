import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function TipCalculator() {
  const tool = getToolById('tip-calculator')!;
  const [bill, setBill] = useState(100);
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState(1);
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  const perPerson = totalAmount / people;

  const presets = [10, 15, 18, 20, 25];

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="max-w-[250px] bg-card p-4 rounded-xl border">
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-6">
          {/* Bill */}
          <div>
            <label className="text-sm font-medium">Bill Amount ({sym})</label>
            <Input
              type="number"
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              min={0}
              step={0.01}
              className="text-lg"
            />
          </div>

          {/* Tip % */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Tip: {tipPercent}%</span>
              <span className="text-muted-foreground">{formatCurrencyFixed(tipAmount, currency, 2)}</span>
            </div>
            <Slider value={[tipPercent]} onValueChange={(v) => setTipPercent(v[0])} min={0} max={50} step={1} />
            <div className="flex gap-2 mt-2">
              {presets.map(p => (
                <Button key={p} variant={tipPercent === p ? 'default' : 'outline'} size="sm" onClick={() => setTipPercent(p)}>
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          {/* People */}
          <div>
            <label className="text-sm font-medium">Number of People: {people}</label>
            <Slider value={[people]} onValueChange={(v) => setPeople(v[0])} min={1} max={50} step={1} />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">Tip Amount</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyFixed(tipAmount, currency, 2)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatCurrencyFixed(totalAmount, currency, 2)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center col-span-2">
            <p className="text-xs text-muted-foreground">Per Person ({people} {people === 1 ? 'person' : 'people'})</p>
            <p className="text-3xl font-bold text-primary">{formatCurrencyFixed(perPerson, currency, 2)}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
