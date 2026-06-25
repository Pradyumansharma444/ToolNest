import { useState } from 'react';
import { Eraser, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function RemoveBg() {
  const tool = getToolById('remove-bg')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const threshold = 35;

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
      setResult('');
    }
  };

  const removeBackground = async () => {
    if (!file || !preview) return;
    setProcessing(true);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Get background color from corners
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];

      const bgColors = corners.map(([x, y]) => {
        const i = (y * canvas.width + x) * 4;
        return [data[i], data[i + 1], data[i + 2]];
      });

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check distance to any corner color
        let minDist = Infinity;
        for (const [br, bg, bb] of bgColors) {
          const dist = Math.sqrt(
            Math.pow(r - br, 2) +
            Math.pow(g - bg, 2) +
            Math.pow(b - bb, 2)
          );
          minDist = Math.min(minDist, dist);
        }

        if (minDist < threshold * 2.55) {
          data[i + 3] = 0; // Make transparent
        }

        // Also remove white/light backgrounds
        const brightness = (r + g + b) / 3;
        if (brightness > 250 && minDist < threshold * 4) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      const url = URL.createObjectURL(blob);
      setResult(url);
      downloadBlob(blob, 'no-background.png');
      toast({ title: 'Background removed!', description: 'Transparent PNG downloaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
          This tool removes the background by detecting the dominant corner color.
          Works best with images that have a solid-color background.
        </div>

        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(''); }}
          label="Upload Image"
        />

        {preview && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-2">Original</p>
              <img src={preview} alt="Original" className="max-w-full rounded-lg" />
            </div>
            {result && (
              <div className="rounded-xl border bg-card p-3" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                <p className="text-xs text-muted-foreground mb-2">Result</p>
                <img src={result} alt="Result" className="max-w-full rounded-lg" />
              </div>
            )}
          </div>
        )}

        {file && (
          <Button onClick={removeBackground} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Eraser className="w-4 h-4 mr-2" /> Remove Background</>}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">Background removed!</p>
            <Button onClick={() => {
              fetch(result).then(r => r.blob()).then(b => downloadBlob(b, 'no-background.png'));
            }}>
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
