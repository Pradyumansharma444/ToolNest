import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function WordCloud() {
  const tool = getToolById('word-cloud')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = () => {
    setHasGenerated(true);
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50);

    const c = canvasRef.current!;
    c.width = 500; c.height = 400;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, c.width, c.height);

    const maxCount = sorted[0]?.[1] || 1;
    const colors = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    const used: { x: number; y: number; w: number; h: number }[] = [];

    sorted.forEach(([word, count], i) => {
      const fontSize = Math.max(12, Math.min(60, (count / maxCount) * 60));
      ctx.font = `bold ${fontSize}px Arial`;
      const w = ctx.measureText(word).width;
      const h = fontSize;
      for (let attempt = 0; attempt < 200; attempt++) {
        const x = Math.random() * (c.width - w);
        const y = Math.random() * (c.height - h);
        if (!used.some(r => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y)) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillText(word, x, y + h);
          used.push({ x, y, w, h });
          break;
        }
      }
    });
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current!.toDataURL();
    a.download = 'wordcloud.png'; a.click();
    toast({ title: 'Word cloud downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <textarea className="w-full h-32 rounded-xl border bg-background p-3 text-sm" placeholder="Paste your text here..." value={text} onChange={(e) => setText(e.target.value)} />
        <Button onClick={generate}>Generate Word Cloud</Button>
        <canvas ref={canvasRef} className="w-full rounded-xl border" />
        {hasGenerated && <Button variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>}
      </div>
    </ToolLayout>
  );
}
