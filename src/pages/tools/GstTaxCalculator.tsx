import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function GstTaxCalculator() {
  const tool = getToolById('gst-tax-calculator')!;

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');
  const [taxMode, setTaxMode] = useState<'add' | 'remove'>('add');
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [result, setResult] = useState<{
    original: number;
    taxAmount: number;
    total: number;
    cgst?: number;
    sgst?: number;
  } | null>(null);

  // Calculate tax breakout
  const handleCalculate = () => {
    const amt = parseFloat(amount);
    const taxRate = parseFloat(rate);

    if (isNaN(amt) || isNaN(taxRate)) return;

    let original = 0;
    let taxAmount = 0;
    let total = 0;

    if (taxMode === 'add') {
      original = amt;
      taxAmount = (amt * taxRate) / 100;
      total = amt + taxAmount;
    } else {
      total = amt;
      original = amt / (1 + taxRate / 100);
      taxAmount = amt - original;
    }

    // Indian GST splits into CGST and SGST
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    setResult({
      original,
      taxAmount,
      total,
      cgst,
      sgst,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        {/* Currency selector */}
        <div className="max-w-[250px] bg-muted/40 p-4 rounded-2xl border">
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-2xl border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Base Bill Amount ({sym})</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              className="py-5 rounded-xl font-bold font-mono text-base"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Tax Rate (%)</label>
            <select
              className="w-full bg-background border rounded-xl py-2 px-3 text-sm focus:outline-none h-10 mt-1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            >
              <option value="5">5% (Utility)</option>
              <option value="12">12% (Standard)</option>
              <option value="18">18% (Standard Pro)</option>
              <option value="28">28% (Luxury)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Tax Calculation Mode</label>
            <div className="flex gap-1 bg-muted p-1 rounded-xl text-xs mt-1">
              <Button
                size="sm"
                variant={taxMode === 'add' ? 'default' : 'ghost'}
                className="flex-1 rounded-lg"
                onClick={() => setTaxMode('add')}
              >
                Add Tax (+)
              </Button>
              <Button
                size="sm"
                variant={taxMode === 'remove' ? 'default' : 'ghost'}
                className="flex-1 rounded-lg"
                onClick={() => setTaxMode('remove')}
              >
                Extract (-)
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Tax Input option */}
        {rate === 'custom' && (
          <div className="space-y-1 max-w-[150px] animate-fade-in">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Custom Percent</label>
            <Input
              type="number"
              placeholder="10"
              className="font-bold"
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
        )}

        {/* Result Breakdown table logs */}
        {result && (
          <div className="rounded-2xl border bg-card p-5 space-y-3 animate-fade-in text-sm">
            <h4 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2">Tax Invoice Summary</h4>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between border-b pb-1">
                <span>Original Net Amount</span>
                <span className="font-bold">{formatCurrencyFixed(result.original, currency, 2)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-emerald-500">
                <span>Total Tax Amount</span>
                <span className="font-bold">{formatCurrencyFixed(result.taxAmount, currency, 2)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 pl-4 text-xs text-muted-foreground">
                <span>Central GST (CGST 50%)</span>
                <span>{formatCurrencyFixed(result.cgst || 0, currency, 2)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 pl-4 text-xs text-muted-foreground">
                <span>State GST (SGST 50%)</span>
                <span>{formatCurrencyFixed(result.sgst || 0, currency, 2)}</span>
              </div>
              <div className="flex justify-between text-base text-primary font-black pt-1">
                <span>Gross Total Bill</span>
                <span>{formatCurrencyFixed(result.total, currency, 2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} disabled={!amount} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Calculate Tax Details
        </Button>
      </div>
    </ToolLayout>
  );
}
