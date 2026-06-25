import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function DateDifference() {
  const tool = getToolById('date-difference')!;
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');

  const diff = useMemo(() => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1), d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const ms = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const totalHours = Math.floor(ms / (1000 * 60 * 60));
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const totalSeconds = Math.floor(ms / 1000);
    return { days, hours, minutes, totalHours, totalMinutes, totalSeconds, years: Math.floor(days / 365) };
  }, [date1, date2]);

  return (
    <ToolLayout tool={tool} resultVisible={!!diff}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-muted-foreground block mb-1">Start Date</label><Input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground block mb-1">End Date</label><Input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} /></div>
        </div>
        {diff && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Years', value: diff.years },
              { label: 'Days', value: diff.days },
              { label: 'Hours', value: diff.hours },
              { label: 'Minutes', value: diff.minutes },
              { label: 'Total Hours', value: diff.totalHours.toLocaleString() },
              { label: 'Total Minutes', value: diff.totalMinutes.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
