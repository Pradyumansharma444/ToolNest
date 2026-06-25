import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw } from 'lucide-react';

const CHOICES = [
  { name: 'Rock', icon: '✊', beats: 'Scissors' },
  { name: 'Paper', icon: '✋', beats: 'Rock' },
  { name: 'Scissors', icon: '✌️', beats: 'Paper' },
];

export default function RockPaperScissors() {
  const tool = getToolById('rock-paper-scissors')!;

  const [playerChoice, setPlayerChoice] = useState<typeof CHOICES[number] | null>(null);
  const [computerChoice, setComputerChoice] = useState<typeof CHOICES[number] | null>(null);
  
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Trigger round choice
  const playRound = (choice: typeof CHOICES[number]) => {
    setIsShaking(true);
    setPlayerChoice(null);
    setComputerChoice(null);
    setRoundResult(null);

    setTimeout(() => {
      const compRandom = CHOICES[Math.floor(Math.random() * 3)];
      setPlayerChoice(choice);
      setComputerChoice(compRandom);
      setIsShaking(false);

      if (choice.name === compRandom.name) {
        setRoundResult('It\'s a Draw!');
        setScore((s) => ({ ...s, d: s.d + 1 }));
      } else if (choice.beats === compRandom.name) {
        setRoundResult('You Win!');
        setScore((s) => ({ ...s, w: s.w + 1 }));
      } else {
        setRoundResult('You Lose!');
        setScore((s) => ({ ...s, l: s.l + 1 }));
      }
    }, 800); // Hand shaking duration
  };

  const handleReset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setRoundResult(null);
    setScore({ w: 0, l: 0, d: 0 });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-md mx-auto py-2 space-y-6 select-none">
        
        {/* Scores row */}
        <div className="grid grid-cols-3 gap-3 w-full text-center text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border text-emerald-800 dark:text-emerald-400 py-2 rounded-xl">
            <div className="font-semibold uppercase tracking-wider text-[10px]">Wins</div>
            <div className="text-xl font-black">{score.w}</div>
          </div>
          <div className="bg-muted border py-2 rounded-xl text-muted-foreground">
            <div className="font-semibold uppercase tracking-wider text-[10px]">Draws</div>
            <div className="text-xl font-black">{score.d}</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 border text-rose-800 dark:text-rose-400 py-2 rounded-xl">
            <div className="font-semibold uppercase tracking-wider text-[10px]">Losses</div>
            <div className="text-xl font-black">{score.l}</div>
          </div>
        </div>

        {/* Display visual cards */}
        <div className="flex w-full items-center justify-around rounded-2xl border bg-card p-6 shadow-md min-h-[160px]">
          {/* Player choice card */}
          <div className="text-center space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">Player</div>
            <div className={`text-6xl ${isShaking ? 'animate-bounce' : ''}`}>
              {isShaking ? '✊' : playerChoice ? playerChoice.icon : '❓'}
            </div>
            {playerChoice && <div className="text-xs font-bold">{playerChoice.name}</div>}
          </div>

          <div className="text-2xl font-black text-muted-foreground">VS</div>

          {/* Computer choice card */}
          <div className="text-center space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">Opponent</div>
            <div className={`text-6xl ${isShaking ? 'animate-bounce' : ''}`}>
              {isShaking ? '✊' : computerChoice ? computerChoice.icon : '❓'}
            </div>
            {computerChoice && <div className="text-xs font-bold">{computerChoice.name}</div>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center w-full">
          {CHOICES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => playRound(choice)}
              disabled={isShaking}
              className="flex-1 py-4 bg-muted hover:bg-primary hover:text-white transition-all rounded-2xl shadow border flex flex-col items-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="text-4xl">{choice.icon}</span>
              <span className="text-xs font-bold">{choice.name}</span>
            </button>
          ))}
        </div>

        {/* Round result overlay */}
        <div className="flex w-full justify-between items-center gap-4 min-h-[40px]">
          <div className="text-lg font-bold">
            {roundResult && <span className="text-primary">{roundResult}</span>}
          </div>
          {(score.w > 0 || score.l > 0 || score.d > 0) && (
            <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset Records
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
