import { useState, useRef, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function VideoTrimmer() {
  const tool = getToolById('video-trimmer')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('10');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const handleTrim = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `trimmed.${ext}`;
      const data = await readFileAsUint8Array(file);
      const startS = parseFloat(start);
      const dur = parseFloat(end) - startS;
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      let blob: Blob;
      try {
        // First try: fast trim using stream copy
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, '-ss', String(startS), '-t', String(dur), '-c', 'copy', outputName],
          outputName,
          onProgress
        );
      } catch (err) {
        console.warn('Trim with -c copy failed. Retrying by re-encoding...', err);
        try {
          // Second try: re-encode video and audio
          blob = await runFFmpeg(
            [{ name: inputName, data }],
            ['-i', inputName, '-ss', String(startS), '-t', String(dur), '-c:v', 'libx264', '-preset', 'fast', '-c:a', 'aac', outputName],
            outputName,
            onProgress
          );
        } catch (err2) {
          console.warn('Trim with re-encoding failed (possibly silent video). Retrying with audio disabled...', err2);
          // Third try: re-encode video only, strip audio
          blob = await runFFmpeg(
            [{ name: inputName, data }],
            ['-i', inputName, '-ss', String(startS), '-t', String(dur), '-c:v', 'libx264', '-preset', 'fast', '-an', outputName],
            outputName,
            onProgress
          );
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `trimmed_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Trimmed video downloaded!' });
    } catch (e) {
      console.error('VideoTrimmer failed:', e);
      toast({ title: 'Trim failed', variant: 'destructive' });
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
            <video ref={videoRef} src={previewUrl || undefined} onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} controls className="w-full max-h-64 rounded-xl" />
            <p className="text-sm text-muted-foreground">Duration: {duration.toFixed(1)}s</p>
            <div className="flex gap-4">
              <div><label className="text-sm text-muted-foreground block">Start (s)</label><Input type="number" min={0} max={duration} step={0.1} value={start} onChange={(e) => setStart(e.target.value)} /></div>
              <div><label className="text-sm text-muted-foreground block">End (s)</label><Input type="number" min={0} max={duration} step={0.1} value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            </div>
            <Button onClick={handleTrim} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Trimming... ${progress}%` : 'Trim & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
