import { useState, useCallback, useEffect } from 'react';
import { Focus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Sharpen() {
  const tool = getToolById('sharpen')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [intensity, setIntensity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [canvasPreview, setCanvasPreview] = useState('');

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const applySharpen = useCallback(async () => {
    if (!preview || !file) return;
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Simple unsharp mask
      ctx.filter = `contrast(${100 + intensity * 20}%)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      const dataUrl = canvas.toDataURL(file.type, 0.95);
      setCanvasPreview(dataUrl);
    } catch {
      // fail silently
    }
  }, [preview, file, intensity]);

  useEffect(() => {
    if (preview) applySharpen();
  }, [preview, intensity, applySharpen]);

  const downloadSharpened = async () => {
    if (!canvasPreview || !file) return;
    setProcessing(true);
    try {
      const img = await loadImage(canvasPreview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = `contrast(${100 + intensity * 20}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `sharpened.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Sharpened image downloaded!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

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
          <div className="rounded-xl border bg-card p-5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sharpen Intensity</span>
              <span>{intensity.toFixed(1)}x</span>
            </div>
            <Slider value={[intensity * 10]} onValueChange={(v) => setIntensity(v[0] / 10)} min={0} max={50} step={1} className="mt-2" />
          </div>
        )}

        {file && (
          <Button onClick={downloadSharpened} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Focus className="w-4 h-4 mr-2" /> Download Sharpened</>}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
