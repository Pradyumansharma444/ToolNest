import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function SpinWheel() {
  const tool = getToolById('spin-wheel')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState('Option 1\nOption 2\nOption 3\nOption 4');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState('');
  const angleRef = useRef(0);
  const animRef = useRef(0);

  const drawWheel = (angle: number) => {
    const c = canvasRef.current!;
    c.width = 300; c.height = 300;
    const ctx = c.getContext('2d')!;
    const cx = 150, cy = 150, r = 140;
    const opts = items.split('\n').filter(s => s.trim());
    const slice = (2 * Math.PI) / opts.length;
    opts.forEach((opt, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle + i * slice, angle + (i + 1) * slice);
      ctx.fillStyle = `hsl(${(i * 360) / opts.length}, 70%, 60%)`;
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + i * slice + slice / 2);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(opt.trim().slice(0, 10), r - 10, 4);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  };

  const spin = () => {
    if (spinning) return;
    const opts = items.split('\n').filter(s => s.trim());
    if (opts.length < 2) { toast({ title: 'Enter at least 2 options', variant: 'destructive' }); return; }
    setSpinning(true);
    setWinner('');
    const target = angleRef.current + Math.PI * 2 * (5 + Math.random() * 5);
    const startAngle = angleRef.current;
    const duration = 3000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (target - startAngle) * ease;
      drawWheel(currentAngle);
      if (progress < 1) { animRef.current = requestAnimationFrame(animate); }
      else {
        angleRef.current = target;
        const normalized = ((target % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const slice = (2 * Math.PI) / opts.length;
        const winIndex = Math.floor(normalized / slice);
        setWinner(opts[winIndex] || opts[0]);
        setSpinning(false);
        toast({ title: `Winner: ${opts[winIndex] || opts[0]}` });
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!winner}>
      <div className="space-y-4">
        <textarea className="w-full h-24 rounded-xl border bg-background p-3 text-sm" placeholder="One option per line" value={items} onChange={(e) => setItems(e.target.value)} />
        <Button onClick={spin} disabled={spinning}>{spinning ? 'Spinning...' : 'Spin!'}</Button>
        <canvas ref={canvasRef} className="mx-auto rounded-xl" width={300} height={300} />
        {winner && <p className="text-center text-lg font-bold">Winner: {winner}</p>}
      </div>
    </ToolLayout>
  );
}
