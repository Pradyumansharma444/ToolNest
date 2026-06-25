import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Swords, User } from 'lucide-react';

type Board = (string | null)[];

export default function TicTacToe() {
  const tool = getToolById('tic-tac-toe')!;

  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'ai' | 'local'>('ai');
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];

  // Calculate winner
  const checkWinner = (currentBoard: Board): { winner: string | null; line: number[] | null } => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    return { winner: null, line: null };
  };

  const { winner, line } = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  // Minimax algorithm helper for unbeatable O AI
  const minimax = (tempBoard: Board, depth: number, isMaximizing: boolean): number => {
    const scoreState = checkWinner(tempBoard);
    if (scoreState.winner === 'O') return 10 - depth;
    if (scoreState.winner === 'X') return depth - 10;
    if (tempBoard.every((cell) => cell !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'O';
          const scoreVal = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          bestScore = Math.max(bestScore, scoreVal);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'X';
          const scoreVal = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          bestScore = Math.min(bestScore, scoreVal);
        }
      }
      return bestScore;
    }
  };

  // Find best move for O AI
  const makeAIMove = (currentBoard: Board) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const scoreVal = minimax(currentBoard, 0, false);
        currentBoard[i] = null;

        if (scoreVal > bestScore) {
          bestScore = scoreVal;
          bestMove = i;
        }
      }
    }

    if (bestMove !== -1) {
      const nextBoard = [...currentBoard];
      nextBoard[bestMove] = 'O';
      setBoard(nextBoard);

      const winResult = checkWinner(nextBoard);
      if (winResult.winner) {
        setScores((s) => ({ ...s, o: s.o + 1 }));
      } else if (nextBoard.every((cell) => cell !== null)) {
        setScores((s) => ({ ...s, ties: s.ties + 1 }));
      }

      setIsXNext(true);
    }
  };

  // Player action click
  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const nextBoard = [...board];
    const playerMark = isXNext ? 'X' : 'O';
    nextBoard[index] = playerMark;
    setBoard(nextBoard);

    const winResult = checkWinner(nextBoard);

    if (winResult.winner) {
      setScores((s) => {
        const next = { ...s };
        if (winResult.winner === 'X') next.x++;
        else next.o++;
        return next;
      });
      return;
    }

    const nextDraw = nextBoard.every((cell) => cell !== null);
    if (nextDraw) {
      setScores((s) => ({ ...s, ties: s.ties + 1 }));
      return;
    }

    if (gameMode === 'ai' && isXNext) {
      setIsXNext(false);
      // Wait a tiny bit then trigger AI turn
      setTimeout(() => {
        makeAIMove(nextBoard);
      }, 300);
    } else {
      setIsXNext(!isXNext);
    }
  };

  // Reset Grid
  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  // Reset entire record
  const resetScores = () => {
    resetBoard();
    setScores({ x: 0, o: 0, ties: 0 });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-sm mx-auto space-y-6 py-2 select-none">
        
        {/* Toggle Mode */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl w-full justify-center">
          <Button
            size="sm"
            variant={gameMode === 'ai' ? 'default' : 'ghost'}
            className="rounded-lg flex-1 gap-1.5"
            onClick={() => {
              setGameMode('ai');
              resetScores();
            }}
          >
            <User className="w-4 h-4" /> Vs Computer
          </Button>
          <Button
            size="sm"
            variant={gameMode === 'local' ? 'default' : 'ghost'}
            className="rounded-lg flex-1 gap-1.5"
            onClick={() => {
              setGameMode('local');
              resetScores();
            }}
          >
            <Swords className="w-4 h-4" /> Two Players
          </Button>
        </div>

        {/* Score tally board */}
        <div className="grid grid-cols-3 gap-2 w-full text-center text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border text-emerald-800 dark:text-emerald-400 py-2 rounded-xl">
            <div className="font-semibold uppercase tracking-wider text-[10px]">Player (X)</div>
            <div className="text-xl font-black">{scores.x}</div>
          </div>
          <div className="bg-muted border py-2 rounded-xl text-muted-foreground">
            <div className="font-semibold uppercase tracking-wider text-[10px]">Ties</div>
            <div className="text-xl font-black">{scores.ties}</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 border text-rose-800 dark:text-rose-400 py-2 rounded-xl">
            <div className="font-semibold uppercase tracking-wider text-[10px]">
              {gameMode === 'ai' ? 'Computer (O)' : 'Player (O)'}
            </div>
            <div className="text-xl font-black">{scores.o}</div>
          </div>
        </div>

        {/* Board grid 3x3 */}
        <div className="w-full aspect-square grid grid-cols-3 gap-3 bg-muted/40 p-4 border rounded-2xl shadow-xl">
          {board.map((cell, index) => {
            const isWinningCell = line?.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`w-full aspect-square rounded-xl bg-card border flex items-center justify-center text-4xl font-black transition-all ${
                  isWinningCell
                    ? 'bg-primary border-primary text-white shadow-lg scale-95'
                    : cell === 'X'
                    ? 'text-emerald-500 hover:bg-muted/10'
                    : cell === 'O'
                    ? 'text-rose-500 hover:bg-muted/10'
                    : 'hover:bg-muted/20 hover:scale-95'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Notifications and reset */}
        <div className="flex w-full items-center justify-between gap-4">
          <div className="font-semibold text-sm">
            {winner ? (
              <span className="text-primary font-bold">{winner} Wins the game!</span>
            ) : isDraw ? (
              <span className="text-muted-foreground">It's a draw!</span>
            ) : (
              <span>Turn: {isXNext ? 'X' : 'O'}</span>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={resetBoard} className="gap-1.5">
            <RotateCcw className="w-4 h-4" /> Next Round
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
