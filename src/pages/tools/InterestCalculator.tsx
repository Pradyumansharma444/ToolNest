import { useState, useMemo } from 'react';
import { Landmark, Info, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

interface YearlyBreakdown {
  year: number;
  interest: number;
  totalInterest: number;
  balance: number;
}

export default function InterestCalculator() {
  const tool = getToolById('interest-calculator') || {
    id: 'interest-calculator',
    name: 'Interest Calculator',
    description: 'Calculate simple and compound interest with configurable compounding frequencies and annual breakdowns.',
    metaTitle: 'Interest Calculator - Simple & Compound | ToolNest',
    metaDescription: 'Find interest returns on investments. Supports monthly, quarterly, and annual compound frequencies with complete tables.',
    category: 'finance',
  };

  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('6');
  const [years, setYears] = useState('5');
  const [type, setType] = useState<'simple' | 'compound'>('compound');
  const [frequency, setFrequency] = useState('1');
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const calculation = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    const n = Number(frequency);

    if (!p || isNaN(p) || p <= 0 || isNaN(r) || r < 0 || !t || isNaN(t) || t <= 0) {
      return null;
    }

    const breakdown: YearlyBreakdown[] = [];
    let totalValue = p;
    let totalInterest = 0;

    if (type === 'simple') {
      const annualInterest = p * r;
      for (let y = 1; y <= t; y++) {
        const yearInterest = annualInterest;
        totalInterest += yearInterest;
        breakdown.push({
          year: y,
          interest: Math.round(yearInterest),
          totalInterest: Math.round(totalInterest),
          balance: Math.round(p + totalInterest),
        });
      }
      totalValue = p + totalInterest;
    } else {
      let prevBalance = p;
      for (let y = 1; y <= t; y++) {
        const currentBalance = p * Math.pow(1 + r / n, n * y);
        const yearInterest = currentBalance - prevBalance;
        totalInterest += yearInterest;
        breakdown.push({
          year: y,
          interest: Math.round(yearInterest),
          totalInterest: Math.round(totalInterest),
          balance: Math.round(currentBalance),
        });
        prevBalance = currentBalance;
      }
      totalValue = prevBalance;
    }

    return {
      principal: Math.round(p),
      interest: Math.round(totalInterest),
      total: Math.round(totalValue),
      breakdown,
    };
  }, [principal, rate, years, type, frequency]);

  const sym = currency.symbol;

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={!!calculation}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">Parameters</h3>

          <CurrencySelector value={currency} onChange={handleCurrencyChange} />

          <div className="space-y-1">
            <label className="text-sm font-medium">Interest Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === 'compound' ? 'default' : 'outline'}
                onClick={() => setType('compound')}
                className="w-full text-xs"
              >
                Compound
              </Button>
              <Button
                type="button"
                variant={type === 'simple' ? 'default' : 'outline'}
                onClick={() => setType('simple')}
                className="w-full text-xs"
              >
                Simple
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Principal Amount ({sym})</label>
              <Input
                type="number"
                placeholder="10000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Annual Interest Rate (%)</label>
              <Input
                type="number"
                placeholder="6"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Duration (Years)</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min="1"
                />
              </div>

              {type === 'compound' && (
                <div>
                  <label className="text-sm font-medium">Compounding</label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Annually</SelectItem>
                      <SelectItem value="2">Semi-Annually</SelectItem>
                      <SelectItem value="4">Quarterly</SelectItem>
                      <SelectItem value="12">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {calculation ? (
            <div className="space-y-6">
              {/* Cards Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Invested
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-muted-foreground">
                    {formatCurrency(calculation.principal, currency)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Interest Earned
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-500">
                    +{formatCurrency(calculation.interest, currency)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Maturity Value
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-primary">
                    {formatCurrency(calculation.total, currency)}
                  </p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="rounded-xl border bg-card p-4 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Investment Ratio</span>
                  <span>
                    Invested: {Math.round((calculation.principal / calculation.total) * 100)}% | Earned:{' '}
                    {Math.round((calculation.interest / calculation.total) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-emerald-400 dark:bg-emerald-500 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-600"
                    style={{ width: `${(calculation.principal / calculation.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Amortization Table */}
              <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Year-on-Year Growth Schedule
                </h4>
                <div className="max-h-60 overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b text-muted-foreground font-semibold">
                        <th className="py-2">Year</th>
                        <th className="py-2 text-right">Interest Accrued</th>
                        <th className="py-2 text-right">Total Interest</th>
                        <th className="py-2 text-right">End Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {calculation.breakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-muted/30">
                          <td className="py-2 text-foreground font-semibold">Year {row.year}</td>
                          <td className="py-2 text-right text-emerald-600 dark:text-emerald-500 font-medium">
                            +{formatCurrency(row.interest, currency)}
                          </td>
                          <td className="py-2 text-right text-muted-foreground">
                            {formatCurrency(row.totalInterest, currency)}
                          </td>
                          <td className="py-2 text-right text-foreground font-semibold">
                            {formatCurrency(row.balance, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <Landmark className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Compute Interest Projections</h3>
              <p className="text-sm max-w-md">
                Input your principal size, annual yield rates, and investment terms to generate your interest timeline and schedule.
              </p>
            </div>
          )}

          {/* Info block */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Simple vs. Compound Interest</p>
              <p>
                Simple Interest calculates returns purely based on the initial principal value. Compound Interest, in contrast, applies rates to both the principal and any previously accumulated interest. This triggers exponential growth, particularly over long timeframes or with more frequent compounding intervals (e.g. monthly vs. annually).
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
