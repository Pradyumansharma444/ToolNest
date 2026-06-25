import { useState, useRef, useEffect } from 'react';
import { Upload, FileCode, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function SvgToPng() {
  const tool = getToolById('svg-to-png') || {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    description: 'Convert SVG vector graphics to high-resolution PNG files with custom scales.',
    metaTitle: 'Free SVG to PNG Converter Online | ToolNest',
    metaDescription: 'Convert SVG files or raw XML code to PNG images. Scale outputs up to 4x resolution client-side.',
    category: 'image',
    path: '/tools/svg-to-png',
    icon: 'Image',
    keywords: ['svg', 'png', 'converter', 'image', 'vector'],
  };

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [scale, setScale] = useState<string>('2'); // Output scale: 1x, 2x, 3x, 4x
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSvgContent(event.target?.result as string);
        setResultSrc(null);
      };
      reader.readAsText(file);
    }
  };

  const convertSvg = () => {
    if (!svgContent) return;
    setLoading(true);

    // Create a blob representing the SVG
    try {
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new window.Image();
      img.src = url;

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          setLoading(false);
          URL.revokeObjectURL(url);
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLoading(false);
          URL.revokeObjectURL(url);
          return;
        }

        // Determine output dimensions
        const baseWidth = img.width || 400;
        const baseHeight = img.height || 400;

        let outWidth = baseWidth;
        let outHeight = baseHeight;

        if (customWidth || customHeight) {
          const w = Number(customWidth);
          const h = Number(customHeight);
          if (w > 0) outWidth = w;
          if (h > 0) outHeight = h;
          if (w > 0 && !h) outHeight = Math.round((w * baseHeight) / baseWidth);
          if (h > 0 && !w) outWidth = Math.round((h * baseWidth) / baseHeight);
        } else {
          const s = Number(scale) || 1;
          outWidth = Math.round(baseWidth * s);
          outHeight = Math.round(baseHeight * s);
        }

        canvas.width = outWidth;
        canvas.height = outHeight;

        // Clear canvas
        ctx.clearRect(0, 0, outWidth, outHeight);

        // Draw SVG onto canvas
        ctx.drawImage(img, 0, 0, outWidth, outHeight);

        // Save PNG URL
        setResultSrc(canvas.toDataURL('image/png'));
        setLoading(false);
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        setLoading(false);
        URL.revokeObjectURL(url);
        alert('Failed to parse SVG. Please make sure the SVG code or file is valid XML.');
      };
    } catch {
      setLoading(false);
      alert('Error converting SVG. Please check file formatting.');
    }
  };

  // Trigger conversion when dependencies change
  useEffect(() => {
    if (svgContent) {
      const timer = setTimeout(() => {
        convertSvg();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [svgContent, scale, customWidth, customHeight]);

  const downloadResult = () => {
    if (!resultSrc) return;
    const link = document.createElement('a');
    link.href = resultSrc;
    link.download = 'converted_vector.png';
    link.click();
  };

  const reset = () => {
    setSvgContent(null);
    setResultSrc(null);
    setCustomWidth('');
    setCustomHeight('');
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!resultSrc}>
      <div className="space-y-6">
        {!svgContent ? (
          // Setup Tab view
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${
                  activeTab === 'upload' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-colors ${
                  activeTab === 'paste' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Paste Code
              </button>
            </div>

            {activeTab === 'upload' ? (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer bg-card hover:bg-muted/30 transition-colors border-muted-foreground/30">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                  <Upload className="w-10 h-10 mb-3" />
                  <p className="text-sm font-semibold mb-1">Upload SVG File</p>
                  <p className="text-xs">Drag and drop or browse</p>
                </div>
                <input type="file" accept=".svg" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste your <svg>...</svg> XML tags here..."
                  rows={8}
                  onChange={(e) => setSvgContent(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button onClick={convertSvg} disabled={!svgContent} className="w-full">
                  Convert Pasted Code
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Options sidebar */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-5 h-fit shadow-sm text-sm">
              <h3 className="font-semibold text-base">Resolution Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Preset Resolution Scale</label>
                  <Select
                    value={scale}
                    onValueChange={(val) => {
                      setScale(val);
                      setCustomWidth('');
                      setCustomHeight('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x (Original Size)</SelectItem>
                      <SelectItem value="2">2x (Double Res)</SelectItem>
                      <SelectItem value="3">3x (High Res)</SelectItem>
                      <SelectItem value="4">4x (Ultra Res)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">Or Set Custom Size (Pixels)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium">Width</label>
                      <Input
                        type="number"
                        placeholder="e.g. 800"
                        value={customWidth}
                        onChange={(e) => {
                          setCustomWidth(e.target.value);
                          setScale('');
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-medium">Height</label>
                      <Input
                        type="number"
                        placeholder="e.g. 600"
                        value={customHeight}
                        onChange={(e) => {
                          setCustomHeight(e.target.value);
                          setScale('');
                        }}
                      />
                    </div>
                  </div>
                </div>
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
                    <span className="text-xs font-medium text-muted-foreground">Converting SVG...</span>
                  </div>
                )}
                {resultSrc ? (
                  <img
                    src={resultSrc}
                    alt="Vector rendering output"
                    className="max-w-full max-h-[500px] object-contain shadow-sm border bg-card"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <FileCode className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
                    <span>Rendering Vector...</span>
                  </div>
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
