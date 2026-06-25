import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { FileUpload } from '@/components/tools/FileUpload';

const LAYOUTS = [
  { name: '2x2', cols: 2, rows: 2 },
  { name: '3x3', cols: 3, rows: 3 },
  { name: '1x2', cols: 2, rows: 1 },
  { name: '2x1', cols: 1, rows: 2 },
];

export default function ImageCollage() {
  const tool = getToolById('image-collage')!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [spacing, setSpacing] = useState(4);

  const handleFiles = (files: File[]) => {
    const imgs: HTMLImageElement[] = [];
    files.forEach(f => {
      const img = new Image();
      img.onload = () => { imgs.push(img); if (imgs.length === files.length) setImages([...imgs]); };
      img.src = URL.createObjectURL(f);
    });
  };

  const renderCollage = () => {
    if (images.length === 0 || !canvasRef.current) return;
    const c = canvasRef.current;
    const cellW = 400;
    const cellH = 300;
    c.width = layout.cols * cellW + (layout.cols - 1) * spacing;
    c.height = layout.rows * cellH + (layout.rows - 1) * spacing;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    images.slice(0, layout.cols * layout.rows).forEach((img, i) => {
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const x = col * (cellW + spacing);
      const y = row * (cellH + spacing);
      ctx.drawImage(img, x, y, cellW, cellH);
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={images.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'image/*': [] }} multiple maxSize={50 * 1024 * 1024}
          onFilesSelected={handleFiles} selectedFile={null} onFileRemoved={() => setImages([])} />
        <div className="flex gap-2 flex-wrap">
          {LAYOUTS.map(l => <Button key={l.name} size="sm" variant={layout.name === l.name ? 'default' : 'outline'} onClick={() => setLayout(l)}>{l.name}</Button>)}
        </div>
        <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Spacing:</span><input type="range" min={0} max={20} value={spacing} onChange={(e) => setSpacing(+e.target.value)} className="w-32" /><span className="text-sm">{spacing}px</span></div>
        {images.length > 0 && <Button onClick={renderCollage}>Render Collage</Button>}
        <canvas ref={canvasRef} className="max-w-full rounded-xl border" />
      </div>
    </ToolLayout>
  );
}
