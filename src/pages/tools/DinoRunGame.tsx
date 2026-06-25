import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 200;
const DINO_WIDTH = 30;
const DINO_HEIGHT = 45;
const DINO_DUCK_HEIGHT = 25;
const GROUND_Y = 170;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
  y: number;
}

export default function DinoRunGame() {
  const tool = getToolById('dino-run')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const dinoY = useRef(GROUND_Y - DINO_HEIGHT);
  const dinoVelocity = useRef(0);
  const isJumping = useRef(false);
  const isDucking = useRef(false);

  const obstacles = useRef<Obstacle[]>([]);
  const speed = useRef(5);
  const frameCount = useRef(0);
  const loopRef = useRef<number | null>(null);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('dino_high_score');
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

    // Background
    ctx.fillStyle = '#f4f4f5'; // zinc-100
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Horizon line
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Draw Obstacles
    obstacles.current.forEach((obs) => {
      ctx.fillStyle = obs.type === 'cactus' ? '#166534' : '#1e3a8a'; // green cactus, blue bird
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Draw Dinosaur
    ctx.fillStyle = '#27272a'; // dark gray dino
    const currentHeight = isDucking.current ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    ctx.fillRect(50, dinoY.current, DINO_WIDTH, currentHeight);

    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(72, dinoY.current + 6, 3, 3);
  }, []);

  const triggerGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    draw();
  };

  // Game step update
  const gameStep = useCallback(() => {
    if (gameOver || !isPlaying) return;

    // Physics
    if (isJumping.current) {
      dinoVelocity.current += GRAVITY;
      dinoY.current += dinoVelocity.current;

      if (dinoY.current >= GROUND_Y - DINO_HEIGHT) {
        dinoY.current = GROUND_Y - DINO_HEIGHT;
        dinoVelocity.current = 0;
        isJumping.current = false;
      }
    }

    // Score and speed increment
    frameCount.current++;
    if (frameCount.current % 10 === 0) {
      setScore((s) => {
        const nextScore = s + 1;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('dino_high_score', nextScore.toString());
        }
        return nextScore;
      });
    }

    if (frameCount.current % 500 === 0) {
      speed.current += 0.5; // speed up
    }

    // Spawn obstacles
    if (frameCount.current % 120 === 0 && Math.random() > 0.3) {
      const type = Math.random() > 0.8 ? 'bird' : 'cactus';
      if (type === 'cactus') {
        const w = Math.random() > 0.5 ? 20 : 15;
        const h = Math.random() > 0.5 ? 40 : 30;
        obstacles.current.push({
          x: CANVAS_WIDTH,
          width: w,
          height: h,
          type: 'cactus',
          y: GROUND_Y - h,
        });
      } else {
        // bird height options: high (jumpable/duckable) or low (jumpable)
        const birdY = Math.random() > 0.5 ? GROUND_Y - 50 : GROUND_Y - 25;
        obstacles.current.push({
          x: CANVAS_WIDTH,
          width: 25,
          height: 15,
          type: 'bird',
          y: birdY,
        });
      }
    }

    // Move obstacles
    obstacles.current = obstacles.current.map((obs) => ({
      ...obs,
      x: obs.x - speed.current,
    })).filter((obs) => obs.x > -50);

    // Collision check
    const currentHeight = isDucking.current ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
    const dinoBox = {
      x: 50,
      y: dinoY.current,
      w: DINO_WIDTH,
      h: currentHeight,
    };

    for (const obs of obstacles.current) {
      const hit = dinoBox.x < obs.x + obs.width &&
                  dinoBox.x + dinoBox.w > obs.x &&
                  dinoBox.y < obs.y + obs.height &&
                  dinoBox.y + dinoBox.h > obs.y;

      if (hit) {
        triggerGameOver();
        return;
      }
    }

    draw();
    loopRef.current = requestAnimationFrame(gameStep); // eslint-disable-line react-hooks/immutability
  }, [isPlaying, gameOver, highScore]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetGame = useCallback(() => {
    dinoY.current = GROUND_Y - DINO_HEIGHT;
    dinoVelocity.current = 0;
    isJumping.current = false;
    isDucking.current = false;
    obstacles.current = [];
    speed.current = 5;
    frameCount.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    draw();
  }, []);

  // Jump Action
  const jump = useCallback(() => {
    if (gameOver) return;
    if (!isPlaying) {
      setIsPlaying(true);
      return;
    }
    if (!isJumping.current && !isDucking.current) {
      dinoVelocity.current = JUMP_FORCE;
      isJumping.current = true;
    }
  }, [isPlaying, gameOver]);

  // Duck Action
  const setDuck = useCallback((ducking: boolean) => {
    if (!isPlaying || gameOver || isJumping.current) return;
    isDucking.current = ducking;
    dinoY.current = ducking ? GROUND_Y - DINO_DUCK_HEIGHT : GROUND_Y - DINO_HEIGHT;
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

  // Keyboard Steer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setDuck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, setDuck]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-2xl mx-auto py-2 space-y-6 select-none">
        
        {/* Controls row */}
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

        {/* Canvas Screen */}
        <div className="relative border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-zinc-100 w-full">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full max-h-[200px]"
          />

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <h3 className="text-3xl font-extrabold text-destructive mb-2">Game Over</h3>
              <p className="text-muted-foreground mb-6">Final Score: {score}</p>
              <Button onClick={resetGame} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Action Controls for Touch mobile screen */}
        <div className="flex gap-4 justify-center w-full max-w-xs">
          <Button
            size="lg"
            className="flex-1 h-16 rounded-xl font-bold text-lg select-none"
            onTouchStart={() => jump()}
            onClick={() => jump()}
          >
            Jump (Space)
          </Button>
          <Button
            size="lg"
            className="flex-1 h-16 rounded-xl font-bold text-lg select-none"
            onTouchStart={() => setDuck(true)}
            onTouchEnd={() => setDuck(false)}
            onMouseDown={() => setDuck(true)}
            onMouseUp={() => setDuck(false)}
          >
            Duck (▼)
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
