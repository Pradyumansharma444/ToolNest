import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export default function ImageSplitter() {
  const tool = getToolById('image-splitter')!;
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = URL.createObjectURL(f);
  };

  const splitAndDownload = async () => {
    if (!image) return;
    const zip = new JSZip();
    const segW = Math.floor(image.width / cols);
    const segH = Math.floor(image.height / rows);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = segW;
    tempCanvas.height = segH;
    const ctx = tempCanvas.getContext('2d')!;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.clearRect(0, 0, segW, segH);
        ctx.drawImage(image, c * segW, r * segH, segW, segH, 0, 0, segW, segH);
        const blob = await new Promise<Blob>(resolve => tempCanvas.toBlob(b => resolve(b!), 'image/png'));
        zip.file(`segment-${r + 1}-${c + 1}.png`, blob);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'image-segments.zip'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${rows * cols} segments downloaded as ZIP` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!image}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        <div className="flex gap-2">
          <div><label className="text-xs text-muted-foreground">Rows</label><Input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(Math.max(1, +e.target.value))} /></div>
          <div><label className="text-xs text-muted-foreground">Columns</label><Input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(Math.max(1, +e.target.value))} /></div>
        </div>
        {image && <Button onClick={splitAndDownload}><Download className="w-4 h-4 mr-1" /> Split & Download ({rows * cols} segments)</Button>}
        <canvas ref={canvasRef} className="max-w-full rounded-xl border" />
      </div>
    </ToolLayout>
  );
}
