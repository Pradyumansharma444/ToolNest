import { useState, useRef } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PomodoroTimer() {
  const tool = getToolById('pomodoro-timer')!;
  const { toast } = useToast();
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<number | null>(null);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const start = () => {
    if (running) return;
    setRunning(true);
    if (timeLeft === 0) setTimeLeft(workTime * 60);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          if (phase === 'work') {
            setPhase('break');
            setTimeLeft(breakTime * 60);
            toast({ title: 'Work session complete! Time for a break.' });
          } else {
            setPhase('work');
            setTimeLeft(workTime * 60);
            toast({ title: 'Break over! Time to work.' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setPhase('work');
    setTimeLeft(workTime * 60);
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div><label className="text-xs text-muted-foreground">Work (min)</label><Input type="number" min={1} max={120} value={workTime} onChange={(e) => { const v = +e.target.value; setWorkTime(v); if (!running) setTimeLeft(v * 60); }} /></div>
          <div><label className="text-xs text-muted-foreground">Break (min)</label><Input type="number" min={1} max={60} value={breakTime} onChange={(e) => setBreakTime(+e.target.value)} /></div>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{phase === 'work' ? 'Focus Time' : 'Break Time'}</p>
          <p className="text-6xl font-bold tabular-nums">{pad(mins)}:{pad(secs)}</p>
        </div>
        <div className="flex justify-center gap-2">
          {!running ? <Button onClick={start}><Play className="w-4 h-4 mr-1" />Start</Button> : <Button onClick={stop}><Square className="w-4 h-4 mr-1" />Stop</Button>}
          <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" />Reset</Button>
        </div>
      </div>
    </ToolLayout>
  );
}
