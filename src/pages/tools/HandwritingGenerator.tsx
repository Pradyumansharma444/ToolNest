import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function HandwritingGenerator() {
  const tool = getToolById('handwriting-generator')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('Hello, this is handwritten text!');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = () => {
    const c = canvasRef.current!;
    c.width = 600; c.height = Math.max(200, Math.ceil(text.length / 40) * 60 + 40);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < c.height; y += 30) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 25);
      ctx.lineTo(c.width, y + 25);
      ctx.stroke();
    }
    ctx.fillStyle = '#333';
    ctx.font = '24px "Caveat", "Comic Sans MS", cursive';
    const lines = text.match(/.{1,40}/g) || [text];
    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 30 + i * 50);
    });
    setHasGenerated(true);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = canvasRef.current!.toDataURL();
    a.download = 'handwriting.png'; a.click();
    toast({ title: 'Image downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <Input placeholder="Type your text..." value={text} onChange={(e) => setText(e.target.value)} />
        <Button onClick={generate}>Generate</Button>
        <canvas ref={canvasRef} className="w-full rounded-xl border" />
        {hasGenerated && <Button variant="outline" onClick={download}><Download className="w-4 h-4 mr-1" /> Download</Button>}
      </div>
    </ToolLayout>
  );
}
