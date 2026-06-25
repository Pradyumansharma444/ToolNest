import { useState, useEffect, useMemo, useCallback } from 'react';
import { Coffee, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STORAGE_KEY = 'caffeine-calculator';

interface CaffeineEntry {
  id: number;
  name: string;
  amount: number;
}

const DRINK_OPTIONS = [
  { name: 'Coffee (drip)', mg: 95 },
  { name: 'Espresso (1 shot)', mg: 63 },
  { name: 'Instant Coffee', mg: 62 },
  { name: 'Black Tea', mg: 47 },
  { name: 'Green Tea', mg: 28 },
  { name: 'Energy Drink', mg: 80 },
  { name: 'Cola Soda', mg: 34 },
  { name: 'Dark Chocolate (1oz)', mg: 24 },
];

export default function CaffeineCalculator() {
  const tool = getToolById('caffeine-calculator')!;
  const [weight, setWeight] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY + '-weight') || ''; } catch { return ''; }
  });
  const [entries, setEntries] = useState<CaffeineEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + '-entries');
      if (raw) return JSON.parse(raw);
    } catch { /* empty */ }
    return [];
  });
  const [selectedDrink, setSelectedDrink] = useState(DRINK_OPTIONS[0].name);
  const [customMg, setCustomMg] = useState('');

  useEffect(() => {
    if (weight) localStorage.setItem(STORAGE_KEY + '-weight', weight);
  }, [weight]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '-entries', JSON.stringify(entries));
  }, [entries]);

  const weightNum = Number(weight);
  const maxRecommended = useMemo(() => {
    if (weightNum <= 0) return 0;
    return Math.round(weightNum * 6);
  }, [weightNum]);

  const totalCaffeine = useMemo(() => {
    return entries.reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const percentage = useMemo(() => {
    if (maxRecommended <= 0) return 0;
    return Math.min(100, Math.round((totalCaffeine / maxRecommended) * 100));
  }, [totalCaffeine, maxRecommended]);

  const addEntry = useCallback(() => {
    const option = DRINK_OPTIONS.find((d) => d.name === selectedDrink);
    const amount = option ? option.mg : Number(customMg);
    if (amount <= 0) return;
    const entry: CaffeineEntry = { id: Date.now(), name: selectedDrink, amount };
    setEntries((prev) => [...prev, entry]);
    setCustomMg('');
  }, [selectedDrink, customMg]);

  const removeEntry = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setEntries([]), []);

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-500';
    if (percentage >= 75) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!weight}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Body Weight (kg)</label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
          </div>

          {weightNum > 0 && (
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">Safe daily limit:</p>
              <p className="text-2xl font-bold text-blue-600">{maxRecommended} mg</p>
              <p className="text-xs text-muted-foreground">(~{Math.round(maxRecommended / 95)} cups of coffee)</p>
            </div>
          )}
        </Card>

        {weightNum > 0 && (
          <>
            <Card className="p-6 space-y-4">
              <h3 className="font-medium flex items-center gap-2"><Coffee className="w-4 h-4" /> Add Caffeine</h3>
              <div className="flex gap-2">
                <select
                  value={selectedDrink}
                  onChange={(e) => setSelectedDrink(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {DRINK_OPTIONS.map((d) => (
                    <option key={d.name} value={d.name}>{d.name} ({d.mg}mg)</option>
                  ))}
                </select>
                <Button onClick={addEntry} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
              </div>
              {selectedDrink === 'Custom' && (
                <Input type="number" value={customMg} onChange={(e) => setCustomMg(e.target.value)} placeholder="Caffeine amount (mg)" />
              )}
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Today's Intake</h3>
                {entries.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">Clear</Button>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className={`text-4xl font-bold ${getStatusColor()}`}>{totalCaffeine} mg</p>
                <p className={`text-sm ${getStatusColor()}`}>{percentage}% of daily limit</p>
              </div>

              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {percentage >= 100 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  You've reached or exceeded the safe daily limit!
                </div>
              )}

              <div className="space-y-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{entry.amount} mg</span>
                      <button onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                {entries.length === 0 && <p className="text-sm text-muted-foreground text-center">No entries yet.</p>}
              </div>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
