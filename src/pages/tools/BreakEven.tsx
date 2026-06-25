import { useState, useMemo } from 'react';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function BreakEven() {
  const tool = getToolById('break-even')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [fixedCosts, setFixedCosts] = useState('50000');
  const [variableCost, setVariableCost] = useState('15');
  const [price, setPrice] = useState('40');

  const results = useMemo(() => {
    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCost) || 0;
    const p = parseFloat(price) || 0;
    const contribution = p - vc;
    const beUnits = contribution > 0 ? Math.ceil(fc / contribution) : 0;
    const beRevenue = beUnits * p;
    return { fc, vc, p, contribution, beUnits, beRevenue };
  }, [fixedCosts, variableCost, price]);

  const maxDisplay = Math.max(results.beUnits * 1.5, 100);
  const step = Math.max(1, Math.floor(maxDisplay / 10));

  const chartData = useMemo(() => {
    const points = [];
    for (let u = 0; u <= maxDisplay; u += step) {
      const revenue = u * results.p;
      const cost = results.fc + u * results.vc;
      points.push({ units: u, revenue, cost });
    }
    return points;
  }, [maxDisplay, step, results.p, results.fc, results.vc]);

  const intersectAt = chartData.find(p => p.revenue >= p.cost);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Business Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl border mb-2">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </div>
            <div>
              <Label>Fixed Costs ({sym})</Label>
              <Input type="number" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} placeholder="50000" />
              <p className="text-xs text-muted-foreground mt-1">Rent, salaries, insurance, etc.</p>
            </div>
            <div>
              <Label>Variable Cost per Unit ({sym})</Label>
              <Input type="number" value={variableCost} onChange={e => setVariableCost(e.target.value)} placeholder="15" />
              <p className="text-xs text-muted-foreground mt-1">Materials, labor per unit</p>
            </div>
            <div>
              <Label>Price per Unit ({sym})</Label>
              <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="40" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Break-Even Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-2xl font-bold">{results.beUnits}</p>
                  <p className="text-xs text-muted-foreground">Break-Even Units</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <p className="text-2xl font-bold">{formatCurrency(results.beRevenue, currency)}</p>
                  <p className="text-xs text-muted-foreground">Break-Even Revenue</p>
                </div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-2xl font-bold">{formatCurrencyFixed(results.contribution, currency, 2)}</p>
                <p className="text-xs text-muted-foreground">Contribution Margin per Unit</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Chart</CardTitle></CardHeader>
            <CardContent>
              <div className="relative h-48 border-b border-l">
                <svg viewBox={`0 0 ${maxDisplay + 20} ${Math.max(...chartData.map(p => Math.max(p.revenue, p.cost)), 100) * 1.1}`} className="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    points={chartData.map(p => `${p.units},${p.revenue}`).join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    points={chartData.map(p => `${p.units},${p.cost}`).join(' ')}
                  />
                  {intersectAt && (
                    <circle cx={intersectAt.units} cy={intersectAt.revenue} r="4" fill="#3b82f6" />
                  )}
                </svg>
              </div>
              <div className="flex justify-center gap-6 text-xs mt-2">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> Revenue</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Cost</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full inline-block" /> Break-Even</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}
