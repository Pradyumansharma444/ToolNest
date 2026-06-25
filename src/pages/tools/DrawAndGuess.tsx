import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Brush, Eye, EyeOff } from 'lucide-react';

const WORDS = [
  'Airplane', 'Apple', 'Bicycle', 'Bird', 'Book', 'Car', 'Cat', 'Chair', 'Clock', 'Cookie',
  'Cup', 'Dinosaur', 'Dog', 'Door', 'Eye', 'Fish', 'Flower', 'Guitar', 'Hat', 'House',
  'Key', 'Leaf', 'Moon', 'Mountain', 'Mug', 'Pencil', 'Pizza', 'Rabbit', 'Rainbow', 'Ring',
  'Scissors', 'Ship', 'Shoe', 'Snake', 'Sun', 'Table', 'Tree', 'Umbrella', 'Wheel', 'Window',
];

const COLORS = ['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7'];

export default function DrawAndGuess() {
  const tool = getToolById('draw-and-guess')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  const [currentWord, setCurrentWord] = useState('');
  const [showWord, setShowWord] = useState(true);
  const [score, setScore] = useState(0);

  const lastPos = useRef({ x: 0, y: 0 });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Load new drawing word
  const nextWord = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setShowWord(false);
    clearCanvas();
  };

  useEffect(() => {
    nextWord(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Canvas configurations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  };

  const drawStep = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Helper to extract relative touch/mouse cursor coordinates
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleCorrectGuess = () => {
    setScore((s) => s + 10);
    nextWord();
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto py-2 select-none">
        
        {/* Left Control Panel Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h4 className="font-extrabold text-sm text-muted-foreground uppercase">Prompts Drawer</h4>
            <div className="bg-muted p-3 rounded-xl text-center space-y-2">
              <div className="text-xs text-muted-foreground">Secret Word:</div>
              <div className="font-bold text-xl min-h-[28px] tracking-wide">
                {showWord ? currentWord : '••••••••'}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowWord(!showWord)}
                className="w-full gap-1.5"
              >
                {showWord ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showWord ? 'Hide Word' : 'Show Word'}
              </Button>
            </div>

            <div className="flex gap-2 w-full">
              <Button size="sm" variant="outline" className="flex-1" onClick={handleCorrectGuess}>
                Guessed! (+10)
              </Button>
              <Button size="sm" variant="default" className="flex-1 font-bold" onClick={nextWord}>
                Skip Word
              </Button>
            </div>
            <div className="text-center text-xs text-muted-foreground">Score: {score}</div>
          </div>

          {/* Color & Brush thickness tools */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="font-extrabold text-xs text-muted-foreground uppercase flex items-center gap-1.5">
              <Brush className="w-3.5 h-3.5" /> Brush Configurations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setBrushColor(col)}
                  className={`w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-inner transition-transform ${
                    brushColor === col ? 'scale-110 border-foreground ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase">Brush Width: {brushWidth}px</label>
              <input
                type="range"
                min="2"
                max="20"
                className="w-full"
                value={brushWidth}
                onChange={(e) => setBrushWidth(parseInt(e.target.value, 10))}
              />
            </div>
            <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={clearCanvas}>
              <RotateCcw className="w-4 h-4" /> Clear Board
            </Button>
          </div>
        </div>

        {/* Drawing Canvas Board Column */}
        <div className="md:col-span-3 flex justify-center">
          <div className="w-full max-w-[500px] border-4 border-foreground rounded-2xl overflow-hidden shadow-2xl bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={drawStep}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={drawStep}
              onTouchEnd={stopDrawing}
              className="block w-full cursor-crosshair touch-none"
            />
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
