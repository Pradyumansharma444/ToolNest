import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function RandomNamePicker() {
  const tool = getToolById('random-name-picker')!;
  const { toast } = useToast();
  const [names, setNames] = useState('');
  const [count, setCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [shuffling, setShuffling] = useState(false);

  const pick = () => {
    const list = names.split('\n').map(s => s.trim()).filter(s => s);
    if (list.length === 0) { toast({ title: 'Enter at least one name', variant: 'destructive' }); return; }
    setShuffling(true);
    const picks: string[] = [];
    const available = [...list];
    const numPicks = Math.min(count, available.length);
    for (let i = 0; i < numPicks; i++) {
      const idx = Math.floor(Math.random() * available.length);
      picks.push(available.splice(idx, 1)[0]);
    }
    let tick = 0;
    const interval = setInterval(() => {
      setWinners(Array.from({ length: numPicks }, () => list[Math.floor(Math.random() * list.length)]));
      tick++;
      if (tick > 15) { clearInterval(interval); setWinners(picks); setShuffling(false); toast({ title: `${picks.length} winner(s) picked!` }); }
    }, 80);
  };

  return (
    <ToolLayout tool={tool} resultVisible={winners.length > 0}>
      <div className="space-y-4">
        <textarea className="w-full h-32 rounded-xl border bg-background p-3 text-sm" placeholder="Enter names (one per line)..." value={names} onChange={(e) => setNames(e.target.value)} />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Number of winners:</span>
          <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, +e.target.value))} className="w-20" />
        </div>
        <Button onClick={pick} disabled={shuffling}>{shuffling ? 'Picking...' : 'Draw Winner(s)'}</Button>
        {winners.length > 0 && (
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Winner(s)</p>
            {winners.map((w, i) => <p key={i} className="text-xl font-bold">{w}</p>)}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
