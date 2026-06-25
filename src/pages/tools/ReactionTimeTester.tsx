import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Zap } from 'lucide-react';

type State = 'idle' | 'waiting' | 'ready' | 'result' | 'fail';

export default function ReactionTimeTester() {
  const tool = getToolById('reaction-time')!;

  const [state, setState] = useState<State>('idle');
  const [currentMs, setCurrentMs] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('reaction_best_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);

  const handleClick = () => {
    if (state === 'idle' || state === 'result' || state === 'fail') {
      // Start testing
      setState('waiting');
      const randomDelay = Math.random() * 3000 + 2000; // 2s - 5s
      timerRef.current = setTimeout(() => {
        setState('ready');
        startTime.current = performance.now();
      }, randomDelay);
    } else if (state === 'waiting') {
      // premature click!
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('fail');
    } else if (state === 'ready') {
      // correct click!
      const clickTime = performance.now();
      const elapsed = Math.round(clickTime - startTime.current);
      setCurrentMs(elapsed);
      setState('result');

      const nextHistory = [elapsed, ...history].slice(0, 5);
      setHistory(nextHistory);

      if (bestScore === 0 || elapsed < bestScore) {
        setBestScore(elapsed);
        localStorage.setItem('reaction_best_score', elapsed.toString());
      }
    }
  };

  const handleReset = () => {
    setHistory([]);
    setState('idle');
  };

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const average = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0;

  // Background states
  const getPanelClass = () => {
    const base = 'w-full min-h-[300px] border rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none p-6 text-center transition-all ';
    if (state === 'idle') return base + 'bg-card hover:bg-muted/30';
    if (state === 'waiting') return base + 'bg-red-500 text-white';
    if (state === 'ready') return base + 'bg-emerald-500 text-white animate-pulse';
    if (state === 'result') return base + 'bg-blue-500 text-white';
    return base + 'bg-amber-500 text-white'; // fail
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto space-y-6 py-2 select-none">
        
        {/* Click Board Area */}
        <div onClick={handleClick} className={getPanelClass()}>
          {state === 'idle' && (
            <div className="space-y-3">
              <Zap className="w-16 h-16 text-primary mx-auto animate-bounce" />
              <h3 className="text-3xl font-extrabold">Reaction Time Test</h3>
              <p className="text-muted-foreground text-sm">Click anywhere to start. Wait for screen to turn green, then click instantly.</p>
            </div>
          )}
          {state === 'waiting' && (
            <div className="space-y-2">
              <h3 className="text-4xl font-black">WAIT FOR GREEN...</h3>
              <p className="opacity-80">Do not click yet.</p>
            </div>
          )}
          {state === 'ready' && (
            <div className="space-y-2">
              <h3 className="text-5xl font-black tracking-widest">CLICK NOW!</h3>
            </div>
          )}
          {state === 'result' && (
            <div className="space-y-3">
              <div className="text-6xl font-black font-mono">{currentMs}ms</div>
              <h4 className="text-xl font-bold">Good Job!</h4>
              <p className="opacity-85 text-xs">Click to try again.</p>
            </div>
          )}
          {state === 'fail' && (
            <div className="space-y-3">
              <h3 className="text-4xl font-black">Too Early!</h3>
              <p className="opacity-85 text-sm">You clicked before the screen flashed green.</p>
              <p className="opacity-80 text-xs">Click to restart.</p>
            </div>
          )}
        </div>

        {/* Stats Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="font-bold text-sm text-muted-foreground uppercase">Statistics</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Personal Best</span>
                <span className="font-bold font-mono">{bestScore > 0 ? `${bestScore}ms` : '--'}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Attempt Average (last 5)</span>
                <span className="font-bold font-mono">{average > 0 ? `${average}ms` : '--'}</span>
              </div>
            </div>
            {history.length > 0 && (
              <Button size="sm" variant="outline" className="w-full" onClick={handleReset}>
                Clear Records
              </Button>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="font-bold text-sm text-muted-foreground uppercase">Recent History</h4>
            <div className="space-y-1 text-xs font-mono">
              {history.map((t, idx) => (
                <div key={idx} className="flex justify-between border-b py-0.5">
                  <span>Attempt #{history.length - idx}</span>
                  <span className="font-bold text-primary">{t}ms</span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No attempts logged yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
