import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { runFFmpeg, readFileAsUint8Array, type FFmpegProgress } from '@/lib/ffmpeg';

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

const OUTPUT_FORMATS: Record<string, { ext: string; mime: string; useFFmpeg: boolean; args: string[] }> = {
  mp3: { ext: 'mp3', mime: 'audio/mpeg', useFFmpeg: true, args: ['-codec:a', 'libmp3lame', '-q:a', '2'] },
  wav: { ext: 'wav', mime: 'audio/wav', useFFmpeg: false, args: ['-codec:a', 'pcm_s16le'] },
  ogg: { ext: 'ogg', mime: 'audio/ogg', useFFmpeg: true, args: ['-codec:a', 'libvorbis', '-q:a', '4'] },
  flac: { ext: 'flac', mime: 'audio/flac', useFFmpeg: true, args: ['-codec:a', 'flac'] },
  m4a: { ext: 'm4a', mime: 'audio/mp4', useFFmpeg: true, args: ['-codec:a', 'aac', '-b:a', '192k'] },
};

export default function AudioConverter() {
  const tool = getToolById('audio-converter')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [targetExt, setTargetExt] = useState('mp3');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    try {
      const format = OUTPUT_FORMATS[targetExt];
      if (!format) {
        toast({ title: 'Unsupported format', variant: 'destructive' });
        return;
      }

      if (format.useFFmpeg) {
        const inputName = `input.${file.name.split('.').pop() || 'wav'}`;
        const outputName = `output.${format.ext}`;
        const data = await readFileAsUint8Array(file);
        const onProgress = ({ progress: p }: FFmpegProgress) => setProgress(Math.round(p * 100));
        const blob = await runFFmpeg(
          [{ name: inputName, data }],
          ['-i', inputName, ...format.args, outputName],
          outputName,
          onProgress
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, `.${format.ext}`); a.click();
        URL.revokeObjectURL(url);
      } else {
        const buf = await file.arrayBuffer();
        const decoded = await new AudioContext().decodeAudioData(buf);
        const blob = audioBufferToWav(decoded);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.[^.]+$/, '.wav'); a.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: `Converted to ${targetExt.toUpperCase()}` });
    } catch (e) {
      console.error('AudioConverter failed:', e);
      toast({ title: 'Conversion failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a'] }} maxSize={100 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && (
          <div className="flex gap-2 items-center">
            <Select value={targetExt} onValueChange={setTargetExt}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="ogg">OGG</SelectItem>
                <SelectItem value="flac">FLAC</SelectItem>
                <SelectItem value="m4a">M4A</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={convert} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? `Converting... ${progress}%` : 'Convert'}</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
