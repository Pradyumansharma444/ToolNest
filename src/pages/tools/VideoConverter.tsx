import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

const FORMATS: Record<string, { mime: string; codec: string[] }> = {
  mp4: { mime: 'video/mp4', codec: ['-c:v', 'libx264', '-c:a', 'aac'] },
  webm: { mime: 'video/webm', codec: ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'] },
  avi: { mime: 'video/x-msvideo', codec: ['-c:v', 'libx264', '-c:a', 'aac'] },
  mov: { mime: 'video/quicktime', codec: ['-c:v', 'libx264', '-c:a', 'aac'] },
};

export default function VideoConverter() {
  const tool = getToolById('video-converter')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [targetExt, setTargetExt] = useState('mp4');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const srcExt = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${srcExt}`;
      const outputName = `output.${targetExt}`;
      const data = await readFileAsUint8Array(file);
      const fmt = FORMATS[targetExt];
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      let blob: Blob;
      try {
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, ...fmt.codec, '-y', outputName],
          outputName,
          onProgress
        );
      } catch (err) {
        console.warn('Conversion with audio failed (possibly a silent video), retrying without audio...', err);
        const cleanCodec: string[] = [];
        for (let i = 0; i < fmt.codec.length; i++) {
          if (fmt.codec[i] === '-c:a') {
            i++; // Skip next arg (e.g. 'aac', 'libopus')
            continue;
          }
          cleanCodec.push(fmt.codec[i]);
        }
        blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, ...cleanCodec, '-an', '-y', outputName],
          outputName,
          onProgress
        );
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, `.${targetExt}`); a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Converted to ${targetExt.toUpperCase()}` });
    } catch (e) {
      console.error('VideoConverter failed:', e);
      toast({ title: 'Conversion failed', variant: 'destructive' });
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
            <div className="flex gap-2 items-center">
              <Select value={targetExt} onValueChange={setTargetExt}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="avi">AVI</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={convert} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Converting... ${progress}%` : 'Convert'}</Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
