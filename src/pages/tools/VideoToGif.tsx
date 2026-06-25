import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { getFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function VideoToGif() {
  const tool = getToolById('video-to-gif')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewGif, setPreviewGif] = useState<string | null>(null);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);
  useEffect(() => { return () => { if (previewGif) URL.revokeObjectURL(previewGif); }; }, [previewGif]);

  const convertToGif = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const ffmpeg = await getFFmpeg();
      const handler = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      ffmpeg.on('progress', handler);

      try {
        const ext = file.name.split('.').pop() || 'mp4';
        const inputName = `input.${ext}`;
        const data = await readFileAsUint8Array(file);
        await ffmpeg.writeFile(inputName, data);

        const filters = `fps=${fps},scale=480:-1:flags=lanczos`;
        await ffmpeg.exec(['-i', inputName, '-vf', `${filters},palettegen=stats_mode=diff`, '-y', 'palette.png']);
        await ffmpeg.exec([
          '-i', inputName, '-i', 'palette.png',
          '-lavfi', `${filters} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3`,
          '-y', 'output.gif',
        ]);

        const result = await ffmpeg.readFile('output.gif');
        const blob = new Blob([result as unknown as BlobPart], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        setPreviewGif(url);
        const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, '.gif'); a.click();

        try { await ffmpeg.deleteFile(inputName); } catch { /* ignore cleanup error */ }
        try { await ffmpeg.deleteFile('palette.png'); } catch { /* ignore cleanup error */ }
        try { await ffmpeg.deleteFile('output.gif'); } catch { /* ignore cleanup error */ }

        toast({ title: 'GIF created!' });
      } finally {
        ffmpeg.off('progress', handler);
      }
    } catch (e) {
      console.error('VideoToGif failed:', e);
      toast({ title: 'Conversion failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm', '.mov'] }} maxSize={200 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => { setFile(null); setPreviewGif(null); }} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            {previewUrl && <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />}
            <div>
              <label className="text-sm text-muted-foreground block mb-1">FPS ({fps})</label>
              <input type="range" min={5} max={30} value={fps} onChange={(e) => setFps(+e.target.value)} className="w-full" />
            </div>
            <Button onClick={convertToGif} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Converting... ${progress}%` : 'Convert to GIF'}</Button>
            {previewGif && <img src={previewGif} alt="GIF preview" className="w-full max-h-64 rounded-xl" />}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
