import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function RandomDice() {
  const tool = getToolById('random-dice')!;
  const { toast } = useToast();
  const [mode, setMode] = useState<'dice' | 'coin' | 'number'>('dice');
  const [diceValue, setDiceValue] = useState(1);
  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | null>(null);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [randomNum, setRandomNum] = useState<number | null>(null);
  const [flipping, setFlipping] = useState(false);

  const rollDice = () => {
    setDiceValue(Math.floor(Math.random() * 6) + 1);
    toast({ title: `You rolled a ${diceValue}` });
  };

  const flipCoin = () => {
    setFlipping(true);
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setCoinResult(result);
      setFlipping(false);
      toast({ title: result });
    }, 500);
  };

  const generateNumber = () => {
    if (min >= max) { toast({ title: 'Min must be less than max', variant: 'destructive' }); return; }
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomNum(num);
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === 'dice' ? 'default' : 'outline'} onClick={() => setMode('dice')}>Dice</Button>
          <Button size="sm" variant={mode === 'coin' ? 'default' : 'outline'} onClick={() => setMode('coin')}>Coin</Button>
          <Button size="sm" variant={mode === 'number' ? 'default' : 'outline'} onClick={() => setMode('number')}>Number</Button>
        </div>

        {mode === 'dice' && (
          <div className="text-center space-y-4">
            <div className="text-8xl">{/* Just show number */}</div>
            <p className="text-7xl font-bold">{diceValue}</p>
            <Button onClick={rollDice} size="lg"><RefreshCw className="w-5 h-5 mr-2" />Roll Dice</Button>
          </div>
        )}

        {mode === 'coin' && (
          <div className="text-center space-y-4">
            <div className={`w-32 h-32 rounded-full border-4 mx-auto flex items-center justify-center text-2xl font-bold transition-transform ${flipping ? 'animate-spin' : ''}`}
              style={{ background: coinResult === 'Heads' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : coinResult === 'Tails' ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : '#e5e7eb' }}>
              {coinResult || '?'}
            </div>
            <Button onClick={flipCoin} disabled={flipping}>{flipping ? 'Flipping...' : 'Flip Coin'}</Button>
          </div>
        )}

        {mode === 'number' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div><label className="text-sm text-muted-foreground block">Min</label><Input type="number" value={min} onChange={(e) => setMin(+e.target.value)} /></div>
              <div><label className="text-sm text-muted-foreground block">Max</label><Input type="number" value={max} onChange={(e) => setMax(+e.target.value)} /></div>
            </div>
            {randomNum !== null && <p className="text-5xl font-bold text-center">{randomNum}</p>}
            <Button onClick={generateNumber}><RefreshCw className="w-4 h-4 mr-1" />Generate</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
