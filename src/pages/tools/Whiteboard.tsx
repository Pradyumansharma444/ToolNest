import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, Undo2, Redo2, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function Whiteboard() {
  const tool = getToolById('whiteboard')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const lastPos = useRef({ x: 0, y: 0 });

  const saveState = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const state = c.toDataURL();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), state]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 600; c.height = 400;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    saveState();
  }, [saveState]);

  const startDraw = (e: React.MouseEvent) => {
    setDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#fff' : color;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDraw = () => {
    if (drawing) saveState();
    setDrawing(false);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    restoreState(newIndex);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    restoreState(newIndex);
    setHistoryIndex(newIndex);
  };

  const restoreState = (index: number) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    saveState();
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current!.toDataURL();
    a.download = 'drawing.png'; a.click();
    toast({ title: 'Drawing saved!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setIsEraser(false); }} className="w-8 h-8 rounded cursor-pointer" />
          <input type="range" min={1} max={20} value={brushSize} onChange={(e) => setBrushSize(+e.target.value)} className="w-24" />
          <span className="text-xs text-muted-foreground w-8">{brushSize}px</span>
          <Button size="sm" variant={isEraser ? 'default' : 'outline'} onClick={() => setIsEraser(!isEraser)}><Eraser className="w-4 h-4" /></Button>
          <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0}><Undo2 className="w-4 h-4" /></Button>
          <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo2 className="w-4 h-4" /></Button>
          <Button size="sm" variant="outline" onClick={clear}>Clear</Button>
          <Button size="sm" variant="outline" onClick={download}><Download className="w-4 h-4" /></Button>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-xl border cursor-crosshair bg-white"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />
      </div>
    </ToolLayout>
  );
}
