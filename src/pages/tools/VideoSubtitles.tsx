import { useState, useMemo, useEffect } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

const escapeDrawText = (t: string) => {
  return t
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:')
    .replace(/%/g, '\\%');
};

function parseSrt(srtText: string): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  const blocks = srtText.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 3) {
      const timeLineIndex = lines.findIndex(l => l.includes('-->'));
      if (timeLineIndex !== -1) {
        const timeLine = lines[timeLineIndex];
        const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
        if (timeMatch) {
          const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
          const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
          const text = lines.slice(timeLineIndex + 1).join(' ');
          if (text) {
            segments.push({ start, end, text });
          }
        }
      }
    }
  }
  return segments;
}

export default function VideoSubtitles() {
  const tool = getToolById('video-subtitles')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const burnSubtitles = async () => {
    if (!file) return;
    
    let segments: SubtitleSegment[] = [];
    if (srtFile) {
      try {
        const srtText = await srtFile.text();
        segments = parseSrt(srtText);
      } catch (err) {
        console.error('Failed to parse SRT file', err);
        toast({ title: 'Error reading SRT file', variant: 'destructive' });
        return;
      }
    } else if (text.trim()) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach((line, i) => {
        segments.push({
          start: i * 5,
          end: (i + 1) * 5,
          text: line,
        });
      });
    }

    if (segments.length === 0) {
      toast({ title: 'Please enter subtitle text or upload an SRT file', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Fetch Roboto TTF font from CDN
      toast({ title: 'Preparing rendering environment...', description: 'Downloading fonts.' });
      let fontBuffer: Uint8Array;
      try {
        const fontResponse = await fetch('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf');
        if (!fontResponse.ok) throw new Error('Font download failed');
        fontBuffer = new Uint8Array(await fontResponse.arrayBuffer());
      } catch (err) {
        console.error(err);
        toast({ title: 'Font download failed', description: 'Please check your internet connection and try again.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const ext = file.name.split('.').pop() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `output.mp4`;
      const data = await readFileAsUint8Array(file);
      const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));

      // Build chained drawtext filters
      const filters = segments.map(seg => {
        const escaped = escapeDrawText(seg.text);
        return `drawtext=fontfile=font.ttf:text='${escaped}':enable='between(t,${seg.start},${seg.end})':x=(w-text_w)/2:y=h-40-${fontSize}:fontsize=${fontSize}:fontcolor=white:borderw=2:bordercolor=black`;
      });
      const filterChain = filters.join(',');

      let blob: Blob;
      try {
        // First try: output with audio copy
        blob = await runFFmpeg(
          [{ name: inputName, data }, { name: 'font.ttf', data: fontBuffer }],
          [
            '-i', inputName,
            '-vf', filterChain,
            '-c:a', 'copy',
            '-y', outputName,
          ],
          outputName,
          onProgress
        );
      } catch (err) {
        console.warn('Primary subtitles burn failed (probably silent video). Retrying with audio stripped...', err);
        // Second try: strip audio entirely
        blob = await runFFmpeg(
          [{ name: inputName, data }, { name: 'font.ttf', data: fontBuffer }],
          [
            '-i', inputName,
            '-vf', filterChain,
            '-an',
            '-y', outputName,
          ],
          outputName,
          onProgress
        );
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, '_subtitled.mp4'); a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Subtitles burned into video!' });
    } catch (e) {
      console.error('VideoSubtitles failed:', e);
      toast({ title: 'Failed to burn subtitles', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'video/*': ['.mp4', '.webm'] }} maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            {previewUrl && <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />}
            
            <div className="space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm font-medium">Subtitle Source</p>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Option 1: Paste/Type subtitle text (one line per 5 seconds)</label>
                <Textarea placeholder="Line 1 (seconds 0-5)&#10;Line 2 (seconds 5-10)&#10;Line 3 (seconds 10-15)" value={text} onChange={(e) => { setText(e.target.value); if (e.target.value) setSrtFile(null); }} className="min-h-[100px]" />
              </div>
              
              <div className="flex items-center gap-2 py-1">
                <span className="h-[1px] bg-border flex-grow" />
                <span className="text-xs text-muted-foreground uppercase font-semibold">Or</span>
                <span className="h-[1px] bg-border flex-grow" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Option 2: Upload `.srt` subtitle file</label>
                {!srtFile ? (
                  <div className="relative border border-dashed rounded-lg p-3 text-center hover:bg-muted/50 cursor-pointer">
                    <input type="file" accept=".srt" onChange={(e) => { const f = e.target.files?.[0] || null; setSrtFile(f); if (f) setText(''); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Click to upload SRT file</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border rounded-lg p-2 text-sm bg-muted/30">
                    <span className="flex items-center gap-1.5 truncate"><FileText className="w-4 h-4 text-primary" /> {srtFile.name}</span>
                    <Button size="sm" variant="ghost" className="text-destructive h-7 px-2" onClick={() => setSrtFile(null)}>Remove</Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Font Size: {fontSize}px</label>
              <input type="range" min={12} max={72} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
            </div>
            
            <Button onClick={burnSubtitles} disabled={processing} className="w-full">
              <Download className="w-4 h-4 mr-1" />
              {processing ? `Burning... ${progress}%` : 'Burn Subtitles & Download'}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
