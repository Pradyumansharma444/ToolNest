import { useState } from 'react';
import { Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function getPalette(img: HTMLImageElement, count: number): string[] {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const buckets: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });
}

export default function PaletteFromImage() {
  const tool = getToolById('palette-from-image')!;
  const { toast } = useToast();
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => setPalette(getPalette(img, 6));
    img.src = URL.createObjectURL(f);
  };

  const copy = (hex: string, i: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(i); setTimeout(() => setCopiedIndex(-1), 2000);
    toast({ title: `Copied ${hex}` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={palette.length > 0}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        {palette.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {palette.map((hex, i) => (
              <div key={i} className="rounded-xl border bg-card p-3 text-center cursor-pointer" onClick={() => copy(hex, i)}>
                <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: hex }} />
                <p className="text-sm font-mono">{copiedIndex === i ? <Check className="w-3 h-3 inline" /> : hex}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
