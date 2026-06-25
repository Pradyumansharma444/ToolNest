import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Play, Pause } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20; // grid rendering unit pixels

// Tetromino definitions
const SHAPES: Record<string, number[][]> = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};

const COLORS: Record<string, string> = {
  I: '#06b6d4', // cyan
  O: '#eab308', // yellow
  T: '#a855f7', // purple
  S: '#22c55e', // green
  Z: '#ef4444', // red
  J: '#3b82f6', // blue
  L: '#f97316', // orange
};

interface Piece {
  shape: number[][];
  color: string;
  type: string;
  x: number;
  y: number;
}

export default function TetrisGame() {
  const tool = getToolById('tetris')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  const grid = useRef<string[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
  const currentPiece = useRef<Piece | null>(null);
  const nextPieceType = useRef<string>('T');
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpeed = useRef<number>(800);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('tetris_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const getRandomType = () => {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const spawnPiece = useCallback(() => {
    const type = nextPieceType.current;
    nextPieceType.current = getRandomType();

    const shape = SHAPES[type];
    currentPiece.current = {
      shape,
      color: COLORS[type],
      type,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: -1, // start slightly offscreen
    };

    drawNext();
  }, []);

  const resetGame = useCallback(() => {
    grid.current = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    nextPieceType.current = getRandomType();
    spawnPiece();
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(false);
    currentSpeed.current = 800;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    draw();
  }, [spawnPiece]);

  // Check collision helper
  const checkCollision = (px: number, py: number, shape: number[][]): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const nextX = px + c;
          const nextY = py + r;

          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }

          if (nextY >= 0 && grid.current[nextY][nextX] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Lock piece into board grid
  const lockPiece = () => {
    const p = currentPiece.current;
    if (!p) return;

    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c] !== 0) {
          const gridY = p.y + r;
          const gridX = p.x + c;

          if (gridY < 0) {
            setGameOver(true);
            setIsPlaying(false);
            return;
          }
          grid.current[gridY][gridX] = p.color;
        }
      }
    }

    clearLines();
    spawnPiece();
    if (checkCollision(currentPiece.current!.x, currentPiece.current!.y, currentPiece.current!.shape)) {
      setGameOver(true);
      setIsPlaying(false);
    }
  };

  // Check and clear rows
  const clearLines = () => {
    let linesCleared = 0;
    const nextGrid = grid.current.filter((row) => {
      const isFull = row.every((cell) => cell !== '');
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (nextGrid.length < ROWS) {
      nextGrid.unshift(Array(COLS).fill(''));
    }

    grid.current = nextGrid;

    if (linesCleared > 0) {
      const scores = [0, 100, 300, 500, 800]; // 1, 2, 3, 4 lines
      const points = scores[linesCleared] * level;
      const nextLines = lines + linesCleared;
      const nextLevel = Math.floor(nextLines / 10) + 1;

      setScore((s) => {
        const nextScore = s + points;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('tetris_high_score', nextScore.toString());
        }
        return nextScore;
      });
      setLines(nextLines);
      setLevel(nextLevel);
      // Speed up
      currentSpeed.current = Math.max(100, 800 - (nextLevel - 1) * 80);
    }
  };

  // Move controls
  const moveLeft = () => {
    const p = currentPiece.current;
    if (!p || gameOver || !isPlaying) return;
    if (!checkCollision(p.x - 1, p.y, p.shape)) {
      p.x -= 1;
      draw();
    }
  };

  const moveRight = () => {
    const p = currentPiece.current;
    if (!p || gameOver || !isPlaying) return;
    if (!checkCollision(p.x + 1, p.y, p.shape)) {
      p.x += 1;
      draw();
    }
  };

  const rotatePiece = () => {
    const p = currentPiece.current;
    if (!p || gameOver || !isPlaying) return;

    // Transpose and reverse rows
    const rotated = p.shape[0].map((_, c) => p.shape.map((row) => row[c]).reverse());

    if (!checkCollision(p.x, p.y, rotated)) {
      p.shape = rotated;
      draw();
    }
  };

  const moveDown = useCallback(() => {
    const p = currentPiece.current;
    if (!p || gameOver || !isPlaying) return;

    if (!checkCollision(p.x, p.y + 1, p.shape)) {
      p.y += 1;
      draw();
    } else {
      lockPiece();
    }
  }, [isPlaying, gameOver]);

  const hardDrop = () => {
    const p = currentPiece.current;
    if (!p || gameOver || !isPlaying) return;

    let dropY = p.y;
    while (!checkCollision(p.x, dropY + 1, p.shape)) {
      dropY++;
    }
    p.y = dropY;
    lockPiece();
    draw();
  };

  // Setup loop ticking
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, currentSpeed.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, moveDown]);

  // Render main screen
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw settled cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = grid.current[r][c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    // Draw active piece
    const p = currentPiece.current;
    if (p) {
      ctx.fillStyle = p.color;
      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (p.shape[r][c] !== 0) {
            const drawY = p.y + r;
            if (drawY >= 0) {
              ctx.fillRect((p.x + c) * BLOCK_SIZE, drawY * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
          }
        }
      }
    }
  }, []);

  // Render next preview
  const drawNext = () => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shape = SHAPES[nextPieceType.current];
    const color = COLORS[nextPieceType.current];

    ctx.fillStyle = color;
    const startX = (canvas.width - shape[0].length * BLOCK_SIZE) / 2;
    const startY = (canvas.height - shape.length * BLOCK_SIZE) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          ctx.fillRect(startX + c * BLOCK_SIZE, startY + r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }
  };

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Keyboard hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto py-2 select-none">
        
        {/* Left Side: Score panels */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="text-center bg-muted py-2 rounded-xl">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Score</div>
              <div className="text-2xl font-black">{score}</div>
              <div className="text-[10px] text-muted-foreground mt-1">High Score: {highScore}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-muted py-2 rounded-lg">
                <div className="text-muted-foreground">Lines</div>
                <div className="font-bold text-lg">{lines}</div>
              </div>
              <div className="bg-muted py-2 rounded-lg">
                <div className="text-muted-foreground">Level</div>
                <div className="font-bold text-lg">{level}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isPlaying ? 'outline' : 'default'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 gap-1.5"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button variant="outline" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center Canvas Grid */}
        <div className="flex justify-center">
          <div className="relative border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-zinc-950">
            <canvas
              ref={canvasRef}
              width={COLS * BLOCK_SIZE}
              height={ROWS * BLOCK_SIZE}
              className="block w-full max-w-[240px] aspect-[1/2]"
            />

            {gameOver && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <h3 className="text-3xl font-extrabold text-destructive mb-2">Game Over</h3>
                <p className="text-muted-foreground mb-6 font-semibold">Pile reached top.</p>
                <Button onClick={resetGame} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Restart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Next block preview */}
        <div className="space-y-4 flex flex-col justify-center items-center">
          <div className="rounded-xl border bg-card p-4 space-y-2 text-center w-full max-w-[140px]">
            <h4 className="font-bold text-xs text-muted-foreground uppercase">Next Piece</h4>
            <div className="border rounded-lg overflow-hidden bg-zinc-800">
              <canvas ref={nextCanvasRef} width={80} height={80} className="block mx-auto" />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground text-center space-y-1">
            <p>◄ / ► : Move Side</p>
            <p>▲ : Rotate Block</p>
            <p>▼ : Soft Drop</p>
            <p>Space : Hard Drop</p>
          </div>
        </div>
        
      </div>
    </ToolLayout>
  );
}
