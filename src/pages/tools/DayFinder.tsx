import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DayFinder() {
  const tool = getToolById('day-finder')!;
  const [date, setDate] = useState('');

  const result = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return {
      weekday: WEEKDAYS[d.getDay()],
      day: d.getDate(),
      month: d.toLocaleString('default', { month: 'long' }),
      year: d.getFullYear(),
      dayOfYear: Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
      weekOfYear: Math.ceil((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7)),
    };
  }, [date]);

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-4">
        <div><label className="text-sm text-muted-foreground block mb-1">Select a date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        {result && (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-4xl font-bold mb-2">{result.weekday}</p>
            <p className="text-lg text-muted-foreground">{result.month} {result.day}, {result.year}</p>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="rounded-lg bg-muted p-3"><span className="text-muted-foreground">Day of Year:</span><br /><span className="font-bold">{result.dayOfYear}</span></div>
              <div className="rounded-lg bg-muted p-3"><span className="text-muted-foreground">Week of Year:</span><br /><span className="font-bold">{result.weekOfYear}</span></div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
