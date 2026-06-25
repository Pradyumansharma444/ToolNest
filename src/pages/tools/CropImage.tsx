import { useState, useRef, useCallback } from 'react';
import { Crop, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const presets = [
  { name: '1:1', ratio: 1 },
  { name: '16:9', ratio: 16 / 9 },
  { name: '4:3', ratio: 4 / 3 },
  { name: '3:2', ratio: 3 / 2 },
  { name: '9:16', ratio: 9 / 16 },
  { name: 'Free', ratio: 0 },
];

export default function CropImage() {
  const tool = getToolById('crop-image')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [activePreset, setActivePreset] = useState('Free');
  const containerRef = useRef<HTMLDivElement>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResult(null);

      try {
        const img = await loadImage(url);
        setImageSize({ w: img.width, h: img.height });
        // Initial crop at 80%
        const margin = 0.1;
        setCrop({
          x: margin,
          y: margin,
          w: 1 - margin * 2,
          h: 1 - margin * 2,
        });
      } catch {
        toast({ title: 'Error', description: 'Failed to load image.', variant: 'destructive' });
      }
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setIsDragging(true);
    setDragStart({ x, y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newCrop = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      w: Math.abs(x - dragStart.x),
      h: Math.abs(y - dragStart.y),
    };

    // Apply preset ratio
    const preset = presets.find(p => p.name === activePreset);
    if (preset && preset.ratio > 0) {
      const currentRatio = newCrop.w / newCrop.h;
      if (currentRatio > preset.ratio) {
        newCrop.w = newCrop.h * preset.ratio;
      } else {
        newCrop.h = newCrop.w / preset.ratio;
      }
    }

    setCrop(newCrop);
  }, [isDragging, dragStart, activePreset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const applyPreset = (ratio: number) => {
    if (ratio === 0) {
      setActivePreset('Free');
      return;
    }
    const containerW = 1;
    const containerH = 1;
    let w: number, h: number;
    if (containerW / containerH > ratio) {
      h = containerH * 0.8;
      w = h * ratio;
    } else {
      w = containerW * 0.8;
      h = w / ratio;
    }
    setCrop({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  };

  const cropImage = async () => {
    if (!file || crop.w === 0) return;
    setProcessing(true);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      const sx = Math.round(crop.x * img.width);
      const sy = Math.round(crop.y * img.height);
      const sw = Math.round(crop.w * img.width);
      const sh = Math.round(crop.h * img.height);

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `cropped.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Success!', description: `Image cropped to ${sw}x${sh}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to crop image.', variant: 'destructive' });
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
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(null); }}
          label="Upload Image to Crop"
        />

        {preview && (
          <div className="space-y-4">
            {/* Presets */}
            <div className="flex gap-2 flex-wrap">
              {presets.map(p => (
                <Button
                  key={p.name}
                  variant={activePreset === p.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setActivePreset(p.name); applyPreset(p.ratio); }}
                >
                  {p.name}
                </Button>
              ))}
            </div>

            {/* Crop Area */}
            <div
              ref={containerRef}
              className="relative border rounded-xl overflow-hidden cursor-crosshair select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img src={preview} alt="Crop" className="w-full h-auto block" draggable={false} />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              {/* Crop selection */}
              {crop.w > 0 && (
                <div
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                  style={{
                    left: `${crop.x * 100}%`,
                    top: `${crop.y * 100}%`,
                    width: `${crop.w * 100}%`,
                    height: `${crop.h * 100}%`,
                  }}
                >
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {Math.round(crop.w * imageSize.w)} x {Math.round(crop.h * imageSize.h)}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={cropImage} disabled={processing || crop.w === 0} size="lg" className="w-full">
              {processing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cropping...</>
              ) : (
                <><Crop className="w-4 h-4 mr-2" /> Crop & Download</>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">Image cropped successfully!</p>
            <Button onClick={() => downloadBlob(result, `cropped.${file?.name.split('.').pop() || 'png'}`)}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
