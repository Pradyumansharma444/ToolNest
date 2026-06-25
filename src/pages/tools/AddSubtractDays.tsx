import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function AddSubtractDays() {
  const tool = getToolById('add-subtract-days')!;
  const [startDate, setStartDate] = useState('');
  const [offset, setOffset] = useState('7');
  const [useBusiness, setUseBusiness] = useState(false);

  const result = useMemo(() => {
    if (!startDate || !offset) return null;
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return null;
    const n = parseInt(offset);
    if (isNaN(n)) return null;
    if (useBusiness) {
      let businessDays = Math.abs(n);
      const dir = n < 0 ? -1 : 1;
      while (businessDays > 0) {
        d.setDate(d.getDate() + dir);
        if (d.getDay() !== 0 && d.getDay() !== 6) businessDays--;
      }
    } else {
      d.setDate(d.getDate() + n);
    }
    return { date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), iso: d.toISOString().split('T')[0] };
  }, [startDate, offset, useBusiness]);

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-muted-foreground block mb-1">Start Date</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div><label className="text-sm text-muted-foreground block mb-1">Days to add/subtract</label><Input type="number" value={offset} onChange={(e) => setOffset(e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="biz" checked={useBusiness} onChange={(e) => setUseBusiness(e.target.checked)} className="rounded border-muted-foreground" />
          <label htmlFor="biz" className="text-sm text-muted-foreground">Skip weekends (business days only)</label>
        </div>
        {result && (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-2xl font-bold">{result.date}</p>
            <p className="text-sm text-muted-foreground mt-1">ISO: {result.iso}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
