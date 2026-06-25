import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const SIZES = [16, 32, 48, 64, 128, 256];

export default function FaviconGenerator() {
  const tool = getToolById('favicon-generator')!;
  const { toast } = useToast();
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => { generatePreviews(img); };
    img.src = URL.createObjectURL(f);
  };

  const generatePreviews = (img: HTMLImageElement) => {
    const urls: string[] = [];
    SIZES.forEach(size => {
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      urls.push(c.toDataURL('image/png'));
    });
    setPreviews(urls);
  };

  const downloadAll = async () => {
    if (previews.length === 0) return;
    const zip = new JSZip();
    SIZES.forEach((size, i) => {
      const bin = atob(previews[i].split(',')[1]);
      const arr = new Uint8Array(bin.length);
      for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
      zip.file(`favicon-${size}x${size}.png`, arr);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'favicons.zip'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Favicons downloaded as ZIP' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={previews.length > 0}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        {previews.length > 0 && (
          <>
            <div className="flex gap-4 flex-wrap">
              {SIZES.map((size, i) => (
                <div key={size} className="text-center">
                  <img src={previews[i]} alt={`${size}x${size}`} className="border rounded-lg" style={{ width: size > 64 ? 64 : size, height: size > 64 ? 64 : size }} />
                  <p className="text-xs text-muted-foreground mt-1">{size}x{size}</p>
                </div>
              ))}
            </div>
            <Button onClick={downloadAll}><Download className="w-4 h-4 mr-1" /> Download All Sizes (ZIP)</Button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
