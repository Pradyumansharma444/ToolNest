import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Play } from 'lucide-react';

const COLORS = ['green', 'red', 'yellow', 'blue'] as const;
type Color = typeof COLORS[number];

// Frequencies for Simon quadrants
const FREQUENCIES: Record<Color, number> = {
  green: 261.63, // C4
  red: 329.63,   // E4
  yellow: 392.00, // G4
  blue: 523.25,  // C5
};

export default function ColorMemoryGame() {
  const tool = getToolById('simon-says')!;

  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeButton, setActiveButton] = useState<Color | null>(null);
  
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('simon_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play Sound Helper using Web Audio API
  const playQuadrantSound = (color: Color) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(FREQUENCIES[color], ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Web Audio API not supported/active', e);
    }
  };

  // Play sequence pattern for player
  const playSequence = useCallback(async (currentSeq: Color[]) => {
    for (let i = 0; i < currentSeq.length; i++) {
      const color = currentSeq[i];
      
      // Delay before flash
      await new Promise((r) => setTimeout(r, 200));
      setActiveButton(color);
      playQuadrantSound(color);
      
      // Flash duration
      await new Promise((r) => setTimeout(r, 450));
      setActiveButton(null);
    }
  }, []);

  // Advance game by 1 round
  const nextRound = useCallback((currentSeq: Color[]) => {
    const nextSeq = [...currentSeq, COLORS[Math.floor(Math.random() * 4)]];
    setSequence(nextSeq);
    setPlayerIndex(0);
    setTimeout(() => {
      playSequence(nextSeq);
    }, 600);
  }, [playSequence]);

  // Start game challenge
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    nextRound([]);
  };

  // Reset Game state
  const resetGame = () => {
    setSequence([]);
    setGameActive(false);
    setGameOver(false);
    setScore(0);
  };

  // Handle Quadrant Clicks
  const handleQuadrantClick = (color: Color) => {
    if (!gameActive || activeButton !== null || gameOver) return;

    setActiveButton(color);
    playQuadrantSound(color);
    setTimeout(() => setActiveButton(null), 200);

    const targetColor = sequence[playerIndex];

    if (color === targetColor) {
      // Correct click!
      const nextIndex = playerIndex + 1;
      if (nextIndex === sequence.length) {
        // Round complete!
        const nextScore = score + 1;
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('simon_high_score', nextScore.toString());
        }
        nextRound(sequence);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      // Game over!
      setGameOver(true);
      setGameActive(false);
    }
  };

  // Quadrant color styling
  const getQuadrantClass = (color: Color) => {
    const base = 'w-full aspect-square transition-all duration-100 flex items-center justify-center cursor-pointer border-4 border-foreground ';
    
    if (color === 'green') {
      return base + 'rounded-tl-full bg-emerald-700 hover:bg-emerald-600 ' + (activeButton === 'green' ? 'bg-emerald-400 scale-95 shadow-lg brightness-125' : '');
    }
    if (color === 'red') {
      return base + 'rounded-tr-full bg-red-700 hover:bg-red-600 ' + (activeButton === 'red' ? 'bg-red-400 scale-95 shadow-lg brightness-125' : '');
    }
    if (color === 'yellow') {
      return base + 'rounded-bl-full bg-amber-600 hover:bg-amber-500 ' + (activeButton === 'yellow' ? 'bg-amber-400 scale-95 shadow-lg brightness-125' : '');
    }
    // blue
    return base + 'rounded-br-full bg-blue-700 hover:bg-blue-600 ' + (activeButton === 'blue' ? 'bg-blue-400 scale-95 shadow-lg brightness-125' : '');
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-md mx-auto py-2 space-y-6 select-none">
        
        {/* Score metrics */}
        <div className="flex w-full justify-between items-center gap-4 px-2">
          <div className="bg-muted px-4 py-2 rounded-xl text-center min-w-[80px]">
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Score</div>
            <div className="text-xl font-extrabold">{score}</div>
          </div>
          <div className="bg-muted px-4 py-2 rounded-xl text-center min-w-[80px]">
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Best Score</div>
            <div className="text-xl font-extrabold">{highScore}</div>
          </div>
          <Button size="sm" variant="outline" onClick={resetGame} className="gap-1.5">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Quadrant Ring Board */}
        <div className="w-full max-w-[320px] aspect-square rounded-full border-8 border-foreground overflow-hidden grid grid-cols-2 gap-0 relative bg-zinc-950 shadow-2xl">
          
          {COLORS.map((color) => (
            <div
              key={color}
              onClick={() => handleQuadrantClick(color)}
              className={getQuadrantClass(color)}
            />
          ))}

          {/* Central Button Dial */}
          <div className="absolute inset-[30%] bg-zinc-900 border-8 border-foreground rounded-full flex flex-col items-center justify-center p-2 text-center text-white shadow-inner">
            {!gameActive && !gameOver && (
              <Button size="icon" variant="ghost" onClick={startGame} className="h-12 w-12 rounded-full hover:bg-zinc-800 text-emerald-400">
                <Play className="w-8 h-8 fill-current" />
              </Button>
            )}

            {gameActive && (
              <div className="text-xs font-black uppercase text-primary tracking-widest animate-pulse">
                Simon
              </div>
            )}

            {gameOver && (
              <div className="space-y-1">
                <div className="text-destructive font-black text-xs">FAIL</div>
                <Button size="sm" variant="outline" className="text-[9px] h-6 py-0.5 rounded px-2" onClick={startGame}>
                  Replay
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground max-w-xs">
          Listen to the sound and color patterns played. Replicate them in order. Each round increases sequence length.
        </div>
      </div>
    </ToolLayout>
  );
}
