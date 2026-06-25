import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Play, Pause } from 'lucide-react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const TILE_COUNT = 20;

export default function SnakeGame() {
  const tool = getToolById('snake')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [speed, setSpeed] = useState<number>(100); // ms per tick

  const snake = useRef<Position[]>([{ x: 10, y: 10 }]);
  const food = useRef<Position>({ x: 5, y: 5 });
  const direction = useRef<Direction>('RIGHT');
  const nextDirection = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food spot
  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT),
      };
    } while (snake.current.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    food.current = newFood;
  }, []);

  // Reset Game
  const resetGame = useCallback(() => {
    snake.current = [{ x: 10, y: 10 }];
    direction.current = 'RIGHT';
    nextDirection.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    generateFood();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  }, [generateFood]);

  // Render on Canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board
    ctx.fillStyle = '#18181b'; // dark zinc
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ef4444'; // red
    ctx.beginPath();
    ctx.arc(
      food.current.x * GRID_SIZE + GRID_SIZE / 2,
      food.current.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw Snake
    snake.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#34d399'; // head emerald, body lighter green
      ctx.beginPath();
      ctx.roundRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2,
        4
      );
      ctx.fill();
    });
  }, []);

  // Main game logic loop step
  const gameTick = useCallback(() => {
    if (gameOver || !isPlaying) return;

    direction.current = nextDirection.current;
    const head = { ...snake.current[0] };

    switch (direction.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check Wall Collisions
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Check Self Collisions
    if (snake.current.some((segment) => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    const nextSnake = [head, ...snake.current];

    // Check Food Collision
    if (head.x === food.current.x && head.y === food.current.y) {
      const newScore = score + 10;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('snake_high_score', newScore.toString());
      }
      generateFood();
      // Increase speed slightly
      setSpeed((s) => Math.max(50, s - 2));
    } else {
      nextSnake.pop();
    }

    snake.current = nextSnake;
    draw();
  }, [isPlaying, gameOver, score, highScore, generateFood]);

  // Handle Tick Timer
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameTick, speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, gameTick, speed]);

  // Update canvas on start
  useEffect(() => {
    draw();
  }, [draw]);

  // Keyboard Steer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.current !== 'DOWN') nextDirection.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.current !== 'UP') nextDirection.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.current !== 'RIGHT') nextDirection.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.current !== 'LEFT') nextDirection.current = 'RIGHT';
          break;
        case ' ':
          setIsPlaying((p) => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto py-2 space-y-6 select-none">
        
        {/* Stats and controls */}
        <div className="flex w-full justify-between items-center gap-4 px-2">
          <div className="flex gap-4">
            <div className="bg-muted px-4 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Score</div>
              <div className="text-lg font-extrabold">{score}</div>
            </div>
            <div className="bg-muted px-4 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Best</div>
              <div className="text-lg font-extrabold">{highScore}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isPlaying ? 'outline' : 'default'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-1.5"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Start'}
            </Button>
            <Button size="sm" variant="outline" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Board */}
        <div className="relative border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-zinc-950">
          <canvas
            ref={canvasRef}
            width={TILE_COUNT * GRID_SIZE}
            height={TILE_COUNT * GRID_SIZE}
            className="block w-full max-w-[400px] aspect-square"
          />

          {gameOver && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <h3 className="text-3xl font-extrabold text-destructive mb-2">Game Over</h3>
              <p className="text-muted-foreground mb-6">You crashed!</p>
              <Button onClick={resetGame} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Play Again
              </Button>
            </div>
          )}
        </div>

        {/* On-Screen touch control buttons */}
        <div className="w-full max-w-[200px] grid grid-cols-3 gap-2">
          <div />
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() => { if (direction.current !== 'DOWN') nextDirection.current = 'UP'; }}
          >
            ▲
          </Button>
          <div />
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() => { if (direction.current !== 'RIGHT') nextDirection.current = 'LEFT'; }}
          >
            ◀
          </Button>
          <div />
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() => { if (direction.current !== 'LEFT') nextDirection.current = 'RIGHT'; }}
          >
            ▶
          </Button>
          <div />
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-xl"
            onClick={() => { if (direction.current !== 'UP') nextDirection.current = 'DOWN'; }}
          >
            ▼
          </Button>
          <div />
        </div>
      </div>
    </ToolLayout>
  );
}
