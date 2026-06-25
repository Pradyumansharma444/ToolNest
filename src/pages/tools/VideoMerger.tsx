import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, formatBytes } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

export default function VideoMerger() {
  const tool = getToolById('video-merger')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = (newFiles: File[]) => setFiles(prev => [...prev, ...newFiles]);
  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) { toast({ title: 'Add at least 2 videos', variant: 'destructive' }); return; }
    setProcessing(true);
    setProgress(0);
    try {
      const ext = files[0].name.split('.').pop() || 'mp4';
      const inputFiles: { name: string; data: Uint8Array }[] = [];
      let concatList = '';
      for (let i = 0; i < files.length; i++) {
        const name = `input_${i}.${ext}`;
        const data = await readFileAsUint8Array(files[i]);
        inputFiles.push({ name, data });
        concatList += `file '${name}'\n`;
      }
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
      const blob = await runFFmpeg(
        [...inputFiles, { name: 'list.txt', data: new TextEncoder().encode(concatList) }],
        ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', `merged.${ext}`],
        `merged.${ext}`,
        onProgress
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `merged_video.${ext}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Merged ${files.length} videos (${formatBytes(blob.size)})` });
    } catch (e) {
      console.error('VideoMerger failed:', e);
      toast({ title: 'Merging failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={files.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm', '.avi', '.mov'] }} maxFiles={10} multiple maxSize={500 * 1024 * 1024}
          onFilesSelected={addFiles} label="Add Video Files" description="Add videos in merge order" />
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-2 text-sm">
                  <span className="truncate flex-1">{i + 1}. {f.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeFile(i)}><X className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
            <Button onClick={merge} disabled={files.length < 2 || processing}><Download className="w-4 h-4 mr-1" />{processing ? `Merging... ${progress}%` : 'Merge & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
