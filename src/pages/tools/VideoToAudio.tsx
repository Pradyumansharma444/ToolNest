import { useState, useMemo, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function VideoToAudio() {
  const tool = getToolById('video-to-audio')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [ext, setExt] = useState('mp3');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const extract = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const srcExt = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${srcExt}`;
      const outputName = `output.${ext}`;
      const data = await readFileAsUint8Array(file);
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      const args: string[] = ['-i', inputName, '-vn'];
      if (ext === 'mp3') args.push('-codec:a', 'libmp3lame', '-q:a', '2');
      else if (ext === 'wav') args.push('-codec:a', 'pcm_s16le');
      else if (ext === 'ogg') args.push('-codec:a', 'libvorbis', '-q:a', '4');
      else if (ext === 'flac') args.push('-codec:a', 'flac');
      args.push(outputName);
      const blob = await runFFmpeg([{ name: inputName, data }], args, outputName, onProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, `.${ext}`); a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Audio extracted!' });
    } catch (e) {
      console.error('VideoToAudio failed:', e);
      toast({ title: 'Extraction failed. Try a different video format.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }} maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            {previewUrl && <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />}
            <div className="flex gap-2 items-center">
              <Select value={ext} onValueChange={setExt}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={extract} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Extracting... ${progress}%` : 'Extract Audio'}</Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
