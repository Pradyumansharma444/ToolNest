import { useState, useRef, useMemo, useEffect } from 'react';
import { Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function AudioVolume() {
  const tool = getToolById('audio-volume')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);
  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  const applyAndDownload = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const decoded = await new AudioContext().decodeAudioData(buf);
      const outputLength = Math.ceil(decoded.length / speed);
      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        outputLength,
        decoded.sampleRate
      );
      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;
      const gain = offlineCtx.createGain();
      gain.gain.value = volume;
      source.playbackRate.value = speed;
      source.connect(gain);
      gain.connect(offlineCtx.destination);
      source.start(0);
      const rendered = await offlineCtx.startRendering();
      const blob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `adjusted_${file.name.replace(/\.[^.]+$/, '.wav')}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Adjusted audio downloaded!' });
    } catch (e) {
      console.error('AudioVolume failed:', e);
      toast({ title: 'Processing failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
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
            <audio ref={audioRef} src={previewUrl || undefined} onEnded={() => setPlaying(false)} />
            <Button size="sm" variant="outline" onClick={togglePlay}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} Preview</Button>
            <div><label className="text-sm text-muted-foreground block">Volume: {(volume * 100).toFixed(0)}%</label><input type="range" min={0} max={2} step={0.1} value={volume} onChange={(e) => setVolume(+e.target.value)} className="w-full" /></div>
            <div><label className="text-sm text-muted-foreground block">Speed: {speed.toFixed(1)}x</label><input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full" /></div>
            <Button onClick={applyAndDownload} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? 'Processing...' : 'Download Adjusted Audio'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
