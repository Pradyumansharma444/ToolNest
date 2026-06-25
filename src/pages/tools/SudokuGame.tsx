import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, PenTool, Lightbulb } from 'lucide-react';

type Grid = number[][];

// Sudoku Generator Helpers
function isValid(grid: Grid, r: number, c: number, val: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === val) return false;
    if (grid[i][c] === val) return false;
    const boxRow = 3 * Math.floor(r / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(c / 3) + (i % 3);
    if (grid[boxRow][boxCol] === val) return false;
  }
  return true;
}

function solveSudoku(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        // shuffle possible choices to randomize generation
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const val of nums) {
          if (isValid(grid, r, c, val)) {
            grid[r][c] = val;
            if (solveSudoku(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateCompleteGrid(): Grid {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(grid);
  return grid;
}

function removeCells(completeGrid: Grid, cellsToRemove: number): Grid {
  const result = completeGrid.map((row) => [...row]);
  let removed = 0;
  while (removed < cellsToRemove) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (result[r][c] !== 0) {
      result[r][c] = 0;
      removed++;
    }
  }
  return result;
}

export default function SudokuGame() {
  const tool = getToolById('sudoku')!;
  const { toast } = useToast();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [initData] = useState(() => {
    const complete = generateCompleteGrid();
    const initial = removeCells(complete, 28);
    return {
      completeBoard: complete,
      initialBoard: initial,
      currentBoard: initial.map((row) => [...row]),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[])),
    };
  });
  const [completeBoard, setCompleteBoard] = useState(initData.completeBoard);
  const [initialBoard, setInitialBoard] = useState(initData.initialBoard);
  const [currentBoard, setCurrentBoard] = useState(initData.currentBoard);
  const [notes, setNotes] = useState(initData.notes);
  
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [time, setTime] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Initialize Game
  const startNewGame = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(diff);
    const complete = generateCompleteGrid();
    let removeCount = 35;
    if (diff === 'easy') removeCount = 28;
    if (diff === 'hard') removeCount = 48;
    const initial = removeCells(complete, removeCount);
    setCompleteBoard(complete);
    setInitialBoard(initial);
    setCurrentBoard(initial.map((row) => [...row]));
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    setSelectedCell(null);
    setTime(0);
    setGameActive(true);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check board matches complete board
  const checkWin = (boardToCheck: Grid) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (boardToCheck[r][c] !== completeBoard[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  // Handle cell edit
  const editCell = useCallback((val: number) => {
    if (!selectedCell || !gameActive) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return; // Cannot edit original values

    if (notesMode) {
      if (val === 0) {
        setNotes((prev) => {
          const next = prev.map((row) => row.map((arr) => [...arr]));
          next[r][c] = [];
          return next;
        });
        return;
      }
      setNotes((prev) => {
        const next = prev.map((row) => row.map((arr) => [...arr]));
        const index = next[r][c].indexOf(val);
        if (index > -1) {
          next[r][c].splice(index, 1);
        } else {
          next[r][c].push(val);
        }
        return next;
      });
    } else {
      const nextBoard = currentBoard.map((row, idx) => {
        if (idx === r) {
          const nextRow = [...row];
          nextRow[c] = val;
          return nextRow;
        }
        return [...row];
      });
      setCurrentBoard(nextBoard);

      // Check win condition
      if (checkWin(nextBoard)) {
        setGameActive(false);
        toast({ title: 'Congratulations! You solved the Sudoku!', description: `Solved in ${formatTime(time)}` });
      }
    }
  }, [selectedCell, initialBoard, notesMode, currentBoard, gameActive, completeBoard, time, toast, checkWin]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (e.key >= '1' && e.key <= '9') {
        editCell(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        editCell(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editCell]);

  // Give Hint
  const handleHint = () => {
    if (!selectedCell || !gameActive) {
      toast({ title: 'Select an empty cell first', variant: 'destructive' });
      return;
    }
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    const correctValue = completeBoard[r][c];
    const nextBoard = currentBoard.map((row, rIdx) => {
      if (rIdx === r) {
        const nextRow = [...row];
        nextRow[c] = correctValue;
        return nextRow;
      }
      return [...row];
    });
    setCurrentBoard(nextBoard);

    if (checkWin(nextBoard)) {
      setGameActive(false);
      toast({ title: 'Congratulations! Solved via hints!' });
    }
  };

  // Conflict Checking helper
  const hasConflict = (r: number, c: number, val: number) => {
    if (val === 0) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && currentBoard[r][i] === val) return true;
      if (i !== r && currentBoard[i][c] === val) return true;
      const boxRow = 3 * Math.floor(r / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(c / 3) + (i % 3);
      if ((boxRow !== r || boxCol !== c) && currentBoard[boxRow][boxCol] === val) return true;
    }
    return false;
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto space-y-6 py-2 select-none flex flex-col items-center">
        {/* Settings Bar */}
        <div className="flex w-full justify-between items-center flex-wrap gap-3">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <Button
                key={diff}
                size="sm"
                variant={difficulty === diff ? 'default' : 'ghost'}
                className="capitalize rounded-lg px-3"
                onClick={() => startNewGame(diff)}
              >
                {diff}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-bold bg-muted px-3 py-1.5 rounded-xl">{formatTime(time)}</span>
            <Button size="sm" variant="outline" onClick={() => startNewGame(difficulty)} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Sudoku 9x9 Grid Board */}
        <div className="w-full max-w-[420px] aspect-square bg-card border-2 border-foreground rounded-2xl grid grid-cols-9 overflow-hidden shadow-xl">
          {currentBoard.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isOriginal = initialBoard[r][c] !== 0;
              const conflict = hasConflict(r, c, val);
              
              // Thick borders for 3x3 boxes
              const borderRight = (c === 2 || c === 5) ? 'border-r-2 border-r-foreground' : 'border-r border-border';
              const borderBottom = (r === 2 || r === 5) ? 'border-b-2 border-b-foreground' : 'border-b border-border';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell({ r, c })}
                  className={`w-full h-full flex items-center justify-center relative transition-colors ${borderRight} ${borderBottom} ${
                    isSelected ? 'bg-primary/20' : conflict ? 'bg-destructive/10' : 'bg-transparent hover:bg-muted/40'
                  }`}
                >
                  {val !== 0 ? (
                    <span
                      className={`text-lg sm:text-xl font-bold ${
                        isOriginal ? 'text-foreground font-extrabold' : conflict ? 'text-destructive' : 'text-primary'
                      }`}
                    >
                      {val}
                    </span>
                  ) : (
                    // Render Notes
                    <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5 text-[9px] leading-none text-muted-foreground/80 font-mono">
                      {Array.from({ length: 9 }).map((_, n) => {
                        const num = n + 1;
                        const hasNote = notes[r]?.[c]?.includes(num);
                        return <div key={num}>{hasNote ? num : ''}</div>;
                      })}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[420px]">
          <Button
            size="sm"
            variant={notesMode ? 'default' : 'outline'}
            onClick={() => setNotesMode(!notesMode)}
            className="gap-2"
          >
            <PenTool className="w-4 h-4" />
            Notes: {notesMode ? 'ON' : 'OFF'}
          </Button>

          <Button size="sm" variant="outline" onClick={handleHint} className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Hint
          </Button>

          <Button size="sm" variant="outline" onClick={() => editCell(0)} className="gap-2">
            Clear Cell
          </Button>
        </div>

        {/* Input Number Buttons */}
        <div className="flex gap-1.5 justify-center w-full max-w-[420px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => editCell(num)}
              className="flex-1 aspect-square rounded-xl bg-muted border border-border text-foreground font-bold hover:bg-primary hover:text-white transition-all text-base sm:text-lg flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
