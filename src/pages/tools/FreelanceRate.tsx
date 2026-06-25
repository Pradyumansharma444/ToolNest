import { useState, useMemo } from 'react';
import { DollarSign, Percent, Clock } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function FreelanceRate() {
  const tool = getToolById('freelance-rate')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  // Inputs state
  const [netIncome, setNetIncome] = useState<string>('75000');
  const [expenses, setExpenses] = useState<string>('12000');
  const [taxRate, setTaxRate] = useState<number>(25);

  const [vacationWeeks, setVacationWeeks] = useState<number>(4);
  const [sickDays, setSickDays] = useState<number>(10);
  const [billableHours, setBillableHours] = useState<number>(25); // out of 40

  // Calculations
  const calculatedRates = useMemo(() => {
    const net = parseFloat(netIncome) || 0;
    const exp = parseFloat(expenses) || 0;
    const tax = taxRate / 100;

    // Gross needed: Net = (Gross - Exp) * (1 - Tax) => Gross = Exp + Net / (1 - Tax)
    const grossNeeded = exp + (tax === 1 ? net : net / (1 - tax));
    const taxPaid = grossNeeded - net - exp;

    // Working weeks & days
    const workingWeeks = 52 - vacationWeeks;
    // Total working days per year (assuming 5-day work weeks, subtract sick days)
    const workingDays = Math.max(0, workingWeeks * 5 - sickDays);
    
    // Average daily hours = weekly billable hours / 5
    const dailyHours = billableHours / 5;
    
    // Total billable hours per year
    const totalBillableHours = Math.max(0, workingDays * dailyHours);

    // Rates
    const hourlyRate = totalBillableHours > 0 ? grossNeeded / totalBillableHours : 0;
    const dailyRate = hourlyRate * dailyHours;

    // Percentages for chart visualization
    const netPct = grossNeeded > 0 ? (net / grossNeeded) * 100 : 0;
    const expPct = grossNeeded > 0 ? (exp / grossNeeded) * 100 : 0;
    const taxPct = grossNeeded > 0 ? (taxPaid / grossNeeded) * 100 : 0;

    return {
      grossNeeded,
      taxPaid,
      totalBillableHours,
      workingWeeks,
      workingDays,
      hourlyRate,
      dailyRate,
      netPct,
      expPct,
      taxPct,
    };
  }, [netIncome, expenses, taxRate, vacationWeeks, sickDays, billableHours]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Sidebar */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </CardContent>
          </Card>

          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                1. Financial Targets
              </CardTitle>
              <CardDescription>
                Specify your desired take-home income, business bills, and estimated self-employed taxes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="net-income">Desired Annual Net Income ({sym})</Label>
                  <div className="relative">
                    <span className="w-4 h-4 absolute left-3 top-3 text-muted-foreground flex items-center justify-center font-bold text-xs">{sym}</span>
                    <Input
                      id="net-income"
                      type="number"
                      value={netIncome}
                      onChange={(e) => setNetIncome(e.target.value)}
                      placeholder="e.g. 70000"
                      className="pl-8 font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="annual-expenses">Annual Business Expenses ({sym})</Label>
                  <div className="relative">
                    <span className="w-4 h-4 absolute left-3 top-3 text-muted-foreground flex items-center justify-center font-bold text-xs">{sym}</span>
                    <Input
                      id="annual-expenses"
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      placeholder="e.g. 8000"
                      className="pl-8 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Rate Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <Label htmlFor="tax-rate-slider">Estimated Tax Rate</Label>
                  <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Percent className="w-3 h-3" /> {taxRate}%
                  </span>
                </div>
                <Slider
                  id="tax-rate-slider"
                  value={[taxRate]}
                  onValueChange={(val) => setTaxRate(val[0]!)}
                  min={0}
                  max={50}
                  step={1}
                  className="py-1"
                />
                <p className="text-[10px] text-muted-foreground">
                  Includes federal, state, and self-employment taxes (national averages for freelancers is 20-30%).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                2. Work-Life Balance & Hours
              </CardTitle>
              <CardDescription>
                Account for unpaid time off and administrative non-billable overhead.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vacation Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label htmlFor="vacation-slider">Vacation Time Off</Label>
                    <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                      {vacationWeeks} weeks/yr
                    </span>
                  </div>
                  <Slider
                    id="vacation-slider"
                    value={[vacationWeeks]}
                    onValueChange={(val) => setVacationWeeks(val[0]!)}
                    min={0}
                    max={10}
                    step={1}
                    className="py-1"
                  />
                </div>

                {/* Sick Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label htmlFor="sick-slider">Sick & Holidays</Label>
                    <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                      {sickDays} days/yr
                    </span>
                  </div>
                  <Slider
                    id="sick-slider"
                    value={[sickDays]}
                    onValueChange={(val) => setSickDays(val[0]!)}
                    min={0}
                    max={30}
                    step={1}
                    className="py-1"
                  />
                </div>
              </div>

              {/* Billable Hours */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Billable Hours per Week
                  </span>
                  <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                    {billableHours} hours
                  </span>
                </div>
                <Slider
                  value={[billableHours]}
                  onValueChange={(val) => setBillableHours(val[0]!)}
                  min={5}
                  max={40}
                  step={1}
                  className="py-1"
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  How many hours per week do you actually bill clients? The other 10-15 hours are typically spent on sales, invoicing, bookkeeping, and client acquisitions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Output Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rate Output Display */}
          <Card className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-3 border-b border-indigo-500/10">
              <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                Calculated Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="space-y-4">
                {/* Hourly Rate */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Recommended Hourly Rate</span>
                  <div className="text-4xl font-black tracking-tight text-foreground">
                    {formatCurrencyFixed(calculatedRates.hourlyRate, currency, 2)}
                    <span className="text-sm font-semibold text-muted-foreground ml-1">/ hour</span>
                  </div>
                </div>

                {/* Daily Rate */}
                <div className="space-y-1 border-t pt-3">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Equivalent Daily Rate</span>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {formatCurrencyFixed(calculatedRates.dailyRate, currency, 2)}
                    <span className="text-xs font-semibold text-muted-foreground ml-1">/ day</span>
                  </div>
                </div>
              </div>

              {/* Stacked Bar Representation */}
              {calculatedRates.grossNeeded > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Gross Revenue Allocation</span>
                  
                  {/* Visual segment bar */}
                  <div className="w-full h-5 rounded-full overflow-hidden flex bg-muted shadow-inner">
                    <div
                      style={{ width: `${calculatedRates.netPct}%` }}
                      className="bg-emerald-500 hover:brightness-105 transition-all"
                      title={`Net Income: ${calculatedRates.netPct.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${calculatedRates.expPct}%` }}
                      className="bg-amber-500 hover:brightness-105 transition-all"
                      title={`Overhead Expenses: ${calculatedRates.expPct.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${calculatedRates.taxPct}%` }}
                      className="bg-red-500 hover:brightness-105 transition-all"
                      title={`Estimated Tax: ${calculatedRates.taxPct.toFixed(1)}%`}
                    />
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase tracking-wider pt-1">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Net ({calculatedRates.netPct.toFixed(0)}%)
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="w-2 h-2 bg-amber-500 rounded-full" /> Overhead ({calculatedRates.expPct.toFixed(0)}%)
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <span className="w-2 h-2 bg-red-500 rounded-full" /> Taxes ({calculatedRates.taxPct.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settle breakdown stats */}
          <Card className="border-muted bg-card/40">
            <CardHeader className="pb-3 border-b flex-row justify-between items-center space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Detailed Ledger Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Gross annual revenue needed:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(calculatedRates.grossNeeded, currency)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Self-employed tax burden:</span>
                  <span className="font-bold text-red-500 font-mono">
                    -{formatCurrency(calculatedRates.taxPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Business overhead expenses:</span>
                  <span className="font-bold text-amber-500 font-mono">
                    -{formatCurrency(parseFloat(expenses || '0'), currency)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground font-semibold text-indigo-600 dark:text-indigo-400">Net take-home profit:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(parseFloat(netIncome || '0'), currency)}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Working weeks per year:</span>
                  <span className="font-bold text-foreground font-mono">{calculatedRates.workingWeeks} weeks</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Billable days per year:</span>
                  <span className="font-bold text-foreground font-mono">{calculatedRates.workingDays} days</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-muted-foreground">Total billable hours per year:</span>
                  <span className="font-bold text-foreground font-mono">{calculatedRates.totalBillableHours.toFixed(0)} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

