import { useState, useRef } from 'react';
import { Mic, Square, Download } from 'lucide-react';
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

export default function KaraokeRecorder() {
  const tool = getToolById('karaoke-recorder')!;
  const { toast } = useToast();
  const [backingTrack, setBackingTrack] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [mixUrl, setMixUrl] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const backingSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    if (!backingTrack) {
      toast({ title: 'Please upload a backing track first', variant: 'destructive' });
      return;
    }

    setDecoding(true);
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      toast({ title: 'Decoding backing track...', description: 'Please wait a moment.' });
      const backingArrayBuffer = await backingTrack.arrayBuffer();
      const backingBuffer = await audioCtx.decodeAudioData(backingArrayBuffer);

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;
      const micSource = audioCtx.createMediaStreamSource(micStream);

      const destination = audioCtx.createMediaStreamDestination();

      const backingSource = audioCtx.createBufferSource();
      backingSource.buffer = backingBuffer;
      backingSource.loop = true;
      backingSourceRef.current = backingSource;

      // Connect nodes
      backingSource.connect(audioCtx.destination); // singer hears it
      backingSource.connect(destination); // recorded

      micSource.connect(destination); // recorded (not routed to speaker to prevent acoustic loopback)

      const mr = new MediaRecorder(destination.stream);
      mediaRecorder.current = mr;
      chunks.current = [];

      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        try {
          const rawBlob = new Blob(chunks.current, { type: mr.mimeType || 'audio/webm' });
          const arrayBuffer = await rawBlob.arrayBuffer();
          const decodeCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const decoded = await decodeCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(decoded);
          setMixUrl(URL.createObjectURL(wavBlob));
          await decodeCtx.close();
          toast({ title: 'Mix complete! Ready for download.' });
        } catch (err) {
          console.error('Failed to decode mixed audio', err);
          const fallbackBlob = new Blob(chunks.current, { type: 'audio/webm' });
          setMixUrl(URL.createObjectURL(fallbackBlob));
          toast({ title: 'Mix saved as WebM format due to encoding error', variant: 'destructive' });
        }
      };

      backingSource.start(0);
      mr.start();
      setRecording(true);
      toast({ title: 'Recording voice + backing track' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Microphone access denied or audio processing failed', variant: 'destructive' });
    } finally {
      setDecoding(false);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    backingSourceRef.current?.stop();
    backingSourceRef.current?.disconnect();
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    setRecording(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!mixUrl}>
      <div className="space-y-4">
        <FileUpload accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }} maxSize={50 * 1024 * 1024}
          onFilesSelected={(f) => setBackingTrack(f[0])} onFileRemoved={() => { setBackingTrack(null); setMixUrl(''); }} selectedFile={backingTrack} />
        
        <Button onClick={recording ? stopRecording : startRecording} disabled={decoding}>
          {recording ? <Square className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
          {decoding ? 'Processing track...' : recording ? 'Stop & Compile Mix' : 'Record Voice with Backing Track'}
        </Button>
        
        {mixUrl && (
          <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
            <p className="text-sm font-medium">Your Karaoke Recording (Mixed Vocals + Backing Track)</p>
            <audio src={mixUrl} controls className="w-full" />
            <a href={mixUrl} download="karaoke-mix.wav" className="flex items-center gap-1 text-sm text-primary hover:underline mt-1 self-start">
              <Download className="w-4 h-4" /> Download WAV
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
