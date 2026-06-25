import { useState, useMemo } from 'react';
import { Info, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import type { Tool } from '@/types';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

export default function RoiCalculator() {
  const tool = getToolById('roi-calculator') || {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Calculate Return on Investment (ROI), net profit, and annualized return rate.',
    metaTitle: 'ROI Calculator - Return on Investment | ToolNest',
    metaDescription: 'Calculate investment profitability. Compiles ROI percentage, net profit yield, and compound annualized rates.',
    category: 'finance',
  };

  const [initialCost, setInitialCost] = useState('5000');
  const [finalValue, setFinalValue] = useState('7500');
  const [period, setPeriod] = useState('3'); // Years
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const calculations = useMemo(() => {
    const cost = Number(initialCost);
    const value = Number(finalValue);
    const years = Number(period) || 1;

    if (!cost || cost <= 0 || isNaN(value) || years <= 0) {
      return null;
    }

    const netProfit = value - cost;
    const roiPercent = (netProfit / cost) * 100;

    // Annualized ROI = ((Final / Initial) ^ (1 / Years) - 1) * 100
    const ratio = value / cost;
    const annualizedRoi = (Math.pow(ratio, 1 / years) - 1) * 100;

    return {
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roiPercent * 100) / 100,
      annualized: Math.round(annualizedRoi * 100) / 100,
      multiplier: Math.round(ratio * 100) / 100,
      isProfit: netProfit >= 0,
    };
  }, [initialCost, finalValue, period]);

  return (
    <ToolLayout tool={tool as Tool} resultVisible={!!calculations}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">Investment Values</h3>

          <CurrencySelector value={currency} onChange={handleCurrencyChange} className="mb-2" />

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Initial Cost / Invested Amount ({sym})</label>
              <Input
                type="number"
                placeholder="5000"
                value={initialCost}
                onChange={(e) => setInitialCost(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Final Value / Total Returned ({sym})</label>
              <Input
                type="number"
                placeholder="7500"
                value={finalValue}
                onChange={(e) => setFinalValue(e.target.value)}
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Holding Period (Years)</label>
              <Input
                type="number"
                placeholder="3"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                min="0.1"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {calculations ? (
            <div className="space-y-6">
              {/* ROI and Net Profit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Return on Investment (ROI)
                  </span>
                  <p
                    className={`text-3xl md:text-4xl font-extrabold mt-2 ${
                      calculations.isProfit ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {calculations.isProfit ? '+' : ''}
                    {calculations.roi}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total return relative to investment cost
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Net Profit / Loss
                  </span>
                  <p
                    className={`text-3xl md:text-4xl font-extrabold mt-2 ${
                      calculations.isProfit ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {calculations.isProfit ? '+' : ''}{formatCurrency(calculations.netProfit, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Value change of initial capital
                  </p>
                </div>
              </div>

              {/* Extra Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Annualized ROI (CAGR)
                  </span>
                  <p className="text-lg md:text-xl font-bold mt-1 text-primary">
                    {calculations.annualized}% / Year
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Return Multiplier
                  </span>
                  <p className="text-lg md:text-xl font-bold mt-1 text-muted-foreground">
                    {calculations.multiplier}x
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <TrendingUp className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Calculate Investment ROI</h3>
              <p className="text-sm max-w-md">
                Enter your initial cost, current returns, and holding periods to see basic net profits, growth percentages, and annualized growth rates.
              </p>
            </div>
          )}

          {/* Info block */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">Understanding ROI Metrics</p>
              <p className="mb-2">
                - <span className="font-semibold text-foreground">Standard ROI</span> represents the overall growth efficiency, but it does not account for time. An investment returning 50% in 1 year is much better than one returning 50% over 10 years.
              </p>
              <p>
                - <span className="font-semibold text-foreground">Annualized ROI</span> (Compound Annual Growth Rate) factors in the time duration, computing a normalized annual return rate. This helps you compare investments held over different time periods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
