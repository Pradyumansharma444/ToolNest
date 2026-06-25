import { useState, useRef } from 'react';
import { Monitor, Square, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ScreenRecorder() {
  const tool = getToolById('screen-recorder')!;
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState('');
  const [ext, setExt] = useState('webm');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const mime = mediaRecorder.current?.mimeType || 'video/webm';
        const isMp4 = mime.includes('mp4') || mime.includes('quicktime');
        const extension = isMp4 ? 'mp4' : 'webm';
        setExt(extension);
        const blob = new Blob(chunks.current, { type: mime });
        setPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
      toast({ title: 'Recording started. Click "Stop" when done.' });
    } catch { toast({ title: 'Screen capture cancelled or denied', variant: 'destructive' }); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!preview}>
      <div className="space-y-4">
        <Button onClick={recording ? stopRecording : startRecording}>
          {recording ? <Square className="w-4 h-4 mr-1" /> : <Monitor className="w-4 h-4 mr-1" />}
          {recording ? 'Stop Recording' : 'Start Screen Recording'}
        </Button>
        {preview && (
          <div className="rounded-xl border bg-card p-4">
            <video src={preview} controls className="w-full rounded-lg" />
            <a href={preview} download={`screen-recording.${ext}`} className="flex items-center gap-1 text-sm text-primary hover:underline mt-2 inline-block">
              <Download className="w-4 h-4" /> Download Recording ({ext.toUpperCase()})
            </a>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
