import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';

export default function AudioMerger() {
  const tool = getToolById('audio-merger')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const addFiles = (newFiles: File[]) => setFiles(prev => [...prev, ...newFiles]);
  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) { toast({ title: 'Add at least 2 audio files', variant: 'destructive' }); return; }
    try {
      const ac = new AudioContext();
      const buffers = await Promise.all(files.map(async f => {
        const buf = await f.arrayBuffer();
        return ac.decodeAudioData(buf);
      }));
      const totalLength = buffers.reduce((s, b) => s + b.length, 0);
      const merged = ac.createBuffer(2, totalLength, ac.sampleRate);
      let offset = 0;
      for (const buf of buffers) {
        const srcLeft = buf.getChannelData(0);
        const srcRight = buf.numberOfChannels > 1 ? buf.getChannelData(1) : srcLeft;
        merged.getChannelData(0).set(srcLeft, offset);
        merged.getChannelData(1).set(srcRight, offset);
        offset += buf.length;
      }
      const wav = audioBufferToWav(merged);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'merged_audio.wav'; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Merged ${files.length} tracks` });
    } catch { toast({ title: 'Merging failed', variant: 'destructive' }); }
  };

  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
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

    return wav;
  }

  return (
    <ToolLayout tool={tool} resultVisible={files.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }} maxFiles={10} multiple maxSize={100 * 1024 * 1024}
          onFilesSelected={addFiles} label="Add Audio Files" description="Add tracks in merge order" />
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
            <Button onClick={merge} disabled={files.length < 2}><Download className="w-4 h-4 mr-1" />Merge & Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
