import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 480;
const GRAVITY = 0.25;
const FLAP_STRENGTH = -5.0;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 120; // ticks
const PIPE_GAP = 120;

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export default function FlappyBirdClone() {
  const tool = getToolById('flappy-bird')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const birdY = useRef(200);
  const birdVelocity = useRef(0);
  const pipes = useRef<Pipe[]>([]);
  const frameCount = useRef(0);
  const loopRef = useRef<number | null>(null);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('flappy_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Render game scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Sky Background
    ctx.fillStyle = '#38bdf8'; // light sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Pipes
    ctx.fillStyle = '#22c55e'; // green pipes
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;

    pipes.current.forEach((pipe) => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, 50, pipe.topHeight);

      // Bottom pipe
      const bottomY = CANVAS_HEIGHT - pipe.bottomHeight;
      ctx.fillRect(pipe.x, bottomY, 50, pipe.bottomHeight);
      ctx.strokeRect(pipe.x, bottomY, 50, pipe.bottomHeight);
    });

    // Draw Floor Greenery
    ctx.fillStyle = '#854d0e'; // dirt brown
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);
    ctx.fillStyle = '#166534'; // grass green
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 8);

    // Draw Flappy Bird
    ctx.fillStyle = '#facc15'; // yellow
    ctx.beginPath();
    ctx.arc(112, birdY.current + 12, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(116, birdY.current + 9, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f97316'; // orange beak
    ctx.beginPath();
    ctx.moveTo(124, birdY.current + 12);
    ctx.lineTo(130, birdY.current + 15);
    ctx.lineTo(124, birdY.current + 18);
    ctx.fill();
  }, []);

  const triggerGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    draw();
  };

  // Main game tick update
  const gameStep = useCallback(() => {
    if (gameOver || !isPlaying) return;

    // Bird physics
    birdVelocity.current += GRAVITY;
    birdY.current += birdVelocity.current;

    // Floor/Ceiling check
    if (birdY.current > CANVAS_HEIGHT - 30 || birdY.current < 0) {
      triggerGameOver();
      return;
    }

    // Spawn pipes
    frameCount.current++;
    if (frameCount.current % PIPE_SPAWN_RATE === 0) {
      const topHeight = Math.floor(Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100)) + 50;
      const bottomHeight = CANVAS_HEIGHT - topHeight - PIPE_GAP;
      pipes.current.push({
        x: CANVAS_WIDTH,
        topHeight,
        bottomHeight,
        passed: false,
      });
    }

    // Move and filter pipes
    pipes.current = pipes.current.map((pipe) => {
      const nextX = pipe.x - PIPE_SPEED;
      
      // Pass score check
      let nextPassed = pipe.passed;
      if (!pipe.passed && nextX < 100) {
        nextPassed = true;
        setScore((s) => {
          const nextScore = s + 1;
          if (nextScore > highScore) {
            setHighScore(nextScore);
            localStorage.setItem('flappy_high_score', nextScore.toString());
          }
          return nextScore;
        });
      }

      return { ...pipe, x: nextX, passed: nextPassed };
    }).filter((pipe) => pipe.x > -60);

    // Collision check
    const birdBox = { x: 100, y: birdY.current, size: 24 };
    for (const pipe of pipes.current) {
      const hitTop = birdBox.x + birdBox.size > pipe.x &&
                     birdBox.x < pipe.x + 50 &&
                     birdBox.y < pipe.topHeight;
                     
      const hitBottom = birdBox.x + birdBox.size > pipe.x &&
                        birdBox.x < pipe.x + 50 &&
                        birdBox.y + birdBox.size > CANVAS_HEIGHT - pipe.bottomHeight;

      if (hitTop || hitBottom) {
        triggerGameOver();
        return;
      }
    }

    draw();
    loopRef.current = requestAnimationFrame(gameStep); // eslint-disable-line react-hooks/immutability
  }, [isPlaying, gameOver, highScore]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetGame = useCallback(() => {
    birdY.current = 200;
    birdVelocity.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    draw();
  }, []);

  // Flap jump action
  const flap = useCallback(() => {
    if (gameOver) return;
    if (!isPlaying) setIsPlaying(true);
    birdVelocity.current = FLAP_STRENGTH;
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      loopRef.current = requestAnimationFrame(gameStep);
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [isPlaying, gameOver, gameStep]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Keys jump trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto py-2 space-y-6 select-none">
        
        {/* Controls header */}
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
              disabled={gameOver}
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

        {/* Canvas Render screen */}
        <div
          onClick={flap}
          className="relative border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-sky-300 cursor-pointer active:scale-95 transition-all touch-none"
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full max-w-[320px] aspect-[3/4]"
          />

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <h3 className="text-3xl font-extrabold text-destructive mb-2">Game Over</h3>
              <p className="text-muted-foreground mb-6">Score: {score}</p>
              <Button onClick={resetGame} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Play Again
              </Button>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center pointer-events-none">
              <span className="bg-background/80 text-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                Click or Space to Flap
              </span>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
