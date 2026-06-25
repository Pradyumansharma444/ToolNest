import { useState, useMemo } from 'react';
import { TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

interface Inputs {
  currentAge: string;
  retireAge: string;
  savings: string;
  monthlyContribution: string;
  annualReturn: string;
}

export default function RetirementCalculator() {
  const tool = getToolById('retirement-calculator')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [inputs, setInputs] = useState<Inputs>({
    currentAge: '30',
    retireAge: '65',
    savings: '50000',
    monthlyContribution: '1000',
    annualReturn: '7',
  });

  const set = (key: keyof Inputs, value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const currentAge = Number(inputs.currentAge);
    const retireAge = Number(inputs.retireAge);
    const savings = Number(inputs.savings);
    const monthly = Number(inputs.monthlyContribution);
    const annualReturn = Number(inputs.annualReturn) / 100;
    const monthlyReturn = annualReturn / 12;

    if (!currentAge || !retireAge || retireAge <= currentAge || savings < 0 || monthly < 0) return null;

    const months = (retireAge - currentAge) * 12;
    let total = savings;
    for (let i = 0; i < months; i++) {
      total = total * (1 + monthlyReturn) + monthly;
    }

    const yearsToRetire = retireAge - currentAge;
    const totalContributions = savings + monthly * yearsToRetire * 12;
    const totalInterest = total - totalContributions;

    return {
      total: Math.round(total),
      contributions: Math.round(totalContributions),
      interest: Math.round(Math.max(0, totalInterest)),
      yearsToRetire,
    };
  }, [inputs]);

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="bg-muted/40 p-4 rounded-xl border mb-2">
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current Age</label>
              <Input type="number" value={inputs.currentAge} onChange={(e) => set('currentAge', e.target.value)} min="18" max="80" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Desired Retirement Age</label>
              <Input type="number" value={inputs.retireAge} onChange={(e) => set('retireAge', e.target.value)} min="30" max="100" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current Savings ({sym})</label>
              <Input type="number" value={inputs.savings} onChange={(e) => set('savings', e.target.value)} min="0" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Monthly Contribution ({sym})</label>
              <Input type="number" value={inputs.monthlyContribution} onChange={(e) => set('monthlyContribution', e.target.value)} min="0" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Expected Annual Return (%)</label>
              <Input type="number" value={inputs.annualReturn} onChange={(e) => set('annualReturn', e.target.value)} min="0" max="30" step="0.1" />
            </div>
          </div>
        </Card>

        {result && (
          <Card className="p-6 space-y-6">
            <div className="text-center">
              <PiggyBank className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-4xl font-bold text-emerald-600">{formatCurrency(result.total, currency)}</p>
              <p className="text-sm text-muted-foreground">Projected savings at retirement</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{result.yearsToRetire}</p>
                <p className="text-xs text-muted-foreground">Years to retirement</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <PiggyBank className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-lg font-bold">{formatCurrency(result.contributions, currency)}</p>
                <p className="text-xs text-muted-foreground">Total contributions</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <p className="text-lg font-bold">{formatCurrency(result.interest, currency)}</p>
                <p className="text-xs text-muted-foreground">Interest earned</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
