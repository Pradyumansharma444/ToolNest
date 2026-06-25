import { useState } from 'react';
import { Maximize2, Loader2, Download, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ResizeImage() {
  const tool = getToolById('resize-image')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectLock, setAspectLock] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResult(null);

      try {
        const img = await loadImage(url);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      } catch {
        toast({ title: 'Error', description: 'Failed to load image.', variant: 'destructive' });
      }
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (aspectLock && originalWidth > 0) {
      setHeight(Math.round(val * (originalHeight / originalWidth)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (aspectLock && originalHeight > 0) {
      setWidth(Math.round(val * (originalWidth / originalHeight)));
    }
  };

  const resizeImage = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `resized.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Success!', description: `Image resized to ${width}x${height}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to resize image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(null); }}
          label="Upload Image"
        />

        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg" />
          </div>
        )}

        {file && originalWidth > 0 && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Original: {originalWidth} x {originalHeight}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm">Lock aspect</span>
                <Switch checked={aspectLock} onCheckedChange={setAspectLock} />
                {aspectLock ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Width (px)</label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  min={1}
                  max={8000}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Height (px)</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  min={1}
                  max={8000}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Quick Scale</label>
              <Slider
                value={[Math.round((width / originalWidth) * 100)]}
                onValueChange={(v) => {
                  const scale = v[0] / 100;
                  handleWidthChange(Math.round(originalWidth * scale));
                }}
                min={1}
                max={400}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round((width / originalWidth) * 100)}%
              </p>
            </div>
          </div>
        )}

        {file && (
          <Button onClick={resizeImage} disabled={processing} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resizing...</>
            ) : (
              <><Maximize2 className="w-4 h-4 mr-2" /> Resize Image</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Image resized to {width}x{height}!
            </p>
            <Button onClick={() => downloadBlob(result, `resized.${file?.name.split('.').pop() || 'png'}`)}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
