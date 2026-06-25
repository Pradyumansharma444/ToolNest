import { useState, useMemo } from 'react';
import { Clock, Plus, X, Users } from 'lucide-react';
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

const TZ_OFFSETS: Record<string, number> = {
  'America/New_York': -5, 'America/Chicago': -6, 'America/Denver': -7, 'America/Los_Angeles': -8,
  'America/Toronto': -5, 'America/Vancouver': -8, 'America/Mexico_City': -6, 'America/Sao_Paulo': -3,
  'Europe/London': 0, 'Europe/Paris': 1, 'Europe/Berlin': 1, 'Europe/Madrid': 1, 'Europe/Rome': 1,
  'Europe/Amsterdam': 1, 'Europe/Stockholm': 1, 'Europe/Helsinki': 2, 'Europe/Moscow': 3,
  'Asia/Dubai': 4, 'Asia/Karachi': 5, 'Asia/Kolkata': 5.5, 'Asia/Dhaka': 6, 'Asia/Bangkok': 7,
  'Asia/Singapore': 8, 'Asia/Shanghai': 8, 'Asia/Hong_Kong': 8, 'Asia/Tokyo': 9, 'Asia/Seoul': 9,
  'Australia/Perth': 8, 'Australia/Adelaide': 9.5, 'Australia/Sydney': 10, 'Australia/Melbourne': 10,
  'Pacific/Auckland': 12, 'Pacific/Fiji': 12, 'Africa/Cairo': 2, 'Africa/Johannesburg': 2,
};

export default function MeetingPlanner() {
  const tool = getToolById('meeting-planner')!;
  const [selected, setSelected] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);
  const [addZone, setAddZone] = useState('');

  const addTimezone = () => {
    if (addZone && !selected.includes(addZone)) {
      setSelected([...selected, addZone]);
      setAddZone('');
    }
  };

  const removeTimezone = (tz: string) => setSelected(selected.filter(s => s !== tz));

  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMins = now.getUTCMinutes();

  const grid = useMemo(() => {
    return selected.map(tz => {
      const offset = TZ_OFFSETS[tz] || 0;
      const localHours = (utcHours + offset + 24) % 24;
      const localMins = utcMins;
      return { tz, offset, localHours, localMins, label: tz.replace(/_/g, ' ') };
    });
  }, [selected, utcHours, utcMins]);

  const isBusinessHour = (hour: number, offset: number) => {
    const localHour = (hour + offset + 24) % 24;
    return localHour >= 9 && localHour < 17;
  };

  const bestTimes = useMemo(() => {
    const scores: { hour: number; score: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const score = selected.filter(tz => isBusinessHour(h, TZ_OFFSETS[tz] || 0)).length;
      scores.push({ hour: h, score });
    }
    const maxScore = Math.max(...scores.map(s => s.score));
    return scores.filter(s => s.score === maxScore && s.score >= 2).map(s => s.hour);
  }, [selected]);

  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}${period}`;
  };

  const available = TIMEZONES.filter(t => !selected.includes(t));

  return (
    <ToolLayout tool={tool} resultVisible={selected.length > 0}>
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
          </div>

          {selected.map(tz => {
            const info = grid.find(g => g.tz === tz)!;
            const localTime = `${String(Math.floor(info.localHours)).padStart(2, '0')}:${String(Math.round(info.localMins)).padStart(2, '0')}`;
            return (
              <div key={tz} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{info.label}</p>
                    <p className="text-sm text-muted-foreground">UTC{info.offset >= 0 ? '+' : ''}{info.offset}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold tabular-nums">{localTime}</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeTimezone(tz)}><X className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border bg-card p-4 overflow-x-auto">
          <p className="font-medium text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> 24-Hour Overlap Grid</p>
          <div className="min-w-[600px]">
            <div className="flex mb-1">
              <div className="w-28 shrink-0" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="flex-1 text-center text-xs text-muted-foreground">{formatHour(h)}</div>
              ))}
            </div>
            {grid.map(({ tz, offset }) => (
              <div key={tz} className="flex items-center mb-1">
                <div className="w-28 shrink-0 text-xs truncate pr-2">{tz.split('/').pop()!.replace(/_/g, ' ')}</div>
                {Array.from({ length: 24 }, (_, h) => {
                  const biz = isBusinessHour(h, offset);
                  const isBest = bestTimes.includes(h);
                  return (
                    <div key={h} className={`flex-1 h-5 rounded-sm mx-px ${biz ? (isBest ? 'bg-green-500' : 'bg-primary/40') : 'bg-muted'}`} title={`${tz} @ ${formatHour(h)}`} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/40" /> Business hours</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500" /> Best overlap</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted" /> Outside hours</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
