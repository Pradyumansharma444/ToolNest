import { useState, useMemo } from 'react';
import { Zap, Droplets, DollarSign } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function UtilityCostEstimator() {
  const tool = getToolById('utility-cost-estimator')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [elecUsage, setElecUsage] = useState('500');
  const [elecRate, setElecRate] = useState('0.12');
  const [waterUsage, setWaterUsage] = useState('3000');
  const [waterRate, setWaterRate] = useState('0.004');
  const [gasUsage, setGasUsage] = useState('50');
  const [gasRate, setGasRate] = useState('1.20');

  const results = useMemo(() => {
    const eu = parseFloat(elecUsage) || 0;
    const er = parseFloat(elecRate) || 0;
    const wu = parseFloat(waterUsage) || 0;
    const wr = parseFloat(waterRate) || 0;
    const gu = parseFloat(gasUsage) || 0;
    const gr = parseFloat(gasRate) || 0;

    const elecCost = eu * er;
    const waterCost = wu * wr;
    const gasCost = gu * gr;
    const total = elecCost + waterCost + gasCost;

    return {
      elecCost: Math.round(elecCost * 100) / 100,
      waterCost: Math.round(waterCost * 100) / 100,
      gasCost: Math.round(gasCost * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [elecUsage, elecRate, waterUsage, waterRate, gasUsage, gasRate]);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Electricity
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Monthly Usage (kWh)</Label>
                <Input
                  type="number"
                  value={elecUsage}
                  onChange={e => setElecUsage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Rate per kWh ({sym})</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={elecRate}
                  onChange={e => setElecRate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Rate: {sym}{elecRate}/kWh</Label>
                <Slider
                  value={[parseFloat(elecRate) * 100]}
                  onValueChange={v => setElecRate((v[0] / 100).toFixed(3))}
                  min={5}
                  max={40}
                  step={0.5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Water
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Monthly Usage (gallons)</Label>
                <Input
                  type="number"
                  value={waterUsage}
                  onChange={e => setWaterUsage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Rate per gallon ({sym})</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={waterRate}
                  onChange={e => setWaterRate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Natural Gas (optional)
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Monthly Usage (therms)</Label>
                <Input
                  type="number"
                  value={gasUsage}
                  onChange={e => setGasUsage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Rate per therm ({sym})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={gasRate}
                  onChange={e => setGasRate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border bg-emerald-500/5 border-emerald-200/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-2">
              <DollarSign className="w-5 h-5" />
              Estimated Monthly Total
            </div>
            <p className="text-3xl font-extrabold">{formatCurrencyFixed(results.total, currency, 2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your usage and local rates
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h4 className="font-semibold text-sm">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-200/10">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Electricity</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrencyFixed(results.elecCost, currency, 2)}</p>
                  <p className="text-xs text-muted-foreground">{elecUsage || 0} kWh</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-200/10">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Water</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrencyFixed(results.waterCost, currency, 2)}</p>
                  <p className="text-xs text-muted-foreground">{waterUsage || 0} gallons</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-200/10">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Natural Gas</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrencyFixed(results.gasCost, currency, 2)}</p>
                  <p className="text-xs text-muted-foreground">{gasUsage || 0} therms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
