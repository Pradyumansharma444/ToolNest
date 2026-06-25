import { useState, useCallback, useEffect } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'invert' | 'warm' | 'cool' | 'dramatic';

interface FilterDef {
  name: string;
  filter: string;
}

const FILTERS: Record<FilterType, FilterDef> = {
  none: { name: 'None', filter: 'none' },
  grayscale: { name: 'Grayscale', filter: 'grayscale(100%)' },
  sepia: { name: 'Sepia', filter: 'sepia(100%)' },
  vintage: { name: 'Vintage', filter: 'sepia(50%) contrast(1.2) brightness(0.9) saturate(0.8)' },
  invert: { name: 'Invert', filter: 'invert(100%)' },
  warm: { name: 'Warm', filter: 'sepia(30%) saturate(1.5) brightness(1.1)' },
  cool: { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.05)' },
  dramatic: { name: 'Dramatic', filter: 'contrast(1.4) saturate(1.3) brightness(0.9)' },
};

export default function ArtFilters() {
  const tool = getToolById('art-filters')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [intensity, setIntensity] = useState(100);
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

  const applyFilter = useCallback(async () => {
    if (!preview || !file || activeFilter === 'none') {
      if (preview && !canvasPreview) setCanvasPreview(preview);
      return;
    }
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      const filterDef = FILTERS[activeFilter];
      const filterStr = filterDef.filter.replace(/(\d+%?)/g, (match) => {
        const num = parseFloat(match);
        if (isNaN(num)) return match;
        const unit = match.replace(String(num), '');
        return String(num * (intensity / 100)) + unit;
      });

      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      const dataUrl = canvas.toDataURL(file.type, 0.95);
      setCanvasPreview(dataUrl);
    } catch {
      // silently fail
    }
  }, [preview, file, activeFilter, intensity, canvasPreview]);

  useEffect(() => {
    if (preview) applyFilter();
  }, [preview, activeFilter, intensity, applyFilter]);

  const downloadFiltered = async () => {
    if (!canvasPreview || !file) return;
    setProcessing(true);
    try {
      const img = await loadImage(canvasPreview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      downloadBlob(blob, `filtered-${activeFilter}.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Filtered image downloaded!' });
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
          <div className="rounded-xl border bg-card p-5 space-y-4">
            {/* Filter Grid */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filter</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {(Object.keys(FILTERS) as FilterType[]).map(f => (
                  <Button
                    key={f}
                    variant={activeFilter === f ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(f)}
                    className="text-xs"
                  >
                    {FILTERS[f].name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            {activeFilter !== 'none' && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>Intensity</span>
                  <span>{intensity}%</span>
                </div>
                <Slider value={[intensity]} onValueChange={(v) => setIntensity(v[0])} min={0} max={200} step={5} />
              </div>
            )}
          </div>
        )}

        {file && (
          <Button onClick={downloadFiltered} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Wand2 className="w-4 h-4 mr-2" /> Download Filtered Image</>}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
