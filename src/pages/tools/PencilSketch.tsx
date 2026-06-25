import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function PencilSketch() {
  const tool = getToolById('pencil-sketch') || {
    id: 'pencil-sketch',
    name: 'Pencil Sketch Converter',
    description: 'Convert any image or photo into a pencil sketch line-art style illustration.',
    metaTitle: 'Image to Pencil Sketch Converter | ToolNest',
    metaDescription: 'Convert photos to black-and-white sketch drawings instantly using canvas color-dodge blend layers.',
    category: 'image',
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [blurRadius, setBlurRadius] = useState<number>(8); // Slider controls blur (sketch lines)
  const [loading, setLoading] = useState(false);
  const [resultSrc, setResultSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setResultSrc(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPencilSketch = () => {
    if (!imageSrc) return;
    setLoading(true);

    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setLoading(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLoading(false);
        return;
      }

      // Set canvas size to match image size (max 1600px for performance/quality balance)
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 1. Draw base grayscale image
      ctx.clearRect(0, 0, width, height);
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Create offscreen canvas for inverted blurred layer
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        // Draw inverted & blurred grayscale image
        offCtx.filter = `grayscale(100%) invert(100%) blur(${blurRadius}px)`;
        offCtx.drawImage(img, 0, 0, width, height);

        // 3. Blend the inverted blurred layer onto base using Color Dodge
        ctx.filter = 'none'; // reset filter
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.drawImage(offscreen, 0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over'; // reset blend mode
      }

      // Save output
      setResultSrc(canvas.toDataURL('image/jpeg', 0.9));
      setLoading(false);
    };
  };

  // Re-run sketch when blur changes
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        applyPencilSketch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, blurRadius]);

  const downloadResult = () => {
    if (!resultSrc) return;
    const link = document.createElement('a');
    link.href = resultSrc;
    link.download = 'pencil_sketch.jpg';
    link.click();
  };

  const reset = () => {
    setImageSrc(null);
    setResultSrc(null);
  };

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={!!resultSrc}>
      <div className="space-y-6">
        {!imageSrc ? (
          // Upload Area
          <div className="flex justify-center">
            <label className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-dashed rounded-xl cursor-pointer bg-card hover:bg-muted/30 transition-colors border-muted-foreground/30">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                <Upload className="w-10 h-10 mb-3" />
                <p className="text-sm font-semibold mb-1">Click to upload photo</p>
                <p className="text-xs">PNG, JPG or WebP (max 10MB)</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Controls sidebar */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-5 h-fit shadow-sm">
              <h3 className="font-semibold text-base">Sketch Settings</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Stroke Intensity / Detail</span>
                  <span>{blurRadius}px</span>
                </div>
                <Slider
                  min={1}
                  max={25}
                  step={1}
                  value={[blurRadius]}
                  onValueChange={(val) => setBlurRadius(val[0])}
                />
                <p className="text-[10px] text-muted-foreground">
                  Lower values create finer, sharper pencil strokes. Higher values result in broader shading.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={downloadResult} disabled={!resultSrc || loading} className="flex-1 gap-1.5">
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button variant="outline" onClick={reset} size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Canvas / Comparison view */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl border bg-muted/20 p-2 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <span className="text-xs font-medium text-muted-foreground">Rendering sketch...</span>
                  </div>
                )}
                {resultSrc ? (
                  <img src={resultSrc} alt="Pencil Sketch output" className="max-w-full max-h-[460px] object-contain rounded-lg shadow-sm" />
                ) : (
                  imageSrc && <img src={imageSrc} alt="Original input" className="max-w-full max-h-[460px] object-contain rounded-lg opacity-40" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden rendering canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info panel */}
        <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">How it Works</p>
            <p>
              This utility utilizes a professional graphics blending technique. It creates a blurred, inverted grayscale copy of the image and blends it with a normal grayscale base using the **Color Dodge** compositing mode. This isolates edges and contours, replicating hand-drawn pencil line art.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
