import { useState, useRef } from 'react';
import { Download, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

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

export default function VoiceRecorder() {
  const tool = getToolById('voice-recorder')!;
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        try {
          const rawBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(decoded);
          setAudioUrl(URL.createObjectURL(wavBlob));
          await audioCtx.close();
        } catch (err) {
          console.error('Failed to decode audio to WAV', err);
          const fallbackBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioUrl(URL.createObjectURL(fallbackBlob));
          toast({ title: 'Saved as fallback WebM/MP4 format due to decode error', variant: 'destructive' });
        }
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setDuration(0);
      };
      mr.start();
      setRecording(true);
      const start = Date.now();
      timerRef.current = window.setInterval(() => setDuration(((Date.now() - start) / 1000)), 100);
    } catch { toast({ title: 'Microphone access denied', variant: 'destructive' }); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    toast({ title: 'Recording saved!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!audioUrl}>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 p-8 rounded-xl border bg-card">
          {!recording ? (
            <Button size="lg" onClick={startRecording} className="w-24 h-24 rounded-full">
              <Mic className="w-10 h-10" />
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stopRecording} className="w-24 h-24 rounded-full animate-pulse">
              <Square className="w-10 h-10" />
            </Button>
          )}
          <p className="text-lg font-mono">{duration.toFixed(1)}s</p>
          <p className="text-sm text-muted-foreground">{recording ? 'Recording... click to stop' : 'Click to start recording'}</p>
        </div>
        {audioUrl && (
          <div className="space-y-2">
            <audio src={audioUrl} controls className="w-full" />
            <Button onClick={() => { const a = document.createElement('a'); a.href = audioUrl!; a.download = 'recording.wav'; a.click(); toast({ title: 'Downloaded!' }); }}>
              <Download className="w-4 h-4 mr-1" />Download WAV
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
