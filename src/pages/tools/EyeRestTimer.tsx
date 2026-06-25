import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type Phase = 'working' | 'resting' | 'idle';

export default function EyeRestTimer() {
  const tool = getToolById('eye-rest-timer')!;
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const notificationSent = useRef(false);

  const requestNotify = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotify = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, []);

  useEffect(() => {
    requestNotify();
  }, [requestNotify]);

  useEffect(() => {
    if (phase === 'idle') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'working') {
            setPhase('resting');
            setTimeLeft(20);
            notificationSent.current = false;
            sendNotify('Time for a break!', 'Look 20 feet away for 20 seconds.');
            return 20;
          } else {
            setPhase('working');
            setTimeLeft(20 * 60);
            notificationSent.current = false;
            return 20 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, sendNotify]);

  const start = useCallback(() => {
    setPhase('working');
    setTimeLeft(20 * 60);
    notificationSent.current = false;
  }, []);

  const stop = useCallback(() => {
    setPhase('idle');
    setTimeLeft(20 * 60);
    notificationSent.current = false;
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-colors ${phase === 'resting' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
              {phase === 'resting' ? (
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto text-emerald-600" />
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{formatTime(timeLeft)}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto text-blue-600" />
                  <p className="text-3xl font-bold text-blue-600 mt-1">{formatTime(timeLeft)}</p>
                </div>
              )}
            </div>

            <div className="text-center">
              {phase === 'resting' ? (
                <div>
                  <p className="text-xl font-semibold text-emerald-600">Time to rest! 🌿</p>
                  <p className="text-sm text-muted-foreground mt-1">Look at something 20 feet away</p>
                </div>
              ) : phase === 'working' ? (
                <div>
                  <p className="text-xl font-semibold">Focus mode</p>
                  <p className="text-sm text-muted-foreground mt-1">Break in {formatTime(timeLeft)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-semibold">20-20-20 Rule Timer</p>
                  <p className="text-sm text-muted-foreground mt-1">Every 20 min, look 20 ft away for 20 sec</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {phase === 'idle' ? (
                <Button onClick={start} className="gap-2"><Play className="w-4 h-4" /> Start</Button>
              ) : (
                <>
                  <Button onClick={stop} variant="outline" className="gap-2"><Pause className="w-4 h-4" /> Stop</Button>
                  <Button onClick={start} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Restart</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
}
