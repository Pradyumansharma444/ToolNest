import { useState, useMemo } from 'react';
import { Home, TrendingUp, Calendar } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, type Currency } from '@/lib/currencies';

export default function RentVsBuy() {
  const tool = getToolById('rent-vs-buy')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [homePrice, setHomePrice] = useState('350000');
  const [downPayment, setDownPayment] = useState('70000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [propertyTax, setPropertyTax] = useState('1.2');
  const [maintenance, setMaintenance] = useState('1');
  const [monthlyRent, setMonthlyRent] = useState('1800');
  const [rentIncrease, setRentIncrease] = useState('3');
  const [years, setYears] = useState('10');

  const results = useMemo(() => {
    const hp = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const ir = (parseFloat(interestRate) || 0) / 100 / 12;
    const pt = (parseFloat(propertyTax) || 0) / 100;
    const mt = (parseFloat(maintenance) || 0) / 100;
    const rent = parseFloat(monthlyRent) || 0;
    const ri = (parseFloat(rentIncrease) || 0) / 100;
    const yrs = parseFloat(years) || 1;
    const totalMonths = yrs * 12;

    const loanAmount = hp - dp;
    const monthlyMortgage = loanAmount > 0 && ir > 0
      ? loanAmount * (ir * Math.pow(1 + ir, totalMonths)) / (Math.pow(1 + ir, totalMonths) - 1)
      : 0;

    const monthlyTax = (hp * pt) / 12;
    const monthlyMaint = (hp * mt) / 12;
    const monthlyBuyCost = monthlyMortgage + monthlyTax + monthlyMaint;

    let totalBuyCost = dp;
    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;

    for (let m = 1; m <= totalMonths; m++) {
      if (remainingBalance <= 0) break;
      const interestPayment = remainingBalance * ir;
      const principalPayment = monthlyMortgage - interestPayment;
      totalInterestPaid += interestPayment;
      remainingBalance -= principalPayment;
      totalBuyCost += monthlyTax + monthlyMaint;
    }
    totalBuyCost += totalInterestPaid;

    const equity = loanAmount - Math.max(0, remainingBalance);
    const homeValue = hp * Math.pow(1 + 0.03, yrs);
    const netWorthBuy = homeValue - Math.max(0, remainingBalance);

    let totalRentCost = 0;
    let currentRent = rent;
    for (let m = 1; m <= totalMonths; m++) {
      totalRentCost += currentRent;
      if (m % 12 === 0) currentRent *= (1 + ri);
    }

    let investedAtReturn = dp;
    for (let m = 1; m <= totalMonths; m++) {
      const diff = monthlyBuyCost - currentRent;
      if (diff > 0) {
        investedAtReturn += diff;
        investedAtReturn *= 1.05;
      }
      investedAtReturn *= 1.05;
    }

    return {
      monthlyMortgage,
      monthlyTax,
      monthlyMaint,
      monthlyBuyCost,
      totalBuyCost: Math.round(totalBuyCost),
      totalRentCost: Math.round(totalRentCost),
      netWorthBuy: Math.round(netWorthBuy),
      netWorthRent: Math.round(investedAtReturn),
      equity: Math.round(equity),
      buyBetter: totalBuyCost < totalRentCost,
      remainingBalance: Math.round(Math.max(0, remainingBalance)),
    };
  }, [homePrice, downPayment, interestRate, propertyTax, maintenance, monthlyRent, rentIncrease, years]);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-500" />
              Buying
            </h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Home Price ({sym})</Label>
                <Input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Down Payment ({sym})</Label>
                <Input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Interest Rate (%)</Label>
                <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Property Tax Rate (%)</Label>
                <Input type="number" step="0.1" value={propertyTax} onChange={e => setPropertyTax(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Maintenance (% of home value/year)</Label>
                <Input type="number" step="0.1" value={maintenance} onChange={e => setMaintenance(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Renting
            </h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Monthly Rent ({sym})</Label>
                <Input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Annual Rent Increase (%)</Label>
                <Input type="number" step="0.1" value={rentIncrease} onChange={e => setRentIncrease(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Timeframe
            </h3>
            <div>
              <Label className="text-xs">Number of Years</Label>
              <Input type="number" min="1" max="40" value={years} onChange={e => setYears(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-blue-500/5 border-blue-200/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold mb-1">
                <Home className="w-4 h-4" /> Buy Total Cost
              </div>
              <p className="text-2xl font-extrabold">{formatCurrency(results.totalBuyCost, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly: {formatCurrency(Math.round(results.monthlyBuyCost), currency)}
              </p>
            </div>
            <div className="rounded-xl border bg-amber-500/5 border-amber-200/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold mb-1">
                <TrendingUp className="w-4 h-4" /> Rent Total Cost
              </div>
              <p className="text-2xl font-extrabold">{formatCurrency(results.totalRentCost, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly: {formatCurrency(Math.round(parseFloat(monthlyRent) || 0), currency)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h4 className="font-semibold text-sm">Comparison Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Home Price</span>
                <span className="font-semibold">{formatCurrency(parseFloat(homePrice) || 0, currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-semibold">{formatCurrency((parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0), currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Equity Built</span>
                <span className="font-semibold text-emerald-500">{formatCurrency(results.equity, currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Remaining Balance</span>
                <span className="font-semibold">{formatCurrency(results.remainingBalance, currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Net Worth (Buy)</span>
                <span className="font-semibold text-blue-500">{formatCurrency(results.netWorthBuy, currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Net Worth (Rent + Invest)</span>
                <span className="font-semibold text-amber-500">{formatCurrency(results.netWorthRent, currency)}</span>
              </div>
            </div>

            <div className={`rounded-lg p-4 text-center font-bold text-sm ${
              results.buyBetter
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/30'
                : 'bg-amber-500/10 text-amber-600 border border-amber-200/30'
            }`}>
              {results.buyBetter
                ? 'Buying is more affordable over ' + years + ' years'
                : 'Renting is more affordable over ' + years + ' years'}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
