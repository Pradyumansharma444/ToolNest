import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STORAGE_KEY = 'weekly-planner-data';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

type Plan = Record<string, string>;

function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function savePlan(plan: Plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

function cellKey(day: string, hour: number): string {
  return `${day}-${hour}`;
}

export default function WeeklyPlanner() {
  const tool = getToolById('weekly-planner')!;
  const [plan, setPlan] = useState<Plan>(loadPlan);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { savePlan(plan); }, [plan]);

  const getTask = useCallback((day: string, hour: number) => plan[cellKey(day, hour)] || '', [plan]);

  const startEdit = useCallback((key: string, value: string) => {
    setEditing(key);
    setEditValue(value);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editing) return;
    setPlan((prev) => {
      const next = { ...prev };
      if (editValue.trim()) next[editing] = editValue.trim();
      else delete next[editing];
      return next;
    });
    setEditing(null);
    setEditValue('');
  }, [editing, editValue]);

  const clearDay = useCallback((day: string) => {
    setPlan((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(day + '-')) delete next[key];
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setPlan({});
  }, []);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="w-4 h-4" /> Print</Button>
          <Button variant="outline" onClick={clearAll} className="gap-2 text-red-500"><Trash2 className="w-4 h-4" /> Clear All</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-muted w-16 text-xs font-medium">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="p-2 border bg-muted min-w-[100px]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium">{day}</span>
                      <button onClick={() => clearDay(day)} className="text-muted-foreground hover:text-red-500 print:hidden">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="p-1 border text-center text-xs text-muted-foreground align-top">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {DAYS.map((day) => {
                    const key = cellKey(day, hour);
                    const task = getTask(day, hour);
                    const isEditing = editing === key;
                    return (
                      <td
                        key={key}
                        className="p-1 border align-top cursor-pointer hover:bg-muted/50 transition-colors min-h-[40px]"
                        onClick={() => !isEditing && startEdit(key, task)}
                      >
                        {isEditing ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') { setEditing(null); }
                              }}
                              className="h-7 text-xs"
                              autoFocus
                            />
                            <Button size="sm" className="h-7 px-2" onClick={saveEdit}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs leading-tight min-h-[24px]">{task}</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style>{`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { page-break-after: always; }
          }
        `}</style>
      </div>
    </ToolLayout>
  );
}
