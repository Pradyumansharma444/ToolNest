import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function MemeGenerator() {
  const tool = getToolById('meme-generator')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [fontSize, setFontSize] = useState(48);
  const [hasRendered, setHasRendered] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(f);
  };

  const draw = () => {
    if (!canvasRef.current || !image) return;
    const c = canvasRef.current;
    c.width = image.width;
    c.height = image.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = fontSize / 15;
    ctx.fillStyle = '#fff';
    const fs = Math.min(fontSize, c.width / (topText.length || 1) * 1.5);
    ctx.font = `bold ${fs}px Impact, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.strokeText(topText, c.width / 2, 10);
    ctx.fillText(topText, c.width / 2, 10);
    ctx.textBaseline = 'bottom';
    ctx.strokeText(bottomText, c.width / 2, c.height - 10);
    ctx.fillText(bottomText, c.width / 2, c.height - 10);
    setHasRendered(true);
  };

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = 'meme.png'; a.click();
    toast({ title: 'Meme downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!image}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        <div className="grid md:grid-cols-3 gap-2">
          <Input placeholder="Top text" value={topText} onChange={(e) => setTopText(e.target.value)} />
          <Input placeholder="Bottom text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
          <Input type="number" placeholder="Font size" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} />
        </div>
        {image && <Button onClick={draw}>Render Meme</Button>}
        <canvas ref={canvasRef} className="max-w-full rounded-xl border" />
        {hasRendered && <Button onClick={download} variant="outline"><Download className="w-4 h-4 mr-1" /> Download</Button>}
      </div>
    </ToolLayout>
  );
}
