import { useState, useEffect, useMemo } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Helsinki', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok',
  'Asia/Singapore', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Seoul',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Fiji', 'Africa/Cairo', 'Africa/Johannesburg',
];

const DEFAULT_CITIES = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney', 'America/Los_Angeles'];

export default function WorldClock() {
  const tool = getToolById('world-clock')!;
  const [time, setTime] = useState(new Date());
  const [selected, setSelected] = useState<string[]>(DEFAULT_CITIES);
  const [addZone, setAddZone] = useState('');

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const addTimezone = () => {
    if (addZone && !selected.includes(addZone)) {
      setSelected([...selected, addZone]);
      setAddZone('');
    }
  };

  const removeTimezone = (tz: string) => setSelected(selected.filter(s => s !== tz));

  const clocks = useMemo(() => selected.map(tz => ({
    tz,
    label: tz.replace(/_/g, ' '),
    city: tz.split('/').pop()!.replace(/_/g, ' '),
    region: tz.split('/')[0],
    time: time.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    date: time.toLocaleString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }),
    hour: parseInt(time.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', hour12: false })),
  })), [selected, time]);

  const available = TIMEZONES.filter(t => !selected.includes(t));

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={addZone} onValueChange={setAddZone}>
              <SelectTrigger className="w-60"><SelectValue placeholder="Add timezone..." /></SelectTrigger>
              <SelectContent className="max-h-64">
                {available.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addTimezone} disabled={!addZone}><Plus className="w-4 h-4 mr-1" />Add</Button>
            {selected.length > DEFAULT_CITIES.length && (
              <Button size="sm" variant="ghost" onClick={() => setSelected(DEFAULT_CITIES)}>Reset</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clocks.map(({ tz, city, region, time, date, hour }) => (
            <div key={tz} className="rounded-xl border bg-card p-4 relative">
              <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" onClick={() => removeTimezone(tz)}>
                <X className="w-3 h-3" />
              </Button>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${hour >= 6 && hour < 18 ? 'bg-yellow-100 text-yellow-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium leading-tight">{city}</p>
                  <p className="text-xs text-muted-foreground">{region}</p>
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums tracking-tight">{time}</p>
              <p className="text-xs text-muted-foreground mt-1">{date}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
