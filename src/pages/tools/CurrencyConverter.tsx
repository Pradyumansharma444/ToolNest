import { useState, useEffect } from 'react';
import { Loader2, ArrowRightLeft, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { cn } from '@/lib/utils';

interface Rates {
  [key: string]: number;
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.5, CNY: 7.19, INR: 83.1,
  CAD: 1.35, AUD: 1.52, CHF: 0.88, HKD: 7.82, SGD: 1.34, KRW: 1330,
  MXN: 17.1, BRL: 4.97, ZAR: 18.9, SEK: 10.35, NOK: 10.55, NZD: 1.63,
  THB: 35.8, MYR: 4.76, PHP: 56.2, IDR: 15650, VND: 24500, TRY: 30.5,
  RUB: 92.5, PLN: 4.0, DKK: 6.88, AED: 3.67, SAR: 3.75,
};

export default function CurrencyConverter() {
  const tool = getToolById('currency-converter')!;

  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Dropdown UI states
  const [fromOpen, setFromOpen] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toOpen, setToOpen] = useState(false);
  const [toSearch, setToSearch] = useState('');

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    try {
      // Check cache
      const cached = localStorage.getItem('toolnest-rates');
      const cachedTime = localStorage.getItem('toolnest-rates-time');
      const oneHour = 60 * 60 * 1000;

      if (cached && cachedTime && Date.now() - Number(cachedTime) < oneHour) {
        setRates(JSON.parse(cached));
        setLastUpdated(new Date(Number(cachedTime)).toLocaleString());
        setLoading(false);
        return;
      }

      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();

      if (data.result === 'success') {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleString());
        localStorage.setItem('toolnest-rates', JSON.stringify(data.rates));
        localStorage.setItem('toolnest-rates-time', String(Date.now()));
      } else {
        throw new Error('API returned error');
      }
    } catch {
      setRates(FALLBACK_RATES);
      setLastUpdated('Using fallback rates');
    } finally {
      setLoading(false);
    }
  };

  const convert = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return 0;
    const inUSD = amount / rates[fromCurrency];
    return inUSD * rates[toCurrency];
  };

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const result = convert();
  const currencies = Object.keys(rates).sort();

  // Filter currencies lists for search
  const filteredFromCurrencies = currencies.filter(c =>
    c.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCurrencies = currencies.filter(c =>
    c.toLowerCase().includes(toSearch.toLowerCase())
  );

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">Rates last updated: {lastUpdated}</p>
        )}

        <div className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
          {/* Amount */}
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              step={0.01}
              className="text-lg mt-1 rounded-xl h-10 border-muted"
            />
          </div>

          {/* From / To */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            {/* From Selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium">From</label>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={fromOpen}
                    className="w-full justify-between font-normal text-left h-10 mt-1 rounded-xl border-muted"
                  >
                    <span className="truncate font-semibold">{fromCurrency}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-2xl shadow-xl z-50 bg-popover border">
                  <div className="relative flex items-center mb-1.5 border-b pb-1.5 px-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search currency..."
                      value={fromSearch}
                      onChange={(e) => setFromSearch(e.target.value)}
                      className="pl-8 h-9 border-none bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/60 rounded-lg"
                    />
                  </div>
                  <ScrollArea className="h-[200px] overflow-y-auto pr-1">
                    {filteredFromCurrencies.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground italic">
                        No currency found
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredFromCurrencies.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setFromCurrency(c);
                              setFromOpen(false);
                              setFromSearch('');
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors flex items-center justify-between hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              fromCurrency === c ? "bg-primary/5 font-semibold text-primary" : "text-foreground"
                            )}
                          >
                            <span className="font-mono">{c}</span>
                            {fromCurrency === c && (
                              <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            {/* Swap Button */}
            <Button variant="outline" size="icon" onClick={swap} className="mb-0.5 w-10 h-10 rounded-xl border-muted hover:bg-muted">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            {/* To Selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium">To</label>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={toOpen}
                    className="w-full justify-between font-normal text-left h-10 mt-1 rounded-xl border-muted"
                  >
                    <span className="truncate font-semibold">{toCurrency}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-2xl shadow-xl z-50 bg-popover border">
                  <div className="relative flex items-center mb-1.5 border-b pb-1.5 px-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search currency..."
                      value={toSearch}
                      onChange={(e) => setToSearch(e.target.value)}
                      className="pl-8 h-9 border-none bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/60 rounded-lg"
                    />
                  </div>
                  <ScrollArea className="h-[200px] overflow-y-auto pr-1">
                    {filteredToCurrencies.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground italic">
                        No currency found
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredToCurrencies.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setToCurrency(c);
                              setToOpen(false);
                              setToSearch('');
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors flex items-center justify-between hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              toCurrency === c ? "bg-primary/5 font-semibold text-primary" : "text-foreground"
                            )}
                          >
                            <span className="font-mono">{c}</span>
                            {toCurrency === c && (
                              <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Result */}
          <div className="text-center py-4 bg-muted/20 rounded-xl border border-dashed my-2">
            <p className="text-3xl font-extrabold tracking-tight">{result.toFixed(4)} {toCurrency}</p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {amount} {fromCurrency} = {result.toFixed(4)} {toCurrency}
            </p>
          </div>

          <Button onClick={loadRates} disabled={loading} variant="outline" className="w-full h-10 rounded-xl font-bold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating rates...</> : 'Refresh Rates'}
          </Button>
        </div>

        {/* Common conversions */}
        {result > 0 && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Quick Conversions from {fromCurrency}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD'].filter(c => c !== fromCurrency).slice(0, 8).map(target => {
                if (!rates[target]) return null;
                const val = (amount / rates[fromCurrency]) * rates[target];
                return (
                  <div key={target} className="rounded-xl bg-muted/40 p-2.5 text-center border border-muted/20">
                    <p className="font-bold text-xs text-muted-foreground">{target}</p>
                    <p className="font-semibold mt-0.5 text-sm">{val.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
