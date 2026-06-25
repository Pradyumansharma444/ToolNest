import { useState } from 'react';
import { Eraser, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Simple background removal using color similarity (green/blue screen style)
export default function RemoveBgPro() {
  const tool = getToolById('enhancer-remove-bg')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const threshold = 30;

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult('');
    }
  };

  const removeBg = async () => {
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

      // Simple edge-based background removal
      // Find the dominant corner color and remove similar pixels
      const sampleColor = [data[0], data[1], data[2]]; // Top-left corner

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          Math.pow(r - sampleColor[0], 2) +
          Math.pow(g - sampleColor[1], 2) +
          Math.pow(b - sampleColor[2], 2)
        );

        if (dist < threshold * 2.55) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      const url = URL.createObjectURL(blob);
      setResult(url);
      downloadBlob(blob, 'background-removed.png');
      toast({ title: 'Processing complete!' });
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
          <strong>Note:</strong> This tool uses edge-detection based background removal.
          For best results, use images with a solid-color background.
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
          <Button onClick={removeBg} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Eraser className="w-4 h-4 mr-2" /> Remove Background</>}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">Background removed!</p>
            <Button onClick={() => {
              const blob = fetch(result).then(r => r.blob());
              blob.then(b => downloadBlob(b, 'background-removed.png'));
            }}>
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
