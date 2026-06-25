import { useState, useMemo } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function genId() { return Math.random().toString(36).substring(2, 9); }

interface DayRow {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
}

function toMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function calcHours(inTime: string, outTime: string): number {
  const diff = toMinutes(outTime) - toMinutes(inTime);
  return diff > 0 ? diff / 60 : 0;
}

export default function WorkHours() {
  const tool = getToolById('work-hours')!;
  const [rows, setRows] = useState<DayRow[]>([
    { id: genId(), date: new Date().toISOString().slice(0, 10), clockIn: '09:00', clockOut: '17:00' },
  ]);

  const addRow = () => {
    setRows(prev => [...prev, { id: genId(), date: new Date().toISOString().slice(0, 10), clockIn: '09:00', clockOut: '17:00' }]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof DayRow, value: string) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const { weeklyData, totalHours, overtimeDays } = useMemo(() => {
    const daily = rows.map(r => ({
      ...r,
      hours: calcHours(r.clockIn, r.clockOut),
    }));

    const weeks: Record<string, { days: typeof daily; total: number }> = {};
    for (const d of daily) {
      if (!d.date) continue;
      const date = new Date(d.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { days: [], total: 0 };
      weeks[key].days.push(d);
      weeks[key].total += d.hours;
    }

    const tot = daily.reduce((s, d) => s + d.hours, 0);
    const ot = daily.filter(d => d.hours > 8);

    return { weeklyData: Object.entries(weeks), totalHours: tot, overtimeDays: ot };
  }, [rows]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Time Entries</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {rows.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={r.date} onChange={e => updateRow(r.id, 'date', e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Clock In</Label>
                  <Input type="time" value={r.clockIn} onChange={e => updateRow(r.id, 'clockIn', e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Clock Out</Label>
                  <Input type="time" value={r.clockOut} onChange={e => updateRow(r.id, 'clockOut', e.target.value)} />
                </div>
                <div className="col-span-1 flex items-end pb-1">
                  <span className="text-sm font-medium">{calcHours(r.clockIn, r.clockOut).toFixed(1)}h</span>
                </div>
                <div className="col-span-1 flex items-end pb-1">
                  {rows.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeRow(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="w-4 h-4 mr-1" />Add Row
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{totalHours.toFixed(1)} <span className="text-base font-normal text-muted-foreground">total hours</span></div>
              {overtimeDays.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{overtimeDays.length} day(s) with overtime</span>
                </div>
              )}
            </CardContent>
          </Card>

          {weeklyData.map(([week, data]) => (
            <Card key={week}>
              <CardHeader><CardTitle className="text-sm">Week of {week}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {data.days.map(d => (
                    <div key={d.id} className="flex justify-between items-center">
                      <span>{d.date}</span>
                      <span className="flex items-center gap-2">
                        <span>{d.hours.toFixed(1)}h</span>
                        {d.hours > 8 && <Badge variant="destructive" className="text-[10px]">OT</Badge>}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>Weekly Total</span>
                    <span>{data.total.toFixed(1)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
