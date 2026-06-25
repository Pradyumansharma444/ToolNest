import { useState } from 'react';
import { Share2, Loader2, Download, Instagram, Facebook, Linkedin, Youtube, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const presets = [
  { name: 'Instagram Post', width: 1080, height: 1080, icon: Instagram },
  { name: 'Instagram Story', width: 1080, height: 1920, icon: Instagram },
  { name: 'Instagram Reel', width: 1080, height: 1920, icon: Instagram },
  { name: 'Facebook Cover', width: 820, height: 312, icon: Facebook },
  { name: 'Facebook Post', width: 1200, height: 630, icon: Facebook },
  { name: 'Twitter/X Post', width: 1200, height: 675, icon: Twitter },
  { name: 'Twitter/X Header', width: 1500, height: 500, icon: Twitter },
  { name: 'LinkedIn Banner', width: 1584, height: 396, icon: Linkedin },
  { name: 'LinkedIn Post', width: 1200, height: 627, icon: Linkedin },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: Youtube },
  { name: 'YouTube Banner', width: 2560, height: 1440, icon: Youtube },
  { name: 'Pinterest Pin', width: 1000, height: 1500, icon: Share2 },
];

export default function SocialMediaResize() {
  const tool = getToolById('social-media-resize')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [lastSize, setLastSize] = useState({ w: 0, h: 0 });

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const resizeToPreset = async (width: number, height: number) => {
    if (!file || !preview) return;
    setProcessing(true);
    setResult(null);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Center crop to fill
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, file.type, 0.95);
      setResult(blob);
      setLastSize({ w: width, h: height });
      downloadBlob(blob, `resized-${width}x${height}.${file.name.split('.').pop() || 'png'}`);
      toast({ title: 'Success!', description: `Resized to ${width}x${height}.` });
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
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(null); }}
          label="Upload Image"
        />

        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg" />
          </div>
        )}

        {/* Presets Grid */}
        {file && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {presets.map(preset => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => resizeToPreset(preset.width, preset.height)}
                  disabled={processing}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <p className="text-xs font-medium">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground">{preset.width}x{preset.height}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {processing && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Resizing...</p>
          </div>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Resized to {lastSize.w}x{lastSize.h}!
            </p>
            <Button onClick={() => downloadBlob(result, `resized-${lastSize.w}x${lastSize.h}.${file?.name.split('.').pop() || 'png'}`)}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
