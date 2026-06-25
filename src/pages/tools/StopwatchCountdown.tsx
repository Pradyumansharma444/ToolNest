import { useState, useRef, useEffect } from 'react';
import { Play, Square, RotateCcw, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function StopwatchCountdown() {
  const tool = getToolById('stopwatch-countdown')!;
  const { toast } = useToast();
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdownInput, setCountdownInput] = useState(300);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - (mode === 'stopwatch' ? elapsed : 0);
      intervalRef.current = window.setInterval(() => {
        if (mode === 'stopwatch') {
          setElapsed(Date.now() - startRef.current);
        } else {
          const remaining = countdownInput * 1000 - (Date.now() - startRef.current);
          if (remaining <= 0) { setRunning(false); setElapsed(0); toast({ title: 'Countdown finished!' }); return; }
          setElapsed(remaining);
        }
      }, 100);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const startStop = () => {
    if (!running) { startRef.current = Date.now(); setRunning(true); }
    else { setRunning(false); if (mode === 'countdown') setElapsed(countdownInput * 1000 - (Date.now() - startRef.current)); }
  };

  const reset = () => { setRunning(false); setElapsed(0); setLaps([]); };

  const addLap = () => { if (running) setLaps(prev => [...prev, elapsed]); };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-6">
        <div className="flex justify-center gap-2">
          <Button variant={mode === 'stopwatch' ? 'default' : 'outline'} onClick={() => { setMode('stopwatch'); reset(); }}>Stopwatch</Button>
          <Button variant={mode === 'countdown' ? 'default' : 'outline'} onClick={() => { setMode('countdown'); reset(); }}>Countdown</Button>
        </div>
        {mode === 'countdown' && !running && (
          <div className="flex justify-center">
            <Input type="number" value={Math.floor(countdownInput / 60)} onChange={(e) => setCountdownInput(parseInt(e.target.value) * 60 || 60)} className="w-32 text-center text-lg" />
            <span className="text-lg self-center ml-2">minutes</span>
          </div>
        )}
        <div className="text-center">
          <p className="text-5xl md:text-6xl font-mono font-bold tracking-wider">{formatTime(elapsed)}</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button size="lg" variant={running ? 'destructive' : 'default'} onClick={startStop}>
            {running ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="w-5 h-5" /></Button>
          {mode === 'stopwatch' && <Button size="lg" variant="outline" onClick={addLap} disabled={!running}><Flag className="w-5 h-5" /></Button>}
        </div>
        {laps.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-medium mb-2">Laps</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>Lap {i + 1}</span>
                  <span className="font-mono">{formatTime(lap - (laps[i - 1] || 0))}</span>
                  <span className="font-mono text-muted-foreground">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
