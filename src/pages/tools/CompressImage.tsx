import { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { 
  Minimize2, Loader2, Download, ImageIcon, Settings, 
  Trash2, AlertCircle, Maximize2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { formatBytes, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize?: number;
  blob?: Blob;
  previewUrl: string;     // Original image object URL
  compressedUrl?: string; // Compressed image object URL
  processing: boolean;
  success: boolean;
  error: boolean;
}

export default function CompressImage() {
  const tool = getToolById('compress-image')!;
  const { toast } = useToast();
  
  // State variables
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Comparison slider position
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const activeImage = images.find(img => img.id === activeId);

  // Clean up object URLs on unmount or file deletion
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      });
    };
  }, []);

  // Format converter helper
  const convertImageFormat = (fileBlob: Blob, targetFormat: 'jpg' | 'png' | 'webp'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fileBlob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }
        // Fill canvas background with white for JPG conversion to prevent black backgrounds on transparent files
        if (targetFormat === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        
        const mimeMap = {
          jpg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp'
        };
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Format conversion failed'));
        }, mimeMap[targetFormat], 0.92);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  // Resize dimension helper
  const resizeImageScale = (fileBlob: File, scalePct: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fileBlob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scalePct);
        canvas.height = Math.round(img.naturalHeight * scalePct);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image resizing failed'));
        }, fileBlob.type);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  // Perform a single compression request
  const performSingleCompression = async (
    file: File,
    qualityVal: number,
    scaleVal: number,
    formatVal: 'original' | 'jpeg' | 'png' | 'webp'
  ): Promise<Blob> => {
    // 1. Perform resize if scaleVal is modified
    let intermediate: Blob = file;
    if (scaleVal < 100) {
      intermediate = await resizeImageScale(file, scaleVal / 100);
    }

    // 2. Perform compression using browser-image-compression
    // Note: maxSizeMB behaves as target size constraint, we scale target max size linearly with quality
    const maxMb = intermediate.size / (1024 * 1024) * (qualityVal / 100);
    const options = {
      maxSizeMB: Math.max(0.01, maxMb),
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      initialQuality: qualityVal / 100,
    };

    const compressedFile = await imageCompression(intermediate as File, options);
    let finalBlob: Blob = compressedFile;

    // 3. Perform conversion if requested format differs from original
    if (formatVal !== 'original') {
      const ext = formatVal === 'jpeg' ? 'jpg' : formatVal;
      finalBlob = await convertImageFormat(compressedFile, ext);
    }

    return finalBlob;
  };

  // Handle files selected (support multiple uploads)
  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    
    const newItems: ImageItem[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      originalSize: file.size,
      previewUrl: URL.createObjectURL(file),
      processing: false,
      success: false,
      error: false,
    }));

    setImages(prev => [...prev, ...newItems]);
    if (!activeId) {
      setActiveId(newItems[0].id);
    }
  };

  // Remove a single image from the list
  const removeImage = (id: string) => {
    const target = images.find(img => img.id === id);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
      if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
    }
    setImages(prev => prev.filter(img => img.id !== id));
    if (activeId === id) {
      const remaining = images.filter(img => img.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Debounced live preview generation for the currently active image
  useEffect(() => {
    if (!activeId || !activeImage) return;

    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const resBlob = await performSingleCompression(activeImage.file, quality, scale, format);
        const compUrl = URL.createObjectURL(resBlob);
        
        setImages(prev => prev.map(img => {
          if (img.id === activeId) {
            if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
            return {
              ...img,
              blob: resBlob,
              compressedSize: resBlob.size,
              compressedUrl: compUrl,
              success: true
            };
          }
          return img;
        }));
      } catch (err) {
        console.error(err);
        setImages(prev => prev.map(img => (img.id === activeId ? { ...img, error: true } : img)));
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [activeId, quality, scale, format]);

  // Batch process all images with current settings
  const compressAllImages = async () => {
    if (images.length === 0) return;
    setBatchProcessing(true);
    toast({ title: 'Processing Batch', description: `Compressing ${images.length} images...` });

    try {
      const updatedImages = [...images];
      for (let i = 0; i < updatedImages.length; i++) {
        const item = updatedImages[i];
        if (item.id === activeId && item.compressedSize && item.blob) {
          // Skip active item because it is already compressed from live preview
          setImages(prev => prev.map(img => img.id === item.id ? { ...img, success: true } : img));
          continue;
        }

        setImages(prev => prev.map(img => img.id === item.id ? { ...img, processing: true } : img));
        try {
          const resBlob = await performSingleCompression(item.file, quality, scale, format);
          const compUrl = URL.createObjectURL(resBlob);
          setImages(prev => prev.map(img => {
            if (img.id === item.id) {
              if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
              return {
                ...img,
                blob: resBlob,
                compressedSize: resBlob.size,
                compressedUrl: compUrl,
                processing: false,
                success: true,
              };
            }
            return img;
          }));
        } catch {
          setImages(prev => prev.map(img => img.id === item.id ? { ...img, processing: false, error: true } : img));
        }
      }
      toast({ title: 'Batch complete!', description: 'All images compressed successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Batch compression failed.', variant: 'destructive' });
    } finally {
      setBatchProcessing(false);
    }
  };

  // Download all files zipped together
  const downloadAllAsZip = async () => {
    const successImages = images.filter(img => img.success && img.blob);
    if (successImages.length === 0) {
      toast({ title: 'Nothing to download', description: 'Compress images first.', variant: 'destructive' });
      return;
    }
    
    setBatchProcessing(true);
    try {
      const zip = new JSZip();
      successImages.forEach(img => {
        const originalExtension = img.name.split('.').pop() || 'jpg';
        const targetExtension = format === 'original' ? originalExtension : (format === 'jpeg' ? 'jpg' : format);
        const baseName = img.name.substring(0, img.name.lastIndexOf('.')) || img.name;
        zip.file(`${baseName}_compressed.${targetExtension}`, img.blob!);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'compressed_images_suite.zip');
      toast({ title: 'ZIP packaging complete!', description: 'Downloaded batch file.' });
    } catch {
      toast({ title: 'ZIP failed', description: 'Failed to bundle files into a ZIP archive.', variant: 'destructive' });
    } finally {
      setBatchProcessing(false);
    }
  };

  // Single download trigger
  const downloadSingleImage = (item: ImageItem) => {
    if (!item.blob) return;
    const originalExtension = item.name.split('.').pop() || 'jpg';
    const targetExtension = format === 'original' ? originalExtension : (format === 'jpeg' ? 'jpg' : format);
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    downloadBlob(item.blob, `${baseName}_compressed.${targetExtension}`);
  };

  // Interactive slider dragging handlers
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const onMouseDown = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      handleSliderMove(e.clientX);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length === 0) return;
      handleSliderMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  const getSavingsColorClass = (orig: number, comp?: number) => {
    if (!comp) return 'text-muted-foreground';
    const ratio = comp / orig;
    if (ratio <= 0.40) return 'text-emerald-500 bg-emerald-500/5 border border-emerald-500/10';
    if (ratio <= 0.75) return 'text-amber-500 bg-amber-500/5 border border-amber-500/10';
    return 'text-rose-500 bg-rose-500/5 border border-rose-500/10';
  };

  const getReductionPct = (orig: number, comp?: number) => {
    if (!comp) return 0;
    return Math.round((1 - comp / orig) * 100);
  };

  return (
    <ToolLayout tool={tool} resultVisible={images.some(img => img.success)}>
      <div className="space-y-6">
        
        {/* Upload Container */}
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelected={handleFilesSelected}
          multiple
          maxFiles={50}
          label="Select Images to Compress"
          description="Drag & drop JPG, PNG, WebP files here (Batch supported)"
        />

        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Control Panel (Col 5) */}
            <div className="lg:col-span-5 space-y-5 rounded-2xl border bg-card p-5 shadow-xs select-none">
              <div className="flex items-center gap-2 border-b pb-3">
                <Settings className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Compression Settings</h3>
              </div>

              {/* Quality Settings */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Image Quality</span>
                  <span className="text-primary">{quality}%</span>
                </div>
                <Slider value={[quality]} onValueChange={(v) => setQuality(v[0])} min={10} max={100} step={5} />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Max Compression</span>
                  <span>Max Quality</span>
                </div>
              </div>

              {/* Scale Resize Settings */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Resize Resolution</span>
                  <span className="text-primary">{scale}%</span>
                </div>
                <Slider value={[scale]} onValueChange={(v) => setScale(v[0])} min={20} max={100} step={5} />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Small Dimensions</span>
                  <span>Original Size</span>
                </div>
              </div>

              {/* Format Converter Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Target Output Format</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['original', 'jpeg', 'png', 'webp'] as const).map(fmt => (
                    <Button
                      key={fmt}
                      variant={format === fmt ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat(fmt)}
                      className="text-[10px] font-bold capitalize h-8 rounded-lg"
                    >
                      {fmt === 'jpeg' ? 'JPG' : fmt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t flex gap-2">
                <Button 
                  onClick={compressAllImages} 
                  disabled={batchProcessing} 
                  className="flex-1 font-bold h-10 rounded-xl"
                >
                  {batchProcessing ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processing...</>
                  ) : (
                    <><Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Compress All</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setImages([]); setActiveId(null); }}
                  className="h-10 rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Split Screen Visual Comparison (Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              {activeImage ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs select-none">
                    <span className="font-bold truncate max-w-[240px]">Preview: {activeImage.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {getReductionPct(activeImage.originalSize, activeImage.compressedSize) > 0 ? (
                        <span>Saved {getReductionPct(activeImage.originalSize, activeImage.compressedSize)}%</span>
                      ) : 'Adjust sliders to preview'}
                    </span>
                  </div>

                  {/* Interactive comparison viewport */}
                  <div 
                    ref={containerRef}
                    onMouseDown={onMouseDown}
                    onTouchStart={onMouseDown}
                    className="relative w-full h-[320px] rounded-2xl border overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 flex items-center justify-center cursor-ew-resize select-none"
                  >
                    {/* Original Background Image */}
                    <img 
                      src={activeImage.previewUrl} 
                      alt="Original" 
                      className="absolute max-w-[95%] max-h-[92%] object-contain pointer-events-none" 
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-md uppercase z-10">
                      Original
                    </div>

                    {/* Compressed Clipped Image Overlay */}
                    {activeImage.compressedUrl && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                      >
                        <img 
                          src={activeImage.compressedUrl} 
                          alt="Compressed" 
                          className="max-w-[95%] max-h-[92%] object-contain pointer-events-none" 
                        />
                        <div className="absolute top-2 right-2 bg-primary/95 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-md uppercase z-10">
                          Compressed
                        </div>
                      </div>
                    )}

                    {/* Loading State Spinner Overlay */}
                    {previewLoading && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-xs flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    )}

                    {/* Sliding Separator Handle */}
                    <div 
                      className="absolute inset-y-0 w-[2px] bg-white pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border shadow-md flex items-center justify-center">
                        <Maximize2 className="w-3 h-3 text-muted-foreground rotate-45" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center italic">Drag the slider horizontally to compare Original (left) vs. Compressed (right).</p>
                </div>
              ) : (
                <div className="h-[320px] rounded-2xl border border-dashed flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">Select an uploaded image to view interactive split screen comparison.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Batch Queue & Download Center */}
        {images.length > 0 && (
          <div className="rounded-2xl border bg-card shadow-xs select-none">
            <div className="p-4 border-b bg-muted/40 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Upload Batch Queue</h3>
                <p className="text-xs text-muted-foreground">{images.length} image(s) registered</p>
              </div>
              
              {images.some(img => img.success) && (
                <Button 
                  onClick={downloadAllAsZip} 
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-bold h-9 border-emerald-600 text-emerald-600 hover:bg-emerald-500/5 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" /> Download Zipped Package
                </Button>
              )}
            </div>

            <div className="divide-y max-h-[300px] overflow-y-auto pr-1">
              {images.map(item => {
                const saving = getReductionPct(item.originalSize, item.compressedSize);
                const isActive = item.id === activeId;
                
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${isActive ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                    onClick={() => setActiveId(item.id)}
                  >
                    {/* Tiny Thumbnail */}
                    <div className="w-10 h-10 rounded-lg border bg-muted/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img src={item.previewUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">Original: {formatBytes(item.originalSize)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Savings color box */}
                      {item.success && item.compressedSize && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSavingsColorClass(item.originalSize, item.compressedSize)}`}>
                          {saving}% Saved ({formatBytes(item.compressedSize)})
                        </div>
                      )}

                      {/* Status loaders */}
                      {item.processing && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      {item.error && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}

                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {item.success && item.blob && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => downloadSingleImage(item)}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeImage(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
