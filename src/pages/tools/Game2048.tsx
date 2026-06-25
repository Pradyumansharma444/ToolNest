import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Trophy } from 'lucide-react';

type Board = number[][];

export default function Game2048() {
  const tool = getToolById('game-2048')!;
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('2048_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Initialize Board
  const emptyBoard = (): Board => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const getEmptyCells = (currentBoard: Board) => {
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  };

  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const cells = getEmptyCells(currentBoard);
    if (cells.length === 0) return currentBoard;
    const { r, c } = cells[Math.floor(Math.random() * cells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initGame = useCallback(() => {
    let newBoard = emptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setHasWon(false);
  }, [addRandomTile]);

  // Initialize game on mount
  useEffect(() => {
    initGame(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [initGame]);

  // Check Game Over
  const checkGameOver = useCallback((currentBoard: Board): boolean => {
    if (getEmptyCells(currentBoard).length > 0) return false;

    // Check adjacent cells for matches
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = currentBoard[r][c];
        if (
          (r < 3 && val === currentBoard[r + 1][c]) ||
          (c < 3 && val === currentBoard[r][c + 1])
        ) {
          return false;
        }
      }
    }
    return true;
  }, []);

  // Slide Logic helpers
  const slideLeftRow = (row: number[]): { row: number[]; scoreGained: number } => {
    const filtered = row.filter((val) => val !== 0);
    let scoreGained = 0;
    const result: number[] = [];

    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        result.push(mergedVal);
        scoreGained += mergedVal;
        i++;
      } else {
        result.push(filtered[i]);
      }
    }

    while (result.length < 4) {
      result.push(0);
    }
    return { row: result, scoreGained };
  };

  const rotateBoardClockwise = (currentBoard: Board): Board => {
    const rotated = emptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        rotated[c][3 - r] = currentBoard[r][c];
      }
    }
    return rotated;
  };

  const boardEquals = (b1: Board, b2: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b1[r][c] !== b2[r][c]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (gameOver) return;

    let tempBoard = board.map((row) => [...row]);
    let rotatedCount = 0;

    // Standardize to slide left
    if (direction === 'UP') {
      tempBoard = rotateBoardClockwise(rotateBoardClockwise(rotateBoardClockwise(tempBoard)));
      rotatedCount = 1;
    } else if (direction === 'RIGHT') {
      tempBoard = rotateBoardClockwise(rotateBoardClockwise(tempBoard));
      rotatedCount = 2;
    } else if (direction === 'DOWN') {
      tempBoard = rotateBoardClockwise(tempBoard);
      rotatedCount = 3;
    }

    let scoreGained = 0;
    const nextBoard = tempBoard.map((row) => {
      const { row: newRow, scoreGained: sg } = slideLeftRow(row);
      scoreGained += sg;
      return newRow;
    });

    // Un-rotate
    let finalBoard = nextBoard;
    for (let i = 0; i < (4 - rotatedCount) % 4; i++) {
      finalBoard = rotateBoardClockwise(finalBoard);
    }

    if (!boardEquals(board, finalBoard)) {
      const addedBoard = addRandomTile(finalBoard);
      setBoard(addedBoard);

      const newScore = score + scoreGained;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('2048_high_score', newScore.toString());
      }

      // Check for 2048 win
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (addedBoard[r][c] === 2048 && !hasWon) {
            setHasWon(true);
          }
        }
      }

      if (checkGameOver(addedBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, score, highScore, hasWon, addRandomTile, checkGameOver]);

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          move('LEFT');
          break;
        case 'arrowright':
        case 'd':
          move('RIGHT');
          break;
        case 'arrowup':
        case 'w':
          move('UP');
          break;
        case 'arrowdown':
        case 's':
          move('DOWN');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const diffX = e.changedTouches[0].clientX - touchStart.current.x;
    const diffY = e.changedTouches[0].clientY - touchStart.current.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) > 30) {
      // Threshold
      if (absX > absY) {
        if (diffX > 0) move('RIGHT');
        else move('LEFT');
      } else {
        if (diffY > 0) move('DOWN');
        else move('UP');
      }
    }
    touchStart.current = null;
  };

  // Cell color profiles
  const getCellClasses = (val: number) => {
    const base = 'w-full aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-lg sm:text-2xl transition-all duration-100 ';
    if (val === 0) return base + 'bg-muted/40 border border-border';
    if (val === 2) return base + 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700';
    if (val === 4) return base + 'bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-350 border border-orange-200 dark:border-orange-900';
    if (val === 8) return base + 'bg-orange-500 text-white shadow-sm';
    if (val === 16) return base + 'bg-amber-600 text-white shadow-sm';
    if (val === 32) return base + 'bg-red-500 text-white shadow-sm';
    if (val === 64) return base + 'bg-rose-600 text-white shadow-sm';
    if (val === 128) return base + 'bg-yellow-500 text-white shadow-md text-base sm:text-xl';
    if (val === 256) return base + 'bg-yellow-400 text-white shadow-md text-base sm:text-xl';
    if (val === 512) return base + 'bg-emerald-500 text-white shadow-lg text-base sm:text-xl';
    if (val === 1024) return base + 'bg-teal-500 text-white shadow-lg text-sm sm:text-lg';
    if (val === 2048) return base + 'bg-purple-600 text-white shadow-xl text-sm sm:text-lg animate-pulse';
    return base + 'bg-indigo-700 text-white shadow-2xl text-xs sm:text-base';
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6 py-4 flex flex-col items-center select-none">
        {/* Scores */}
        <div className="flex w-full justify-between items-center gap-4">
          <div className="flex gap-2">
            <div className="bg-muted px-4 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</div>
              <div className="text-xl font-extrabold">{score}</div>
            </div>
            <div className="bg-muted px-4 py-2 rounded-xl text-center min-w-[80px]">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Best</div>
              <div className="text-xl font-extrabold">{highScore}</div>
            </div>
          </div>
          <Button onClick={initGame} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Board Canvas Grid */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full bg-card border rounded-2xl p-3 grid grid-cols-4 gap-3 aspect-square shadow-xl relative overflow-hidden touch-none"
        >
          {board.map((row, r) =>
            row.map((val, c) => (
              <div key={`${r}-${c}`} className={getCellClasses(val)}>
                {val > 0 && val}
              </div>
            ))
          )}

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <h3 className="text-3xl font-extrabold text-destructive mb-2">Game Over</h3>
              <p className="text-muted-foreground mb-6">No more valid moves remaining.</p>
              <Button onClick={initGame} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          )}

          {hasWon && !gameOver && (
            <div className="absolute inset-0 bg-primary/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-primary-foreground animate-fade-in z-10">
              <Trophy className="w-16 h-16 mb-4 text-yellow-300 animate-bounce" />
              <h3 className="text-3xl font-extrabold mb-2">You Reached 2048!</h3>
              <p className="text-primary-foreground/85 mb-6">Congratulations! You did it.</p>
              <div className="flex gap-2">
                <Button onClick={() => setHasWon(false)} variant="secondary">
                  Keep Playing
                </Button>
                <Button onClick={initGame} variant="outline" className="bg-transparent border-primary-foreground hover:bg-primary-foreground/10 text-primary-foreground">
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile controls visual aid */}
        <div className="text-center text-xs text-muted-foreground">
          Use your <kbd className="px-1.5 py-0.5 border rounded bg-muted">Arrow Keys</kbd>, <kbd className="px-1.5 py-0.5 border rounded bg-muted">WASD</kbd>, or swipe to slide tiles.
        </div>
      </div>
    </ToolLayout>
  );
}
