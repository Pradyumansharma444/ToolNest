import { useState, useMemo } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function LoanCalculator() {
  const tool = getToolById('loan-calculator')!;
  const { toast } = useToast();
  const [amount, setAmount] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [showSchedule, setShowSchedule] = useState(false);
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const emi = useMemo(() => {
    const P = amount;
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [amount, rate, years]);

  const totalPayment = emi * years * 12;
  const totalInterest = totalPayment - amount;

  const schedule = useMemo(() => {
    const result: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let balance = amount;
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      result.push({
        month: i,
        payment: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance,
      });
    }

    return result;
  }, [amount, rate, years, emi]);

  const downloadSchedule = () => {
    const csv = [
      'Month,Payment,Principal,Interest,Balance',
      ...schedule.map(s => `${s.month},${s.payment.toFixed(2)},${s.principal.toFixed(2)},${s.interest.toFixed(2)},${s.balance.toFixed(2)}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization-schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Schedule downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="max-w-[250px] bg-card p-4 rounded-xl border">
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Loan Amount</span>
              <span>{formatCurrency(amount, currency)}</span>
            </div>
            <Slider value={[amount]} onValueChange={(v) => setAmount(v[0])} min={10000} max={2000000} step={5000} className="mt-2" />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Interest Rate</span>
              <span>{rate}%</span>
            </div>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0.1} max={20} step={0.1} className="mt-2" />
          </div>

          {/* Loan Term */}
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Loan Term</span>
              <span>{years} years</span>
            </div>
            <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={1} max={40} step={1} className="mt-2" />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{formatCurrency(Math.round(emi), currency)}</p>
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-lg font-bold">{formatCurrency(Math.round(totalPayment), currency)}</p>
            <p className="text-xs text-muted-foreground">Total Payment</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-lg font-bold text-red-500">{formatCurrency(Math.round(totalInterest), currency)}</p>
            <p className="text-xs text-muted-foreground">Total Interest</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-lg font-bold">{(totalInterest / amount * 100).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Interest Ratio</p>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)}>
            {showSchedule ? 'Hide' : 'Show'} Amortization Schedule
          </Button>
          {showSchedule && (
            <Button variant="outline" onClick={downloadSchedule}>
              <Download className="w-4 h-4 mr-1" /> Download CSV
            </Button>
          )}
        </div>

        {showSchedule && (
          <div className="rounded-xl border bg-card max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-right">Payment</th>
                  <th className="px-3 py-2 text-right">Principal</th>
                  <th className="px-3 py-2 text-right">Interest</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedule.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="px-3 py-1.5">{s.month}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrencyFixed(s.payment, currency, 2)}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-600">{formatCurrencyFixed(s.principal, currency, 2)}</td>
                    <td className="px-3 py-1.5 text-right text-red-500">{formatCurrencyFixed(s.interest, currency, 2)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrencyFixed(s.balance, currency, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
