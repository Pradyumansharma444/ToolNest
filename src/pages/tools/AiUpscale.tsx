import { useState } from 'react';
import { ZoomIn, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AiUpscale() {
  const tool = getToolById('ai-upscale')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [scale, setScale] = useState<2 | 4>(2);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState({ w: 0, h: 0 });

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  // Browser-based upscaling using canvas with smoothing
  const upscale = async () => {
    if (!file || !preview) return;
    setProcessing(true);
    setResult(null);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // Use best quality smoothing for upscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const blob = await canvasToBlob(canvas, 'image/png', 1);
      setResult(blob);
      setResultSize({ w, h });
      downloadBlob(blob, `upscaled-${scale}x.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Upscale complete!', description: `Image enlarged to ${w}x${h}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to upscale image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> This tool uses browser-based upscaling with high-quality interpolation.
        </div>

        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(null); }}
          label="Upload Image"
        />

        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg" />
          </div>
        )}

        {file && (
          <div className="rounded-xl border bg-card p-5">
            <label className="text-sm font-medium mb-2 block">Scale Factor</label>
            <div className="flex gap-2">
              <Button variant={scale === 2 ? 'default' : 'outline'} onClick={() => setScale(2)}>2x</Button>
              <Button variant={scale === 4 ? 'default' : 'outline'} onClick={() => setScale(4)}>4x</Button>
            </div>
          </div>
        )}

        {file && (
          <Button onClick={upscale} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upscaling...</> : <><ZoomIn className="w-4 h-4 mr-2" /> Upscale {scale}x</>}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Upscaled to {resultSize.w}x{resultSize.h}!
            </p>
            <Button onClick={() => downloadBlob(result, `upscaled-${scale}x.${file?.name.split('.').pop() || 'png'}`)}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
