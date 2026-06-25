import { useState, useCallback, useEffect } from 'react';
import { Droplets, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function WatermarkImage() {
  const tool = getToolById('watermark-image')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('ToolNest');
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(40);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [canvasPreview, setCanvasPreview] = useState<string>('');

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const renderPreview = useCallback(async () => {
    if (!preview || !file || !watermarkText) return;
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity / 100})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let x = img.width / 2;
      let y = img.height / 2;
      const padding = 20;

      switch (position) {
        case 'top-left': x = padding + ctx.measureText(watermarkText).width / 2; y = padding + fontSize / 2; break;
        case 'top-right': x = img.width - padding - ctx.measureText(watermarkText).width / 2; y = padding + fontSize / 2; break;
        case 'bottom-left': x = padding + ctx.measureText(watermarkText).width / 2; y = img.height - padding - fontSize / 2; break;
        case 'bottom-right': x = img.width - padding - ctx.measureText(watermarkText).width / 2; y = img.height - padding - fontSize / 2; break;
        default: break;
      }

      // Add shadow for visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(watermarkText, x, y);
      ctx.shadowColor = 'transparent';

      const dataUrl = canvas.toDataURL(file.type, 0.95);
      setCanvasPreview(dataUrl);
    } catch {
      // silently fail
    }
  }, [preview, file, watermarkText, opacity, fontSize, position]);

  useEffect(() => {
    if (preview && watermarkText) {
      renderPreview();
    }
  }, [preview, watermarkText, opacity, fontSize, position, renderPreview]);

  const applyWatermark = async () => {
    if (!file || !canvasPreview) return;
    setProcessing(true);

    try {
      const img = await loadImage(canvasPreview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `watermarked.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Success!', description: 'Watermark applied.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to apply watermark.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const positions: { value: typeof position; label: string }[] = [
    { value: 'center', label: 'Center' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setCanvasPreview(''); setResult(null); }}
          label="Upload Image"
        />

        {file && (
          <div className="rounded-xl border bg-card p-4">
            {canvasPreview ? (
              <img src={canvasPreview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg" />
            ) : (
              <img src={preview} alt="Original" className="max-w-full max-h-64 mx-auto rounded-lg" />
            )}
          </div>
        )}

        {file && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <label className="text-sm font-medium">Watermark Text</label>
              <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter text" className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium">Position</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {positions.map(p => (
                  <Button key={p.value} variant={position === p.value ? 'default' : 'outline'} size="sm" onClick={() => setPosition(p.value)}>
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Opacity</span>
                <span>{opacity}%</span>
              </div>
              <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} min={5} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Font Size</span>
                <span>{fontSize}px</span>
              </div>
              <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={120} step={4} />
            </div>
          </div>
        )}

        {file && (
          <Button onClick={applyWatermark} disabled={processing || !watermarkText} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...</>
            ) : (
              <><Droplets className="w-4 h-4 mr-2" /> Apply Watermark</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">Watermark applied!</p>
            <Button onClick={() => downloadBlob(result, `watermarked.${file?.name.split('.').pop() || 'png'}`)}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
