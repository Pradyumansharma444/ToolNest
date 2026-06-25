import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Award } from 'lucide-react';

const EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
];

interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryCardFlip() {
  const tool = getToolById('memory-card')!;

  const [gridSize, setGridSize] = useState<4 | 6>(4);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('memory_best_moves');
    return saved ? JSON.parse(saved) : { '4': 0, '6': 0 };
  });
  const [time, setTime] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // Setup game
  const initGame = useCallback((size: 4 | 6) => {
    setGridSize(size);
    const pairsCount = (size * size) / 2;
    const selectedEmojis = EMOJIS.slice(0, pairsCount);
    const items = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: `${emoji}-${index}`,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(items);
    setSelectedCards([]);
    setMoves(0);
    setTime(0);
    setGameActive(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame(4);
  }, [initGame]);

  // Timer logic
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  // Handle Card Clicks
  const handleCardClick = (index: number) => {
    if (!gameActive || selectedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const nextCards = cards.map((c, i) => (i === index ? { ...c, isFlipped: true } : c));
    setCards(nextCards);

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextSelected;
      const c1 = nextCards[firstIdx];
      const c2 = nextCards[secondIdx];

      if (c1.emoji === c2.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            );

            // Verify win
            if (updated.every((c) => c.isMatched)) {
              setGameActive(false);
              // Save best highscore
              setBestMoves((best) => {
                const nextBest = { ...best };
                const currentBest = nextBest[gridSize.toString()];
                if (currentBest === 0 || moves + 1 < currentBest) {
                  nextBest[gridSize.toString()] = moves + 1;
                  localStorage.setItem('memory_best_moves', JSON.stringify(nextBest));
                }
                return nextBest;
              });
            }
            return updated;
          });
          setSelectedCards([]);
        }, 500);
      } else {
        // No match: Flip cards back down after 1s
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c))
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const win = cards.length > 0 && cards.every((c) => c.isMatched);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto space-y-6 py-2 select-none">
        
        {/* Top Control Stats */}
        <div className="flex w-full justify-between items-center flex-wrap gap-4 px-2">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            {([4, 6] as const).map((size) => (
              <Button
                key={size}
                size="sm"
                variant={gridSize === size ? 'default' : 'ghost'}
                className="rounded-lg px-4"
                onClick={() => initGame(size)}
              >
                {size}x{size}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-center">
              <div>Moves: <span className="font-extrabold">{moves}</span></div>
              {bestMoves[gridSize.toString()] > 0 && (
                <div className="text-[10px] text-muted-foreground">Best: {bestMoves[gridSize.toString()]}</div>
              )}
            </div>
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-sm font-bold">
              Time: {time}s
            </div>
            <Button size="sm" variant="outline" onClick={() => initGame(gridSize)} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Game Cards Grid */}
        <div
          className={`grid gap-3 w-full max-w-[420px] aspect-square bg-muted/20 dark:bg-zinc-950/20 p-4 border rounded-2xl shadow-xl`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card, index) => {
            const showEmoji = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`w-full aspect-square relative transition-all duration-300 rounded-xl outline-none shadow-md ${
                  showEmoji ? 'bg-background scale-95 border-2 border-primary' : 'bg-primary hover:bg-primary/90'
                }`}
                style={{
                  transform: showEmoji ? 'rotateY(180deg)' : 'none',
                }}
              >
                {showEmoji ? (
                  <span className="text-xl sm:text-3xl flex items-center justify-center h-full transform -rotate-y-180 select-none">
                    {card.emoji}
                  </span>
                ) : (
                  <span className="text-white text-base sm:text-lg font-extrabold flex items-center justify-center h-full">
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Win popup */}
        {win && (
          <div className="rounded-2xl border bg-card p-6 w-full max-w-sm text-center space-y-4 shadow-xl">
            <h3 className="text-2xl font-extrabold flex items-center justify-center gap-2 text-primary">
              <Award className="w-6 h-6 text-yellow-500 animate-bounce" />
              Perfect Match!
            </h3>
            <p className="text-sm text-muted-foreground">
              You matched all pairs in <span className="font-bold">{moves} moves</span> and <span className="font-bold">{time} seconds</span>.
            </p>
            <Button size="sm" onClick={() => initGame(gridSize)} className="w-full">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
