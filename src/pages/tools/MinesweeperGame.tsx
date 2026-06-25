import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Check } from 'lucide-react';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type Difficulty = 'beginner' | 'intermediate' | 'expert';

export default function MinesweeperGame() {
  const tool = getToolById('minesweeper')!;

  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [minesCount, setMinesCount] = useState(10);
  const [flagsCount, setFlagsCount] = useState(0);
  
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstClick = useRef(true);

  // Difficulty settings
  const getParams = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner':
        return { rows: 9, cols: 9, mines: 10 };
      case 'intermediate':
        return { rows: 16, cols: 16, mines: 40 };
      case 'expert':
        return { rows: 16, cols: 30, mines: 99 };
    }
  };

  // Build empty board
  const initBoard = useCallback((diff: Difficulty) => {
    const { rows, cols, mines } = getParams(diff);
    const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (__, c) => ({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
    setBoard(cells);
    setMinesCount(mines);
    setFlagsCount(0);
    setGameState('playing');
    setTime(0);
    isFirstClick.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    initBoard('beginner');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initBoard]);

  // Set Timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  // Put mines and numbers (avoiding first clicked spot)
  const placeMines = (grid: Cell[][], startRow: number, startCol: number) => {
    const { rows, cols, mines } = getParams(difficulty);
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      // eslint-disable-next-line react-hooks/purity
      const r = Math.floor(Math.random() * rows);
      // eslint-disable-next-line react-hooks/purity
      const c = Math.floor(Math.random() * cols);

      // Do not place mines on the first clicked cell or its immediate neighbors
      const isStartArea = Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1;

      if (!grid[r][c].isMine && !isStartArea) {
        grid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Compute neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
  };

  // Flood fill reveal
  const revealCell = (grid: Cell[][], r: number, c: number) => {
    const { rows, cols } = getParams(difficulty);
    const queue = [{ r, c }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const cell = grid[current.r][current.c];
      if (cell.isRevealed || cell.isFlagged) continue;

      cell.isRevealed = true;

      if (cell.neighborMines === 0 && !cell.isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = current.r + dr;
            const nc = current.c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].isRevealed) {
              queue.push({ r: nr, c: nc });
            }
          }
        }
      }
    }
  };

  // Check Win Condition
  const checkWin = (grid: Cell[][]): boolean => {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (!cell.isMine && !cell.isRevealed) return false;
      }
    }
    return true;
  };

  // Handle Left Click
  const handleLeftClick = (r: number, c: number) => {
    if (gameState !== 'playing' || board[r][c].isRevealed || board[r][c].isFlagged) return;

    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (isFirstClick.current) {
      isFirstClick.current = false;
      placeMines(nextBoard, r, c);
      startTimer();
    }

    if (nextBoard[r][c].isMine) {
      // Hit a mine! Reveal all mines and trigger Game Over
      nextBoard.forEach((row) =>
        row.forEach((cell) => {
          if (cell.isMine) cell.isRevealed = true;
        })
      );
      setBoard(nextBoard);
      setGameState('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    revealCell(nextBoard, r, c);

    if (checkWin(nextBoard)) {
      setGameState('won');
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setBoard(nextBoard);
  };

  // Handle Right Click (Flagging)
  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[r][c].isRevealed) return;

    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = nextBoard[r][c];

    if (!cell.isFlagged && flagsCount >= minesCount) return; // Flag limit

    cell.isFlagged = !cell.isFlagged;
    setFlagsCount((f) => f + (cell.isFlagged ? 1 : -1));
    setBoard(nextBoard);
  };

  // Cell Colors depending on neighboring mines
  const getNumberColorClass = (count: number) => {
    switch (count) {
      case 1:
        return 'text-blue-500 font-bold';
      case 2:
        return 'text-green-600 font-bold';
      case 3:
        return 'text-red-500 font-bold';
      case 4:
        return 'text-purple-700 font-bold';
      case 5:
        return 'text-amber-800 font-bold';
      case 6:
        return 'text-teal-600 font-bold';
      case 7:
        return 'text-zinc-900 dark:text-zinc-50 font-bold';
      case 8:
        return 'text-gray-500 font-bold';
      default:
        return '';
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto space-y-6 py-2 flex flex-col items-center select-none">
        {/* Settings and Stats Bar */}
        <div className="flex w-full justify-between items-center flex-wrap gap-4 px-2">
          <div className="flex bg-muted p-1 rounded-xl">
            {(['beginner', 'intermediate', 'expert'] as const).map((diff) => (
              <Button
                key={diff}
                size="sm"
                variant={difficulty === diff ? 'default' : 'ghost'}
                className="capitalize rounded-lg"
                onClick={() => {
                  setDifficulty(diff);
                  initBoard(diff);
                }}
              >
                {diff}
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-sm font-bold">
              Mines: {minesCount - flagsCount}
            </div>
            <div className="bg-muted px-3 py-1.5 rounded-xl font-mono text-sm font-bold">
              Time: {time}s
            </div>
            <Button size="sm" variant="outline" onClick={() => initBoard(difficulty)} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Board */}
        <div className="w-full overflow-auto border p-4 bg-muted/20 dark:bg-zinc-950/20 rounded-2xl flex items-center justify-center shadow-lg">
          <div
            className="grid gap-1 bg-zinc-300 dark:bg-zinc-800 p-1.5 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${getParams(difficulty).cols}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row) =>
              row.map((cell) => {
                let cellContent: React.ReactNode = '';
                let cellClass = 'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-black transition-all cursor-pointer select-none rounded ';

                if (cell.isRevealed) {
                  if (cell.isMine) {
                    cellClass += 'bg-red-500 text-white';
                    cellContent = '💣';
                  } else {
                    cellClass += 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800';
                    cellContent = cell.neighborMines > 0 ? (
                      <span className={getNumberColorClass(cell.neighborMines)}>{cell.neighborMines}</span>
                    ) : (
                      ''
                    );
                  }
                } else {
                  cellClass += 'bg-zinc-200 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600 shadow-[inset_-1.5px_-1.5px_0px_#444,inset_1.5px_1.5px_0px_#fff]';
                  if (cell.isFlagged) {
                    cellContent = '🚩';
                  }
                }

                return (
                  <button
                    key={`${cell.r}-${cell.c}`}
                    onClick={() => handleLeftClick(cell.r, cell.c)}
                    onContextMenu={(e) => handleRightClick(e, cell.r, cell.c)}
                    className={cellClass}
                  >
                    {cellContent}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Game End Status overlay */}
        {gameState !== 'playing' && (
          <div className="rounded-2xl border bg-card p-6 w-full max-w-sm text-center space-y-4 shadow-xl">
            <h3 className="text-2xl font-extrabold flex items-center justify-center gap-2">
              {gameState === 'won' ? (
                <>
                  <Check className="w-6 h-6 text-emerald-500" />
                  Winner! Safe Cleared.
                </>
              ) : (
                'KABOOM! You Exploded.'
              )}
            </h3>
            <Button size="sm" onClick={() => initBoard(difficulty)} className="w-full">
              Play Again
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Left-click to reveal cells. Right-click to place red warning flags. First click is always safe.
        </div>
      </div>
    </ToolLayout>
  );
}
