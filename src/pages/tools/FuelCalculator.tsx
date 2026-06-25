import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

export default function FuelCalculator() {
  const tool = getToolById('fuel-calculator')!;

  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [price, setPrice] = useState('');

  const [result, setResult] = useState<{
    fuelNeeded: number;
    tripCost: number;
    annualCost: number;
  } | null>(null);

  // Compute fuel cost math
  const handleCalculate = () => {
    const dist = parseFloat(distance);
    const eff = parseFloat(efficiency);
    const prc = parseFloat(price);

    if (isNaN(dist) || isNaN(eff) || isNaN(prc)) return;

    // Assuming efficiency in km/L or MPG
    // L per 100km or simple miles/gallon
    const fuelNeeded = dist / eff;
    const tripCost = fuelNeeded * prc;

    // Annual estimation based on driving 15000 miles/km per year
    const annualCost = (15000 / eff) * prc;

    setResult({
      fuelNeeded,
      tripCost,
      annualCost,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-2xl border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Trip Distance (mi/km)</label>
            <Input
              type="number"
              placeholder="e.g. 350"
              className="py-5 rounded-xl font-bold"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Fuel Efficiency (mpg / km/L)</label>
            <Input
              type="number"
              placeholder="e.g. 25"
              className="py-5 rounded-xl font-bold"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Fuel Price per gallon/liter</label>
            <Input
              type="number"
              placeholder="e.g. 3.50"
              className="py-5 rounded-xl font-bold"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Calculation results */}
        {result && (
          <div className="rounded-2xl border bg-card p-5 space-y-3 animate-fade-in text-sm font-mono">
            <h4 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2">Trip Projections</h4>
            <div className="flex justify-between border-b pb-1">
              <span>Total Fuel Required</span>
              <span className="font-bold">{result.fuelNeeded.toFixed(2)} units</span>
            </div>
            <div className="flex justify-between border-b pb-1 text-primary text-base font-black">
              <span>Estimated Trip Cost</span>
              <span>${result.tripCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-muted-foreground text-xs">
              <span>Projected Yearly Fuel Cost (15k units)</span>
              <span className="font-semibold text-foreground">${result.annualCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} disabled={!distance || !efficiency || !price} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Calculate Fuel Expenses
        </Button>
      </div>
    </ToolLayout>
  );
}
