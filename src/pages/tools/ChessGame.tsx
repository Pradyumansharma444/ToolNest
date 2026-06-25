import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, AlertTriangle } from 'lucide-react';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

type BoardState = (Piece | null)[][];
type Position = { r: number; c: number };

// Initial board layout
const createInitialBoard = (): BoardState => {
  const backRow = (color: PieceColor): (Piece | null)[] => [
    { type: 'r', color, hasMoved: false },
    { type: 'n', color },
    { type: 'b', color },
    { type: 'q', color },
    { type: 'k', color, hasMoved: false },
    { type: 'b', color },
    { type: 'n', color },
    { type: 'r', color, hasMoved: false },
  ];
  const pawnRow = (color: PieceColor): (Piece | null)[] =>
    Array(8).fill(null).map(() => ({ type: 'p', color, hasMoved: false }));

  return [
    backRow('b'),
    pawnRow('b'),
    ...Array(4).fill(null).map(() => Array(8).fill(null)),
    pawnRow('w'),
    backRow('w'),
  ];
};

export default function ChessGame() {
  const tool = getToolById('chess')!;


  const [board, setBoard] = useState<BoardState>([]);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium'>('easy');
  
  const [capturedPieces, setCapturedPieces] = useState<{ w: Piece[]; b: Piece[] }>({ w: [], b: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);

  const initGame = useCallback(() => {
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedCell(null);
    setValidMoves([]);
    setCapturedPieces({ w: [], b: [] });
    setMoveHistory([]);
    setGameOver(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Chess Symbols Dictionary
  const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
    w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
  };

  // Check if position is on board
  const isOnBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  // Generate pseudolegal moves for a piece (simplified helper)
  const getMoves = useCallback((pos: Position, currentBoard: BoardState): Position[] => {
    const piece = currentBoard[pos.r][pos.c];
    if (!piece) return [];
    const color = piece.color;
    const moves: Position[] = [];

    const addMoveIfValid = (r: number, c: number) => {
      if (!isOnBoard(r, c)) return false;
      const target = currentBoard[r][c];
      if (!target) {
        moves.push({ r, c });
        return true; // continue sliding
      }
      if (target.color !== color) {
        moves.push({ r, c });
      }
      return false; // hit piece, stop sliding
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        // forward 1
        if (isOnBoard(pos.r + dir, pos.c) && !currentBoard[pos.r + dir][pos.c]) {
          moves.push({ r: pos.r + dir, c: pos.c });
          // double forward
          if (!piece.hasMoved && isOnBoard(pos.r + 2 * dir, pos.c) && !currentBoard[pos.r + 2 * dir][pos.c]) {
            moves.push({ r: pos.r + 2 * dir, c: pos.c });
          }
        }
        // captures
        const cols = [pos.c - 1, pos.c + 1];
        cols.forEach((col) => {
          if (isOnBoard(pos.r + dir, col)) {
            const target = currentBoard[pos.r + dir][col];
            if (target && target.color !== color) {
              moves.push({ r: pos.r + dir, c: col });
            }
          }
        });
        break;
      }
      case 'r': {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        dirs.forEach(([dr, dc]) => {
          let r = pos.r + dr;
          let c = pos.c + dc;
          while (isOnBoard(r, c)) {
            if (!addMoveIfValid(r, c)) break;
            r += dr;
            c += dc;
          }
        });
        break;
      }
      case 'n': {
        const leaps = [
          [2, 1], [2, -1], [-2, 1], [-2, -1],
          [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        leaps.forEach(([dr, dc]) => {
          addMoveIfValid(pos.r + dr, pos.c + dc);
        });
        break;
      }
      case 'b': {
        const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        dirs.forEach(([dr, dc]) => {
          let r = pos.r + dr;
          let c = pos.c + dc;
          while (isOnBoard(r, c)) {
            if (!addMoveIfValid(r, c)) break;
            r += dr;
            c += dc;
          }
        });
        break;
      }
      case 'q': {
        const dirs = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        dirs.forEach(([dr, dc]) => {
          let r = pos.r + dr;
          let c = pos.c + dc;
          while (isOnBoard(r, c)) {
            if (!addMoveIfValid(r, c)) break;
            r += dr;
            c += dc;
          }
        });
        break;
      }
      case 'k': {
        const dirs = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        dirs.forEach(([dr, dc]) => {
          addMoveIfValid(pos.r + dr, pos.c + dc);
        });
        break;
      }
    }
    return moves;
  }, []);

  // Check if King is in Check (simplified)
  const isKingInCheck = useCallback((color: PieceColor, currentBoard: BoardState): boolean => {
    // Find king
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingPos = { r, c };
          break;
        }
      }
    }
    if (!kingPos) return false;

    // Check if any opponent piece can capture the king
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color !== color) {
          const attacks = getMoves({ r, c }, currentBoard);
          if (attacks.some((move) => move.r === kingPos!.r && move.c === kingPos!.c)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [getMoves]);

  // Filter moves that resolve check
  const getLegalMoves = useCallback((pos: Position, currentBoard: BoardState): Position[] => {
    const moves = getMoves(pos, currentBoard);
    const piece = currentBoard[pos.r][pos.c];
    if (!piece) return [];

    return moves.filter((move) => {
      // Simulate move
      const nextBoard = currentBoard.map((row) => [...row]);
      nextBoard[move.r][move.c] = piece;
      nextBoard[pos.r][pos.c] = null;
      return !isKingInCheck(piece.color, nextBoard);
    });
  }, [getMoves, isKingInCheck]);

  // Make Chess Move
  const executeMove = useCallback((from: Position, to: Position) => {
    const p = board[from.r][from.c];
    if (!p) return;

    const target = board[to.r][to.c];
    const nextBoard = board.map((row) => [...row]);
    
    // Move piece
    nextBoard[to.r][to.c] = { ...p, hasMoved: true };
    nextBoard[from.r][from.c] = null;

    setBoard(nextBoard);

    // Captured pieces log
    if (target) {
      setCapturedPieces((prev) => {
        const next = { ...prev };
        if (target.color === 'w') {
          next.w = [...next.w, target];
        } else {
          next.b = [...next.b, target];
        }
        return next;
      });
    }

    // Move history
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const notation = `${p.type.toUpperCase()}${files[from.c]}${ranks[from.r]}→${files[to.c]}${ranks[to.r]}`;
    setMoveHistory((prev) => [...prev, notation]);

    // Next turn
    const nextTurn: PieceColor = turn === 'w' ? 'b' : 'w';
    setTurn(nextTurn);
    setSelectedCell(null);
    setValidMoves([]);

    // Check game conditions
    const hasAnyLegalMoves = (color: PieceColor) => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const pieceOnCell = nextBoard[r][c];
          if (pieceOnCell && pieceOnCell.color === color) {
            if (getLegalMoves({ r, c }, nextBoard).length > 0) return true;
          }
        }
      }
      return false;
    };

    if (!hasAnyLegalMoves(nextTurn)) {
      if (isKingInCheck(nextTurn, nextBoard)) {
        setGameOver(turn === 'w' ? 'White wins by Checkmate!' : 'Black wins by Checkmate!');
      } else {
        setGameOver('Stalemate! Game is a draw.');
      }
    }
  }, [board, turn, getLegalMoves, isKingInCheck]);

  // AI Opponent Move
  useEffect(() => {
    if (turn === 'b' && !gameOver) {
      const timer = setTimeout(() => {
        // Find all possible legal moves for Black
        const blackMoves: { from: Position; to: Position; score: number }[] = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r]?.[c];
            if (p && p.color === 'b') {
              const legals = getLegalMoves({ r, c }, board);
              legals.forEach((to) => {
                // Value scoring
                let score = 0;
                const target = board[to.r][to.c];
                if (target) {
                  const vals = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
                  score += vals[target.type];
                }
                blackMoves.push({ from: { r, c }, to, score });
              });
            }
          }
        }

        if (blackMoves.length > 0) {
          let chosen = blackMoves[0];
          if (aiDifficulty === 'medium') {
            // Pick highest scoring move
            blackMoves.sort((a, b) => b.score - a.score);
            chosen = blackMoves[0];
          } else {
            // Simple random selection
            chosen = blackMoves[Math.floor(Math.random() * blackMoves.length)];
          }
          executeMove(chosen.from, chosen.to);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, board, gameOver, aiDifficulty, getLegalMoves, executeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (turn !== 'w' || gameOver) return; // Player is White

    const cell = board[r][c];

    // If a valid move is clicked
    if (selectedCell && validMoves.some((m) => m.r === r && m.c === c)) {
      executeMove(selectedCell, { r, c });
      return;
    }

    // Select White piece
    if (cell && cell.color === 'w') {
      setSelectedCell({ r, c });
      setValidMoves(getLegalMoves({ r, c }, board));
    } else {
      setSelectedCell(null);
      setValidMoves([]);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto py-2">
        
        {/* Left Side: Captured & Difficulties */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="font-bold text-sm text-muted-foreground uppercase">AI Settings</h4>
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                variant={aiDifficulty === 'easy' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAiDifficulty('easy')}
              >
                Easy (Random)
              </Button>
              <Button
                size="sm"
                variant={aiDifficulty === 'medium' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setAiDifficulty('medium')}
              >
                Medium (Heuristic)
              </Button>
            </div>
            <Button size="sm" variant="outline" className="w-full gap-2" onClick={initGame}>
              <RotateCcw className="w-4 h-4" /> Reset Match
            </Button>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="font-bold text-sm text-muted-foreground uppercase">Captured Pieces</h4>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Captured by Player (White):</div>
              <div className="text-xl flex flex-wrap gap-0.5">{capturedPieces.b.map((p) => pieceSymbols.b[p.type])}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Captured by AI (Black):</div>
              <div className="text-xl flex flex-wrap gap-0.5">{capturedPieces.w.map((p) => pieceSymbols.w[p.type])}</div>
            </div>
          </div>
        </div>

        {/* Center Chessboard Grid */}
        <div className="md:col-span-2 flex flex-col items-center justify-center">
          <div className="w-full max-w-[420px] aspect-square grid grid-cols-8 border-4 border-foreground rounded-xl overflow-hidden shadow-2xl bg-zinc-400">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isDarkSquare = (r + c) % 2 === 1;
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const isValidTarget = validMoves.some((m) => m.r === r && m.c === c);

                let squareClass = 'w-full h-full flex items-center justify-center relative cursor-pointer text-3xl sm:text-4xl transition-all select-none ';
                if (isSelected) {
                  squareClass += 'bg-amber-300 dark:bg-amber-800';
                } else if (isValidTarget) {
                  squareClass += 'bg-emerald-400/50 dark:bg-emerald-800/50 hover:bg-emerald-500/70';
                } else {
                  squareClass += isDarkSquare ? 'bg-zinc-600 dark:bg-zinc-800' : 'bg-zinc-200 dark:bg-zinc-600';
                }

                return (
                  <div key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} className={squareClass}>
                    {piece && (
                      <span
                        className={`transition-transform duration-100 ${
                          piece.color === 'w'
                            ? 'text-zinc-50 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]'
                            : 'text-zinc-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                        }`}
                      >
                        {pieceSymbols[piece.color][piece.type]}
                      </span>
                    )}
                    {isValidTarget && !piece && (
                      <div className="absolute w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 text-center text-sm font-semibold">
            {gameOver ? (
              <span className="text-destructive font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {gameOver}</span>
            ) : (
              <span>Turn: {turn === 'w' ? 'Player (White)' : 'AI thinking...'}</span>
            )}
          </div>
        </div>

        {/* Right Side: Move Logs */}
        <div className="md:col-span-1 rounded-xl border bg-card p-4 space-y-3 flex flex-col max-h-[440px]">
          <h4 className="font-bold text-sm text-muted-foreground uppercase flex-shrink-0">Move History</h4>
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs max-h-[350px] pr-2">
            {moveHistory.map((notation, index) => (
              <div key={index} className="flex justify-between border-b py-0.5">
                <span className="text-muted-foreground">Round {Math.floor(index / 2) + 1}</span>
                <span className="font-bold">{notation}</span>
              </div>
            ))}
            {moveHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No moves logged yet.</div>
            )}
          </div>
        </div>
        
      </div>
    </ToolLayout>
  );
}
