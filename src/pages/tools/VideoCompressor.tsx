import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, formatBytes } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function VideoCompressor() {
  const tool = getToolById('video-compressor')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(28);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `output.${ext}`;
      const data = await readFileAsUint8Array(file);
      const crf = Math.round(51 - (quality / 100) * 51);
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      let blob: Blob;
      try {
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, '-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast', '-c:a', 'aac', '-b:a', '128k', outputName],
          outputName,
          onProgress
        );
      } catch (err) {
        console.warn('Compression with audio failed (possibly a silent video), retrying without audio...', err);
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, '-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast', '-an', outputName],
          outputName,
          onProgress
        );
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, '_compressed.' + ext); a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Compressed! ${formatBytes(file.size)} → ${formatBytes(blob.size)}` });
    } catch (e) {
      console.error('VideoCompressor failed:', e);
      toast({ title: 'Compression failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm', '.avi', '.mov'] }} maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            {previewUrl && <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />}
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Quality: {quality}%</label>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full" />
            </div>
            <Button onClick={handleCompress} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Compressing... ${progress}%` : 'Compress & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
