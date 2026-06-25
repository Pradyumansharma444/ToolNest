import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const GRADIENTS = [
  { name: 'Sunset', start: '#ff5e62', end: '#ff9966' },
  { name: 'Ocean', start: '#2b5876', end: '#4e4376' },
  { name: 'Neon', start: '#00f2fe', end: '#4facfe' },
  { name: 'Aurora', start: '#00cdac', end: '#8ddad5' },
  { name: 'Royal', start: '#141517', end: '#242526' },
];

export default function ImageBorderFrame() {
  const tool = getToolById('image-border') || {
    id: 'image-border',
    name: 'Image Border & Frame Maker',
    description: 'Add solid color or gradient borders and rounded corners to your images.',
    metaTitle: 'Image Border & Rounded Corner Editor | ToolNest',
    metaDescription: 'Add custom framing borders and round the edges of pictures. Select color presets, gradients, and download PNGs.',
    category: 'image',
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [borderWidth, setBorderWidth] = useState<number>(15);
  const [borderRadius, setBorderRadius] = useState<number>(20);
  const [borderType, setBorderType] = useState<'solid' | 'gradient'>('solid');
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [activeGradientIdx, setActiveGradientIdx] = useState<number>(0);

  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const renderFrame = () => {
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

      const imgWidth = img.width;
      const imgHeight = img.height;

      // Canvas dimensions includes border spacing on all sides
      const canvasWidth = imgWidth + borderWidth * 2;
      const canvasHeight = imgHeight + borderWidth * 2;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw background frame (solid color or linear gradient)
      if (borderType === 'solid') {
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        const gradSpec = GRADIENTS[activeGradientIdx];
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, gradSpec.start);
        gradient.addColorStop(1, gradSpec.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Draw rounded clipped photo inside the frame borders
      ctx.save();

      // Define rounded rectangle path for the inner image content
      const x = borderWidth;
      const y = borderWidth;
      const w = imgWidth;
      const h = imgHeight;
      const r = Math.min(borderRadius, Math.min(w / 2, h / 2));

      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      // Clip context to only draw image inside rounded boundaries
      ctx.clip();
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();

      // Generate downloadable PNG output
      setResultSrc(canvas.toDataURL('image/png'));
      setLoading(false);
    };
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        renderFrame();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, borderWidth, borderRadius, borderType, borderColor, activeGradientIdx]);

  const downloadResult = () => {
    if (!resultSrc) return;
    const link = document.createElement('a');
    link.href = resultSrc;
    link.download = 'framed_photo.png';
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
          // Upload Box
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
            {/* Control Panel */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-5 h-fit shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-2">Border Customization</h3>

              {/* Border Type toggle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Frame Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={borderType === 'solid' ? 'default' : 'outline'}
                    onClick={() => setBorderType('solid')}
                    className="w-full text-xs"
                  >
                    Solid Color
                  </Button>
                  <Button
                    type="button"
                    variant={borderType === 'gradient' ? 'default' : 'outline'}
                    onClick={() => setBorderType('gradient')}
                    className="w-full text-xs"
                  >
                    Gradient Glow
                  </Button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Border Thickness</span>
                    <span>{borderWidth}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={120}
                    step={1}
                    value={[borderWidth]}
                    onValueChange={(val) => setBorderWidth(val[0])}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Corner Roundness</span>
                    <span>{borderRadius}px</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[borderRadius]}
                    onValueChange={(val) => setBorderRadius(val[0])}
                  />
                </div>
              </div>

              {/* Border Color or Preset choices */}
              <div className="pt-2 border-t space-y-3">
                {borderType === 'solid' ? (
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">Border Color Picker</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-card"
                      />
                      <span className="text-xs font-mono uppercase">{borderColor}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Gradient Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {GRADIENTS.map((g, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGradientIdx(idx)}
                          className={`w-8 h-8 rounded-full border transition-all ${
                            activeGradientIdx === idx ? 'ring-2 ring-primary scale-105' : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${g.start}, ${g.end})`,
                          }}
                          title={g.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button onClick={downloadResult} disabled={!resultSrc || loading} className="flex-1 gap-1.5">
                  <Download className="w-4 h-4" /> Download PNG
                </Button>
                <Button variant="outline" onClick={reset} size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview View */}
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4 flex items-center justify-center min-h-[350px] max-h-[550px] overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <span className="text-xs font-medium text-muted-foreground">Rendering border...</span>
                  </div>
                )}
                {resultSrc ? (
                  <img
                    src={resultSrc}
                    alt="Border output preview"
                    className="max-w-full max-h-[500px] object-contain shadow-lg"
                  />
                ) : (
                  imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Input preview"
                      className="max-w-full max-h-[500px] object-contain opacity-40"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden rendering canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}
