import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, formatBytes } from '@/data/tools';
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

export default function AudioCompressor() {
  const tool = getToolById('audio-compressor')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(-24);
  const [ratio, setRatio] = useState(12);
  const [processing, setProcessing] = useState(false);

  const compress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const decoded = await new AudioContext().decodeAudioData(buf);
      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        decoded.length,
        decoded.sampleRate
      );
      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;
      const compressor = offlineCtx.createDynamicsCompressor();
      compressor.threshold.value = threshold;
      compressor.ratio.value = ratio;
      source.connect(compressor);
      compressor.connect(offlineCtx.destination);
      source.start(0);
      const rendered = await offlineCtx.startRendering();
      const blob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `compressed_${file.name.replace(/\.[^.]+$/, '.wav')}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Compressed! ${formatBytes(file.size)} → ${formatBytes(blob.size)}` });
    } catch (e) {
      console.error('AudioCompressor failed:', e);
      toast({ title: 'Compression failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }} maxSize={100 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="space-y-4">
            <div><label className="text-sm text-muted-foreground block">Threshold: {threshold} dB</label><input type="range" min={-60} max={0} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-full" /></div>
            <div><label className="text-sm text-muted-foreground block">Ratio: {ratio}:1</label><input type="range" min={1} max={20} value={ratio} onChange={(e) => setRatio(+e.target.value)} className="w-full" /></div>
            <Button onClick={compress} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? 'Compressing...' : 'Compress & Download'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
