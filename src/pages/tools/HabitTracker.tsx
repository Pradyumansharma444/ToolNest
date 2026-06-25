import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STORAGE_KEY = 'habit-tracker-data';
const DAYS = 30;

interface HabitData {
  habits: string[];
  logs: Record<string, string[]>; // date -> habit indices
}

function loadData(): HabitData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { habits: [], logs: {} };
}

function saveData(data: HabitData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDates(): string[] {
  const dates: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function HabitTracker() {
  const tool = getToolById('habit-tracker')!;
  const [data, setData] = useState<HabitData>(loadData);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => { saveData(data); }, [data]);

  const dates = useMemo(() => getDates(), []);

  const addHabit = useCallback(() => {
    const name = newHabit.trim();
    if (!name || data.habits.includes(name)) return;
    setData((prev) => ({ ...prev, habits: [...prev.habits, name] }));
    setNewHabit('');
  }, [newHabit, data.habits]);

  const removeHabit = useCallback((idx: number) => {
    setData((prev) => {
      const habits = prev.habits.filter((_, i) => i !== idx);
      const logs: Record<string, string[]> = {};
      for (const [date, indices] of Object.entries(prev.logs)) {
        const filtered = indices.filter((i) => Number(i) !== idx).map((i) => String(Number(i) > idx ? Number(i) - 1 : Number(i)));
        if (filtered.length) logs[date] = filtered;
      }
      return { habits, logs };
    });
  }, []);

  const toggleHabit = useCallback((habitIdx: number, date: string) => {
    setData((prev) => {
      const logs = { ...prev.logs };
      const existing = logs[date] ? [...logs[date]] : [];
      const idx = existing.indexOf(String(habitIdx));
      if (idx >= 0) existing.splice(idx, 1);
      else existing.push(String(habitIdx));
      if (existing.length) logs[date] = existing;
      else delete logs[date];
      return { ...prev, logs };
    });
  }, []);

  const isDone = (habitIdx: number, date: string) => data.logs[date]?.includes(String(habitIdx));

  const stats = useMemo(() => {
    return data.habits.map((_, idx) => {
      let count = 0;
      for (const indices of Object.values(data.logs)) {
        if (indices.includes(String(idx))) count++;
      }
      return count;
    });
  }, [data]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="New habit name..." onKeyDown={(e) => e.key === 'Enter' && addHabit()} />
            <Button onClick={addHabit} disabled={!newHabit.trim()}><Plus className="w-4 h-4" /></Button>
          </div>
        </Card>

        {data.habits.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">Add a habit to get started!</Card>
        )}

        {data.habits.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 min-w-[120px]">Habit</th>
                  {dates.map((d) => (
                    <th key={d} className="text-center p-1 w-8 text-xs text-muted-foreground">
                      {new Date(d).getDate()}
                    </th>
                  ))}
                  <th className="text-center p-2 w-16 text-xs text-muted-foreground">Done</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {data.habits.map((habit, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 font-medium truncate max-w-[120px]">{habit}</td>
                    {dates.map((d) => (
                      <td key={d} className="text-center p-1">
                        <button
                          onClick={() => toggleHabit(idx, d)}
                          className={`w-6 h-6 rounded-sm border flex items-center justify-center transition-colors ${isDone(idx, d) ? 'bg-emerald-500 border-emerald-500 text-white' : 'hover:bg-muted'}`}
                        >
                          {isDone(idx, d) && <Check className="w-3 h-3" />}
                        </button>
                      </td>
                    ))}
                    <td className="text-center p-2 text-xs">{stats[idx]}/{DAYS}</td>
                    <td className="p-1">
                      <button onClick={() => removeHabit(idx)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </td>
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
