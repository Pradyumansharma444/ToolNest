import { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Download, RefreshCw, ZoomIn, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Preset {
  name: string;
  wMm: number;
  hMm: number;
  aspect: number;
  guidelines: string;
}

const PRESETS: Record<string, Preset> = {
  us: { name: 'US Visa / Passport (2x2")', wMm: 51, hMm: 51, aspect: 1, guidelines: 'Head height should be 50-69% of image height.' },
  india: { name: 'India Passport (3.5x4.5 cm)', wMm: 35, hMm: 45, aspect: 35 / 45, guidelines: 'Head height should be about 70-80% of image height.' },
  uk: { name: 'UK / Europe (3.5x4.5 cm)', wMm: 35, hMm: 45, aspect: 35 / 45, guidelines: 'Close up of head and shoulders, face 70-80% of height.' },
  china: { name: 'China Passport (3.3x4.8 cm)', wMm: 33, hMm: 48, aspect: 33 / 48, guidelines: 'Head height should be 28-33 mm from bottom to top.' },
};

export default function PassportPhoto() {
  const tool = getToolById('passport-photo') || {
    id: 'passport-photo',
    name: 'Passport Photo Generator',
    description: 'Crop and scale your photos to standard international passport dimensions and create a printable grid.',
    metaTitle: 'Free Passport Photo Generator - 2x2 & 3.5x4.5cm | ToolNest',
    metaDescription: 'Create passport photos online. Select country size presets, adjust head alignments, and download printable multi-photo sheets.',
    category: 'image',
  };

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState<string>('us');

  // Image alignment parameters
  const [zoom, setZoom] = useState<number>(1.2);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  const [singleResult, setSingleResult] = useState<string | null>(null);
  const [sheetResult, setSheetResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePreset = useMemo(() => PRESETS[presetKey], [presetKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setZoom(1.2);
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
        setSingleResult(null);
        setSheetResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePhotos = () => {
    if (!imageSrc) return;
    setLoading(true);

    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const singleCanvas = singleCanvasRef.current;
      const sheetCanvas = sheetCanvasRef.current;
      if (!singleCanvas || !sheetCanvas) {
        setLoading(false);
        return;
      }

      // 1. Generate Single Cropped Photo (Target size: 600px width, height scaled by aspect)
      const sCtx = singleCanvas.getContext('2d');
      if (sCtx) {
        const targetWidth = 600;
        const targetHeight = Math.round(targetWidth / activePreset.aspect);
        singleCanvas.width = targetWidth;
        singleCanvas.height = targetHeight;

        sCtx.clearRect(0, 0, targetWidth, targetHeight);

        // Center origin to apply scale/rotation
        sCtx.save();
        sCtx.translate(targetWidth / 2 + offsetX, targetHeight / 2 + offsetY);
        sCtx.rotate((rotation * Math.PI) / 180);

        // Draw image keeping correct aspect ratio
        const imgAspect = img.width / img.height;
        const drawWidth = targetWidth * zoom;
        const drawHeight = drawWidth / imgAspect;

        sCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        sCtx.restore();

        const singleDataUrl = singleCanvas.toDataURL('image/jpeg', 0.95);
        setSingleResult(singleDataUrl);

        // 2. Generate Printable 4x6" Sheet (contains 6 copies in a grid, size: 1800x1200 px at 300 DPI)
        const shCtx = sheetCanvas.getContext('2d');
        if (shCtx) {
          const sheetWidth = 1800;
          const sheetHeight = 1200;
          sheetCanvas.width = sheetWidth;
          sheetCanvas.height = sheetHeight;

          // Draw white background
          shCtx.fillStyle = '#ffffff';
          shCtx.fillRect(0, 0, sheetWidth, sheetHeight);

          // Calculate placement dimensions of 6 passport photos
          // For 2x2" (51x51mm) inside 4x6" sheet (152x101mm)
          // Scale factor mm to pixels: 1800px / 152.4mm = ~11.8 px/mm
          const pxPerMm = sheetWidth / 152.4;
          const photoWidthPx = Math.round(activePreset.wMm * pxPerMm);
          const photoHeightPx = Math.round(activePreset.hMm * pxPerMm);

          // 2 rows of 3 columns
          const colSpacing = (sheetWidth - (photoWidthPx * 3)) / 4;
          const rowSpacing = (sheetHeight - (photoHeightPx * 2)) / 3;

          const photoImg = new window.Image();
          photoImg.src = singleDataUrl;
          photoImg.onload = () => {
            for (let row = 0; row < 2; row++) {
              for (let col = 0; col < 3; col++) {
                const x = colSpacing + col * (photoWidthPx + colSpacing);
                const y = rowSpacing + row * (photoHeightPx + rowSpacing);

                // Draw photo border
                shCtx.strokeStyle = '#e2e8f0';
                shCtx.lineWidth = 2;
                shCtx.strokeRect(x - 1, y - 1, photoWidthPx + 2, photoHeightPx + 2);

                // Draw photo
                shCtx.drawImage(photoImg, x, y, photoWidthPx, photoHeightPx);
              }
            }
            setSheetResult(sheetCanvas.toDataURL('image/jpeg', 0.95));
            setLoading(false);
          };
        }
      }
    };
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        generatePhotos();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, presetKey, zoom, offsetX, offsetY, rotation]);

  const downloadSingle = () => {
    if (!singleResult) return;
    const link = document.createElement('a');
    link.href = singleResult;
    link.download = `passport_photo_${presetKey}.jpg`;
    link.click();
  };

  const downloadSheet = () => {
    if (!sheetResult) return;
    const link = document.createElement('a');
    link.href = sheetResult;
    link.download = `passport_photo_sheet_4x6.jpg`;
    link.click();
  };

  const reset = () => {
    setImageSrc(null);
    setSingleResult(null);
    setSheetResult(null);
  };

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={!!singleResult}>
      <div className="space-y-6">
        {!imageSrc ? (
          // Upload Area
          <div className="flex justify-center">
            <label className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-dashed rounded-xl cursor-pointer bg-card hover:bg-muted/30 transition-colors border-muted-foreground/30">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                <Upload className="w-10 h-10 mb-3" />
                <p className="text-sm font-semibold mb-1">Click to upload portrait photo</p>
                <p className="text-xs">PNG, JPG or WebP (max 10MB)</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Sidebar */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-5 h-fit shadow-sm">
              <h3 className="font-semibold text-base">Position & Presets</h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Sizing Standard</label>
                <Select value={presetKey} onValueChange={setPresetKey}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESETS).map(([key, p]) => (
                      <SelectItem key={key} value={key}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                  {activePreset.guidelines}
                </p>
              </div>

              {/* Translation Sliders */}
              <div className="space-y-4 pt-2 border-t">
                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5" /> Scale (Zoom)
                    </span>
                    <span>{zoom.toFixed(2)}x</span>
                  </div>
                  <Slider
                    min={0.5}
                    max={4}
                    step={0.05}
                    value={[zoom]}
                    onValueChange={(val) => setZoom(val[0])}
                  />
                </div>

                {/* Offset Y */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Vertical Pan (Y)</span>
                    <span>{offsetY}px</span>
                  </div>
                  <Slider
                    min={-200}
                    max={200}
                    step={2}
                    value={[offsetY]}
                    onValueChange={(val) => setOffsetY(val[0])}
                  />
                </div>

                {/* Offset X */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Horizontal Pan (X)</span>
                    <span>{offsetX}px</span>
                  </div>
                  <Slider
                    min={-200}
                    max={200}
                    step={2}
                    value={[offsetX]}
                    onValueChange={(val) => setOffsetX(val[0])}
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Rotate Angle</span>
                    <span>{rotation}°</span>
                  </div>
                  <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[rotation]}
                    onValueChange={(val) => setRotation(val[0])}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button onClick={downloadSingle} disabled={!singleResult || loading} className="w-full gap-1.5">
                  <Download className="w-4 h-4" /> Download Photo
                </Button>
                <Button onClick={downloadSheet} disabled={!sheetResult || loading} variant="outline" className="w-full gap-1.5">
                  <Grid className="w-4 h-4" /> Download 4x6" Sheet
                </Button>
                <Button variant="ghost" onClick={reset} className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
            </div>

            {/* Preview Box with Mask */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex gap-4 items-start flex-col sm:flex-row">
                {/* Visual crop box */}
                <div className="border bg-muted/20 p-4 rounded-xl flex flex-col items-center space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground">Alignment Crop Guide</span>
                  <div
                    className="relative border-2 border-primary/50 overflow-hidden shadow bg-slate-900/30"
                    style={{
                      width: '240px',
                      height: `${Math.round(240 / activePreset.aspect)}px`,
                    }}
                  >
                    {/* Centered Mask Overlay */}
                    <div className="absolute inset-0 border border-primary/20 pointer-events-none z-10 flex flex-col items-center justify-center">
                      {/* Head guide oval */}
                      <div className="w-[110px] h-[150px] border-2 border-dashed border-white/60 rounded-[50%] absolute top-[20%]" />
                      {/* Eye level axis line */}
                      <div className="w-full h-0.5 border-t border-dashed border-white/30 absolute top-[45%]" />
                    </div>

                    {/* Draggable-like transformed Image */}
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt="Crop target"
                        className="max-w-none origin-center absolute pointer-events-none select-none"
                        style={{
                          width: `${240 * zoom}px`,
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${offsetX * 0.4}px, ${offsetY * 0.4}px) rotate(${rotation}deg)`,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Printable sheet mock */}
                {sheetResult && (
                  <div className="flex-1 border p-4 rounded-xl bg-muted/20 flex flex-col items-center space-y-3 w-full">
                    <span className="text-xs font-semibold text-muted-foreground">Printable 4x6" Sheet Preview (6 Photos)</span>
                    <img
                      src={sheetResult}
                      alt="4x6 Sheet output"
                      className="max-w-full h-auto max-h-[200px] border shadow-md object-contain rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden calculation canvases */}
        <canvas ref={singleCanvasRef} className="hidden" />
        <canvas ref={sheetCanvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}
