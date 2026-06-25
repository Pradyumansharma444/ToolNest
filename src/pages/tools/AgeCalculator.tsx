import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function AgeCalculator() {
  const tool = getToolById('age-calculator')!;
  const [birthDate, setBirthDate] = useState('');

  const age = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    if (isNaN(birth.getTime())) return null;
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDays, totalHours: totalDays * 24, totalMinutes: totalDays * 24 * 60 };
  }, [birthDate]);

  return (
    <ToolLayout tool={tool} resultVisible={!!age}>
      <div className="space-y-4">
        <div><label className="text-sm text-muted-foreground block mb-1">Select your birth date</label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></div>
        {age && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Years', value: age.years },
              { label: 'Months', value: age.months },
              { label: 'Days', value: age.days },
              { label: 'Total Days', value: age.totalDays.toLocaleString() },
              { label: 'Total Hours', value: age.totalHours.toLocaleString() },
              { label: 'Total Minutes', value: age.totalMinutes.toLocaleString() },
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
