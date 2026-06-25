import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Trophy } from 'lucide-react';

function getSolvedState(size: number): number[] {
  const total = size * size;
  const solved = Array.from({ length: total - 1 }, (_, i) => i + 1);
  solved.push(0);
  return solved;
}

function scrambleBoard(size: number): number[] {
  const solved = getSolvedState(size);
  const current = [...solved];

  const getMoves = (idx: number) => {
    const movesList: number[] = [];
    const row = Math.floor(idx / size);
    const col = idx % size;

    if (row > 0) movesList.push(idx - size);
    if (row < size - 1) movesList.push(idx + size);
    if (col > 0) movesList.push(idx - 1);
    if (col < size - 1) movesList.push(idx + 1);

    return movesList;
  };

  let blankIdx = size * size - 1;

  for (let i = 0; i < 200; i++) {
    const possibilities = getMoves(blankIdx);
    const randomMove = possibilities[Math.floor(Math.random() * possibilities.length)];
    current[blankIdx] = current[randomMove];
    current[randomMove] = 0;
    blankIdx = randomMove;
  }

  return current;
}

export default function SlidingPuzzle() {
  const tool = getToolById('sliding-puzzle')!;

  const [gridSize, setGridSize] = useState<3 | 4>(4);
  const [board, setBoard] = useState<number[]>(() => scrambleBoard(4));
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const initGame = useCallback((size: 3 | 4) => {
    setGridSize(size);
    const scrambled = scrambleBoard(size);
    setBoard(scrambled);
    setMoves(0);
    setTime(0);
    setGameActive(true);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  // Handle tile clicks
  const handleTileClick = (index: number) => {
    if (!gameActive) return;

    const blankIdx = board.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const blankRow = Math.floor(blankIdx / gridSize);
    const blankCol = blankIdx % gridSize;

    // Check if clicked cell is adjacent to the blank cell
    const isAdjacent = Math.abs(row - blankRow) + Math.abs(col - blankCol) === 1;

    if (isAdjacent) {
      const nextBoard = [...board];
      nextBoard[blankIdx] = board[index];
      nextBoard[index] = 0;
      setBoard(nextBoard);
      setMoves((m) => m + 1);

      // Verify Win
      const solved = getSolvedState(gridSize);
      if (nextBoard.every((val, idx) => val === solved[idx])) {
        setGameActive(false);
      }
    }
  };

  const isWon = !gameActive && board.length > 0 && board.every((val, idx) => val === getSolvedState(gridSize)[idx]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto py-2 space-y-6 select-none">
        
        {/* Toggle size and reset */}
        <div className="flex w-full justify-between items-center flex-wrap gap-4 px-2">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            {([3, 4] as const).map((size) => (
              <Button
                key={size}
                size="sm"
                variant={gridSize === size ? 'default' : 'ghost'}
                className="rounded-lg px-4"
                onClick={() => initGame(size)}
              >
                {size === 3 ? '8-Puzzle (3x3)' : '15-Puzzle (4x4)'}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-center">
              Moves: <span className="font-extrabold">{moves}</span>
            </div>
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-sm font-bold">
              Time: {time}s
            </div>
            <Button size="sm" variant="outline" onClick={() => initGame(gridSize)} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Puzzle Board Grid */}
        <div
          className="w-full max-w-[360px] aspect-square bg-muted/20 p-4 border rounded-2xl grid gap-2 shadow-xl"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {board.map((tile, index) => {
            const isEmpty = tile === 0;
            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-lg sm:text-2xl transition-all shadow-md ${
                  isEmpty
                    ? 'bg-transparent border border-dashed border-muted-foreground/35 shadow-none'
                    : 'bg-primary hover:bg-primary/95 text-white active:scale-95'
                }`}
              >
                {!isEmpty && tile}
              </button>
            );
          })}
        </div>

        {/* Winner overlay */}
        {isWon && (
          <div className="rounded-2xl border bg-card p-6 w-full max-w-sm text-center space-y-4 shadow-xl">
            <h3 className="text-2xl font-extrabold flex items-center justify-center gap-2 text-primary">
              <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
              Victory! Solved
            </h3>
            <p className="text-sm text-muted-foreground">
              You rearranged all tiles in <span className="font-bold">{moves} moves</span> and <span className="font-bold">{time} seconds</span>.
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
