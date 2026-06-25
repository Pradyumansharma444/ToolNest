import { useState } from 'react';
import { RefreshCw, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { loadImage, canvasToBlob, downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const formats: { value: OutputFormat; label: string; ext: string }[] = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];

export default function ConvertImage() {
  const tool = getToolById('convert-image')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const convertImage = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = await loadImage(preview);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const blob = await canvasToBlob(canvas, outputFormat, 0.95);
      setResult(blob);
      const format = formats.find(f => f.value === outputFormat);
      downloadBlob(blob, `converted.${format?.ext || 'png'}`);
      toast({ title: 'Conversion complete!', description: `Converted to ${format?.label}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert image.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPreview(''); setResult(null); }}
          label="Upload Image"
          description="JPG, PNG, WebP, GIF, BMP supported"
        />

        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-lg" />
          </div>
        )}

        {file && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <label className="text-sm font-medium">Output Format</label>
            <div className="flex gap-2">
              {formats.map(f => (
                <Button
                  key={f.value}
                  variant={outputFormat === f.value ? 'default' : 'outline'}
                  onClick={() => setOutputFormat(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {file && (
          <Button onClick={convertImage} disabled={processing} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Convert</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Image converted successfully!
            </p>
            <Button onClick={() => {
              const format = formats.find(f => f.value === outputFormat);
              downloadBlob(result, `converted.${format?.ext || 'png'}`);
            }}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
