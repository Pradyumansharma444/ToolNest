import { useState } from 'react';
import { CURRENCIES, type Currency } from '@/lib/currencies';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCurrencies = CURRENCIES.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal text-left h-10 mt-1 rounded-xl border-muted"
          >
            <span className="truncate">
              {value ? `${value.symbol} ${value.code} — ${value.name}` : "Select currency..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-2xl shadow-xl z-50 bg-popover border">
          <div className="relative flex items-center mb-1.5 border-b pb-1.5 px-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 border-none bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-muted/60 rounded-lg"
            />
          </div>
          <ScrollArea className="h-[200px] overflow-y-auto pr-1">
            {filteredCurrencies.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground italic">
                No currency found
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      value?.code === c.code ? "bg-primary/5 font-medium text-primary" : "text-foreground"
                    )}
                  >
                    <span className="truncate">
                      <span className="font-mono inline-block w-6 text-muted-foreground">{c.symbol}</span>
                      <span className="font-semibold text-foreground mr-1.5">{c.code}</span>
                      <span className="text-muted-foreground text-xs">— {c.name}</span>
                    </span>
                    {value?.code === c.code && (
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
  );
}
