import { useState, useCallback, useEffect } from 'react';
import { Palette, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ColorCorrect() {
  const tool = getToolById('color-correct')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [canvasPreview, setCanvasPreview] = useState<string>('');

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }
  };

  const applyFilters = useCallback(async () => {
    if (!preview || !file) return;
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(file.type, 0.95);
      setCanvasPreview(dataUrl);
    } catch {
      // silently fail
    }
  }, [preview, file, brightness, contrast, saturation]);

  useEffect(() => {
    if (preview) {
      applyFilters();
    }
  }, [preview, brightness, contrast, saturation, applyFilters]);

  const downloadImage = async () => {
    if (!canvasPreview || !file) return;
    setProcessing(true);

    try {
      const img = await loadImage(canvasPreview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);

      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `color-corrected.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Success!', description: 'Color-corrected image downloaded.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
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
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Adjustments</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} min={0} max={200} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} min={0} max={200} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <Slider value={[saturation]} onValueChange={(v) => setSaturation(v[0])} min={0} max={200} step={5} />
              </div>
            </div>
          </div>
        )}

        {file && (
          <Button onClick={downloadImage} disabled={processing} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Palette className="w-4 h-4 mr-2" /> Download Adjusted Image</>
            )}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
