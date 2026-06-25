import { useState, useRef, useMemo, useEffect } from 'react';
import { Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const totalLength = numFrames * numCh;
  const wav = new ArrayBuffer(44 + totalLength * 2);
  const view = new DataView(wav);

  const ws = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  ws(0, 'RIFF');
  view.setUint32(4, 36 + totalLength * 2, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  ws(36, 'data');
  view.setUint32(40, totalLength * 2, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const pcmSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, pcmSample, true);
      offset += 2;
    }
  }

  return new Blob([wav], { type: 'audio/wav' });
}

export default function AudioTrimmer() {
  const tool = getToolById('audio-trimmer')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('30');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const trim = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const decoded = await new AudioContext().decodeAudioData(buf);
      const startS = parseFloat(start);
      const endS = parseFloat(end);
      const startSample = Math.floor(startS * decoded.sampleRate);
      const endSample = Math.floor(endS * decoded.sampleRate);
      const trimLength = endSample - startSample;
      if (trimLength <= 0) { toast({ title: 'Invalid trim range', variant: 'destructive' }); return; }
      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        trimLength,
        decoded.sampleRate
      );
      const trimmedBuffer = offlineCtx.createBuffer(
        decoded.numberOfChannels,
        trimLength,
        decoded.sampleRate
      );
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const src = decoded.getChannelData(ch);
        const dst = trimmedBuffer.getChannelData(ch);
        for (let i = 0; i < trimLength; i++) dst[i] = src[startSample + i];
      }
      const source = offlineCtx.createBufferSource();
      source.buffer = trimmedBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);
      const rendered = await offlineCtx.startRendering();
      const blob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `trimmed_${file.name.replace(/\.[^.]+$/, '.wav')}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Trimmed audio downloaded!' });
    } catch (e) {
      console.error('AudioTrimmer failed:', e);
      toast({ title: 'Trim failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }} maxSize={100 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            <audio ref={audioRef} src={previewUrl || undefined} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setPlaying(false)} />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={togglePlay}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
              <span className="text-sm text-muted-foreground">Duration: {duration.toFixed(1)}s</span>
            </div>
            <div className="flex gap-4">
              <div><label className="text-sm text-muted-foreground block">Start (s)</label><Input type="number" min={0} max={duration} step={0.1} value={start} onChange={(e) => setStart(e.target.value)} /></div>
              <div><label className="text-sm text-muted-foreground block">End (s)</label><Input type="number" min={0} max={duration} step={0.1} value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            </div>
            <Button onClick={trim} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? 'Trimming...' : 'Trim & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
