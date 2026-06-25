import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function AgeInDays() {
  const tool = getToolById('age-in-days')!;
  const [birthdate, setBirthdate] = useState('');
  const [birthtime, setBirthtime] = useState('00:00');
  const [now, setNow] = useState(() => Date.now());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [started]);

  const diff = useMemo(() => {
    if (!birthdate) return null;
    const birth = new Date(`${birthdate}T${birthtime || '00:00'}:00`).getTime();
    const ms = Math.max(0, now - birth);
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [birthdate, birthtime, now]);

  return (
    <ToolLayout tool={tool} resultVisible={!!diff}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Birth Date</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Birth Time (optional)</label>
            <input
              type="time"
              value={birthtime}
              onChange={(e) => setBirthtime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button onClick={() => setStarted(true)} className="w-full gap-2" disabled={!birthdate || started}>
            <Clock className="w-4 h-4" /> {started ? 'Counting...' : 'Start'}
          </Button>
          {started && (
            <Button onClick={() => setStarted(false)} variant="outline" className="w-full">Stop</Button>
          )}
        </Card>

        {diff && (
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <Calendar className="w-5 h-5 mx-auto text-blue-500" />
                <p className="text-3xl font-bold">{diff.days.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
              <div className="space-y-1">
                <Clock className="w-5 h-5 mx-auto text-emerald-500" />
                <p className="text-3xl font-bold">{diff.hours}</p>
                <p className="text-xs text-muted-foreground">Hours</p>
              </div>
              <div className="space-y-1">
                <Timer className="w-5 h-5 mx-auto text-amber-500" />
                <p className="text-3xl font-bold">{diff.minutes}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
              <div className="space-y-1">
                <Clock className="w-5 h-5 mx-auto text-rose-500" />
                <p className="text-3xl font-bold">{diff.seconds}</p>
                <p className="text-xs text-muted-foreground">Seconds</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
