import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function ReverseVideo() {
  const tool = getToolById('reverse-video')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const reverse = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `reversed.${ext}`;
      const data = await readFileAsUint8Array(file);
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      let blob: Blob;
      try {
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, '-vf', 'reverse', '-af', 'areverse', '-y', outputName],
          outputName,
          onProgress
        );
      } catch (err) {
        console.warn('Reversing with audio failed (possibly a silent video), retrying without audio...', err);
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, '-vf', 'reverse', '-an', '-y', outputName],
          outputName,
          onProgress
        );
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, '_reversed.' + ext); a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Reversed video downloaded!' });
    } catch (e) {
      console.error('ReverseVideo failed:', e);
      toast({ title: 'Reversal failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm', '.mov'] }} maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            {previewUrl && <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />}
            <Button onClick={reverse} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Reversing... ${progress}%` : 'Reverse & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
