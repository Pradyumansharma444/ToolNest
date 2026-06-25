import { useState, useMemo } from 'react';
import { Info, FileText, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import type { Tool } from '@/types';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

interface SipYearlyBreakdown {
  year: number;
  invested: number;
  returns: number;
  balance: number;
}

export default function SipCalculator() {
  const tool = getToolById('sip-calculator') || {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    description: 'Calculate the future value of your monthly Systematic Investment Plan (SIP) investments.',
    metaTitle: 'SIP Calculator - Mutual Funds & Recurring Investments | ToolNest',
    metaDescription: 'Calculate maturity value of monthly SIP plans, compare total invested capital against growth returns, and view schedule tables.',
    category: 'finance',
  };

  const [monthlyInvest, setMonthlyInvest] = useState('500');
  const [expectedRate, setExpectedRate] = useState('12');
  const [years, setYears] = useState('10');
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const calculation = useMemo(() => {
    const p = Number(monthlyInvest);
    const r = Number(expectedRate);
    const t = Number(years);

    if (!p || isNaN(p) || p <= 0 || !r || isNaN(r) || r < 0 || !t || isNaN(t) || t <= 0) {
      return null;
    }

    const monthlyRate = (r / 12) / 100;
    const totalMonths = t * 12;

    let maturityValue = 0;
    if (monthlyRate === 0) {
      maturityValue = p * totalMonths;
    } else {
      maturityValue = p * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    }

    const totalInvested = p * totalMonths;
    const estReturns = maturityValue - totalInvested;

    const breakdown: SipYearlyBreakdown[] = [];
    for (let y = 1; y <= t; y++) {
      const monthsElapsed = y * 12;
      const yearInvested = p * monthsElapsed;
      let yearMaturity = 0;

      if (monthlyRate === 0) {
        yearMaturity = yearInvested;
      } else {
        yearMaturity = p * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) * (1 + monthlyRate);
      }

      breakdown.push({
        year: y,
        invested: Math.round(yearInvested),
        returns: Math.round(Math.max(0, yearMaturity - yearInvested)),
        balance: Math.round(yearMaturity),
      });
    }

    return {
      totalInvested: Math.round(totalInvested),
      returns: Math.round(estReturns),
      totalValue: Math.round(maturityValue),
      breakdown,
    };
  }, [monthlyInvest, expectedRate, years]);

  const sym = currency.symbol;

  return (
    <ToolLayout tool={tool as Tool} resultVisible={!!calculation}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">SIP Specs</h3>

          <CurrencySelector value={currency} onChange={handleCurrencyChange} />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Monthly Investment ({sym})</label>
              <Input
                type="number"
                placeholder="500"
                value={monthlyInvest}
                onChange={(e) => setMonthlyInvest(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Expected Return Rate (% p.a.)</label>
              <Input
                type="number"
                placeholder="12"
                value={expectedRate}
                onChange={(e) => setExpectedRate(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Investment Period (Years)</label>
              <Input
                type="number"
                placeholder="10"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {calculation ? (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Total Invested
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-muted-foreground">
                    {formatCurrency(calculation.totalInvested, currency)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Est. Wealth Gain
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-500">
                    +{formatCurrency(calculation.returns, currency)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Maturity Value
                  </span>
                  <p className="text-lg md:text-xl font-extrabold mt-1 text-primary">
                    {formatCurrency(calculation.totalValue, currency)}
                  </p>
                </div>
              </div>

              {/* Progress ratio visualization */}
              <div className="rounded-xl border bg-card p-4 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Investment Ratio</span>
                  <span>
                    Invested: {Math.round((calculation.totalInvested / calculation.totalValue) * 100)}% | Returns:{' '}
                    {Math.round((calculation.returns / calculation.totalValue) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-emerald-400 dark:bg-emerald-500 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-600"
                    style={{ width: `${(calculation.totalInvested / calculation.totalValue) * 100}%` }}
                  />
                </div>
              </div>

              {/* Yearly Table Breakdown */}
              <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Year-on-Year SIP Amortization
                </h4>
                <div className="max-h-60 overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b text-muted-foreground font-semibold">
                        <th className="py-2">Year</th>
                        <th className="py-2 text-right">Invested Capital</th>
                        <th className="py-2 text-right">Accumulated Gain</th>
                        <th className="py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {calculation.breakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-muted/30">
                          <td className="py-2 text-foreground font-semibold">Year {row.year}</td>
                          <td className="py-2 text-right text-muted-foreground">
                            {formatCurrency(row.invested, currency)}
                          </td>
                          <td className="py-2 text-right text-emerald-600 dark:text-emerald-500 font-medium">
                            +{formatCurrency(row.returns, currency)}
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
              <TrendingUp className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Set SIP Investment Criteria</h3>
              <p className="text-sm max-w-md">
                Configure your monthly budget allocation and return rate expectations to estimate future mutual fund portfolio value.
              </p>
            </div>
          )}

          {/* Info block */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Power of Compounding in SIP</p>
              <p>
                A Systematic Investment Plan (SIP) leverages rupee cost averaging and compound growth. By investing a fixed amount regularly, you purchase more units when prices are low and fewer units when prices are high. Over longer horizons, the accumulated returns begin earning their own interest, generating substantial wealth expansion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
