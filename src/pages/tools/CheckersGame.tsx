import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw } from 'lucide-react';

interface Piece {
  id: string;
  color: 'w' | 'b'; // White (Player) or Black (AI)
  isKing: boolean;
  r: number;
  c: number;
}

type BoardState = (Piece | null)[][];
type Position = { r: number; c: number };

export default function CheckersGame() {
  const tool = getToolById('checkers')!;
  const { toast } = useToast();

  const [board, setBoard] = useState<BoardState>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [captured, setCaptured] = useState<{ w: number; b: number }>({ w: 0, b: 0 });
  const [gameOver, setGameOver] = useState<string | null>(null);

  // Initialize Checkers board layout
  const initGame = useCallback(() => {
    const initialPieces: Piece[] = [];
    let idCounter = 1;

    // Black pieces at top rows 0, 1, 2
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          initialPieces.push({
            id: `b${idCounter++}`,
            color: 'b',
            isKing: false,
            r,
            c,
          });
        }
      }
    }

    // White pieces at bottom rows 5, 6, 7
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          initialPieces.push({
            id: `w${idCounter++}`,
            color: 'w',
            isKing: false,
            r,
            c,
          });
        }
      }
    }

    setPieces(initialPieces);
    setTurn('w');
    setSelectedPiece(null);
    setValidMoves([]);
    setCaptured({ w: 0, b: 0 });
    setGameOver(null);
  }, []);

  useEffect(() => {
    initGame(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [initGame]);

  // Sync board array representation
  useEffect(() => {
    const grid: BoardState = Array.from({ length: 8 }, () => Array(8).fill(null));
    pieces.forEach((p) => {
      grid[p.r][p.c] = p;
    });
    setBoard(grid); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pieces]);

  // Is move coordinates on board
  const isOnBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  // Find all possible captures for a given player color
  const getCapturesForColor = useCallback((color: 'w' | 'b', currentPieces: Piece[]): { piece: Piece; targets: Position[] }[] => {
    const grid: BoardState = Array.from({ length: 8 }, () => Array(8).fill(null));
    currentPieces.forEach((p) => {
      grid[p.r][p.c] = p;
    });

    const captures: { piece: Piece; targets: Position[] }[] = [];

    currentPieces.forEach((p) => {
      if (p.color !== color) return;
      const targets: Position[] = [];

      // Directions
      const rowDirs = p.isKing ? [-1, 1] : color === 'w' ? [-1] : [1];
      const colDirs = [-1, 1];

      rowDirs.forEach((dr) => {
        colDirs.forEach((dc) => {
          const enemyRow = p.r + dr;
          const enemyCol = p.c + dc;
          const landingRow = p.r + 2 * dr;
          const landingCol = p.c + 2 * dc;

          if (isOnBoard(landingRow, landingCol)) {
            const enemy = grid[enemyRow][enemyCol];
            const landing = grid[landingRow][landingCol];

            if (enemy && enemy.color !== color && !landing) {
              targets.push({ r: landingRow, c: landingCol });
            }
          }
        });
      });

      if (targets.length > 0) {
        captures.push({ piece: p, targets });
      }
    });

    return captures;
  }, []);

  // Find normal slides for a piece
  const getSlidesForPiece = useCallback((p: Piece, grid: BoardState): Position[] => {
    const slides: Position[] = [];
    const rowDirs = p.isKing ? [-1, 1] : p.color === 'w' ? [-1] : [1];
    const colDirs = [-1, 1];

    rowDirs.forEach((dr) => {
      colDirs.forEach((dc) => {
        const nr = p.r + dr;
        const nc = p.c + dc;
        if (isOnBoard(nr, nc) && !grid[nr][nc]) {
          slides.push({ r: nr, c: nc });
        }
      });
    });

    return slides;
  }, []);

  // Compute allowed moves for a selected piece (enforces mandatory captures rule)
  const getLegalMoves = useCallback((p: Piece, currentPieces: Piece[]): Position[] => {
    const colorCaptures = getCapturesForColor(p.color, currentPieces);

    if (colorCaptures.length > 0) {
      // Must capture! Find if this specific piece has any captures
      const match = colorCaptures.find((c) => c.piece.id === p.id);
      return match ? match.targets : [];
    }

    // No captures available globally, normal sliding moves are legal
    const grid: BoardState = Array.from({ length: 8 }, () => Array(8).fill(null));
    currentPieces.forEach((item) => {
      grid[item.r][item.c] = item;
    });

    return getSlidesForPiece(p, grid);
  }, [getCapturesForColor, getSlidesForPiece]);

  // Execute checker move
  const executeMove = useCallback((p: Piece, to: Position) => {
    const isJump = Math.abs(to.r - p.r) === 2;
    let nextPieces = pieces.map((item) => {
      if (item.id === p.id) {
        const isNowKing = p.isKing || (p.color === 'w' && to.r === 0) || (p.color === 'b' && to.r === 7);
        return { ...item, r: to.r, c: to.c, isKing: isNowKing };
      }
      return item;
    });

    // Handle captures
    if (isJump) {
      const enemyRow = (p.r + to.r) / 2;
      const enemyCol = (p.c + to.c) / 2;

      nextPieces = nextPieces.filter((item) => {
        return !(item.r === enemyRow && item.c === enemyCol);
      });

      setCaptured((prev) => {
        const next = { ...prev };
        if (p.color === 'w') next.b++;
        else next.w++;
        return next;
      });
    }

    setPieces(nextPieces);
    setSelectedPiece(null);
    setValidMoves([]);

    const nextTurn = p.color === 'w' ? 'b' : 'w';

    // Verify win/loss
    const opponentPieces = nextPieces.filter((item) => item.color === nextTurn);
    if (opponentPieces.length === 0) {
      setGameOver(p.color === 'w' ? 'Player (White) Wins!' : 'Computer (Black) Wins!');
      return;
    }

    // Check if opponent has any legal moves left
    let hasMoves = false;
    for (const opp of opponentPieces) {
      if (getLegalMoves(opp, nextPieces).length > 0) {
        hasMoves = true;
        break;
      }
    }

    if (!hasMoves) {
      setGameOver(p.color === 'w' ? 'Player Wins! Opponent is blocked.' : 'Computer Wins! Player is blocked.');
      return;
    }

    setTurn(nextTurn);
  }, [pieces, getLegalMoves]);

  // AI execution
  useEffect(() => {
    if (turn === 'b' && !gameOver) {
      const timer = setTimeout(() => {
        // Collect all legal moves for AI (Black)
        const aiOptions: { piece: Piece; target: Position; score: number }[] = [];
        const blackPieces = pieces.filter((p) => p.color === 'b');

        blackPieces.forEach((p) => {
          const targets = getLegalMoves(p, pieces);
          targets.forEach((target) => {
            const isJump = Math.abs(target.r - p.r) === 2;
            // Prioritize jumps/captures, and moving king-eligible spots
            let score = isJump ? 100 : 10;
            if (!p.isKing && target.r === 7) score += 50; // Promote weight
            aiOptions.push({ piece: p, target, score });
          });
        });

        if (aiOptions.length > 0) {
          // Sort and pick highest scoring AI path
          aiOptions.sort((a, b) => b.score - a.score);
          const chosen = aiOptions[0];
          executeMove(chosen.piece, chosen.target);
        } else {
          setGameOver('Player Wins! Computer cannot move.');
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, pieces, gameOver, getLegalMoves, executeMove]);

  // Cell clicks
  const handleSquareClick = (r: number, c: number) => {
    if (turn !== 'w' || gameOver) return;

    const cell = board[r]?.[c];

    // If target space is clicked
    if (selectedPiece && validMoves.some((m) => m.r === r && m.c === c)) {
      executeMove(selectedPiece, { r, c });
      return;
    }

    // Select piece
    if (cell && cell.color === 'w') {
      const legals = getLegalMoves(cell, pieces);
      setSelectedPiece(cell);
      setValidMoves(legals);

      if (legals.length === 0) {
        // Warn if user must capture else where
        const globalCaptures = getCapturesForColor('w', pieces);
        if (globalCaptures.length > 0) {
          toast({ title: 'Mandatory Jump Available!', description: 'You must select a piece that can capture.' });
        }
      }
    } else {
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto py-2 space-y-6 select-none">
        
        {/* Top Header stats */}
        <div className="flex w-full justify-between items-center gap-4 px-2">
          <div className="flex gap-4">
            <div className="bg-muted px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">White Captured</div>
              <div className="text-xl font-extrabold">{captured.b}</div>
            </div>
            <div className="bg-muted px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Black Captured</div>
              <div className="text-xl font-extrabold">{captured.w}</div>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={initGame} className="gap-1.5">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Board grid 8x8 */}
        <div className="w-full max-w-[380px] aspect-square grid grid-cols-8 border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-zinc-700">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((__, c) => {
              const isDarkSquare = (r + c) % 2 === 1;
              const cell = board[r]?.[c];
              const isSelected = selectedPiece?.id === cell?.id && cell !== null;
              const isValidTarget = validMoves.some((m) => m.r === r && m.c === c);

              let squareClass = 'w-full h-full flex items-center justify-center relative transition-all select-none ';
              if (!isDarkSquare) {
                squareClass += 'bg-zinc-200 dark:bg-zinc-600';
              } else {
                squareClass += isSelected ? 'bg-amber-300 dark:bg-amber-800' : 'bg-zinc-800 dark:bg-zinc-900 cursor-pointer';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => isDarkSquare && handleSquareClick(r, c)}
                  className={squareClass}
                >
                  {/* Pieces visual */}
                  {cell && (
                    <div
                      className={`w-[75%] h-[75%] rounded-full shadow-lg flex items-center justify-center relative transition-transform duration-100 ${
                        cell.color === 'w'
                          ? 'bg-zinc-50 border-2 border-zinc-400 text-zinc-800'
                          : 'bg-red-600 border-2 border-red-800 text-white'
                      }`}
                    >
                      {cell.isKing && (
                        <span className="text-sm sm:text-lg">👑</span>
                      )}
                      <div className="absolute inset-[10%] rounded-full border border-current opacity-30" />
                    </div>
                  )}

                  {/* Move markers */}
                  {isValidTarget && (
                    <div className="absolute w-4 h-4 rounded-full bg-emerald-500 shadow-md border-2 border-white" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* End Game Status */}
        <div className="text-center font-bold text-base">
          {gameOver ? (
            <span className="text-destructive font-black text-lg">{gameOver}</span>
          ) : (
            <span>Turn: {turn === 'w' ? 'Your Move (White)' : 'Computer plays (Black)...'}</span>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground max-w-sm">
          Red piece is Black (AI), white is player. Diagonal slide moves only. Forced capture rule applies.
        </div>
      </div>
    </ToolLayout>
  );
}
