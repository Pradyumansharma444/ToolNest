import { useState, useEffect, useMemo, useCallback } from 'react';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Pattern {
  name: string;
  phases: { label: string; duration: number; color: string }[];
}

const PATTERNS: Pattern[] = [
  {
    name: 'Box Breathing',
    phases: [
      { label: 'Breathe In', duration: 4, color: 'bg-blue-500' },
      { label: 'Hold', duration: 4, color: 'bg-amber-500' },
      { label: 'Breathe Out', duration: 4, color: 'bg-emerald-500' },
      { label: 'Hold', duration: 4, color: 'bg-purple-500' },
    ],
  },
  {
    name: '4-7-8 Breathing',
    phases: [
      { label: 'Breathe In', duration: 4, color: 'bg-blue-500' },
      { label: 'Hold', duration: 7, color: 'bg-amber-500' },
      { label: 'Breathe Out', duration: 8, color: 'bg-emerald-500' },
    ],
  },
  {
    name: 'Simple Deep Breathing',
    phases: [
      { label: 'Breathe In', duration: 4, color: 'bg-blue-500' },
      { label: 'Breathe Out', duration: 4, color: 'bg-emerald-500' },
    ],
  },
];

export default function BreathingExercise() {
  const tool = getToolById('breathing-exercise')!;
  const [patternIdx, setPatternIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);

  const pattern = PATTERNS[patternIdx];
  const currentPhase = pattern.phases[phaseIdx];
  const progress = currentPhase ? phaseTime / currentPhase.duration : 0;
  const scale = 0.5 + (progress * 0.5);
  const opacity = 0.3 + (progress * 0.7);

  const totalCycles = useMemo(() => {
    let total = 0;
    for (const p of pattern.phases) total += p.duration;
    return total;
  }, [pattern]);

  const reset = useCallback(() => {
    setActive(false);
    setPhaseIdx(0);
    setPhaseTime(0);
  }, []);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPhaseTime((prev) => {
        const next = prev + 0.1;
        if (next >= currentPhase.duration) {
          const nextPhase = (phaseIdx + 1) % pattern.phases.length;
          setPhaseIdx(nextPhase);
          if (nextPhase === 0) return 0;
          return 0;
        }
        return Math.round(next * 10) / 10;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [active, phaseIdx, currentPhase?.duration, pattern.phases.length]);

  useEffect(() => {
    reset(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [patternIdx, reset]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex gap-2">
            {PATTERNS.map((p, i) => (
              <Button key={p.name} variant={i === patternIdx ? 'default' : 'outline'} size="sm" onClick={() => setPatternIdx(i)}>
                {p.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-100 ${currentPhase?.color} opacity-10`}
                style={{ transform: `scale(${scale})`, opacity }}
              />
              <div
                className={`absolute inset-4 rounded-full transition-all duration-100 ${currentPhase?.color} opacity-20`}
                style={{ transform: `scale(${scale * 0.9})`, opacity: opacity * 0.5 }}
              />
              <div
                className={`relative z-10 w-24 h-24 rounded-full transition-all duration-100 ${currentPhase?.color}`}
                style={{ transform: `scale(${scale})`, opacity }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                  {Math.ceil(Math.max(0.1, currentPhase ? currentPhase.duration - phaseTime : 0))}s
                </div>
              </div>
            </div>

            <p className="text-xl font-semibold">{currentPhase?.label}</p>

            <div className="flex gap-2">
              <Button onClick={() => setActive(!active)} className="gap-2">
                {active ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
            </div>

            <div className="flex gap-2">
              {pattern.phases.map((p, i) => (
                <div key={i} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i === phaseIdx ? `${p.color} text-white` : 'bg-muted text-muted-foreground'}`}>
                  {p.label}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Wind className="w-3 h-3" /> Cycle duration: {totalCycles}s &middot; {pattern.name}
            </p>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
}
