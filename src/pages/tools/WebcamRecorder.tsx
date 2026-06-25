import { useState, useRef } from 'react';
import { Camera, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function WebcamRecorder() {
  const tool = getToolById('webcam-recorder')!;
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [recorded, setRecorded] = useState('');
  const [ext, setExt] = useState('webm');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { toast({ title: 'Camera access denied', variant: 'destructive' }); }
  };

  const stopCam = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const snap = () => {
    const c = canvasRef.current!;
    const v = videoRef.current!;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setPhotos(prev => [...prev, c.toDataURL('image/png')]);
    toast({ title: 'Photo captured!' });
  };

  const startRecord = () => {
    if (!stream) return;
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const mime = mediaRecorder.current?.mimeType || 'video/webm';
      const isMp4 = mime.includes('mp4') || mime.includes('quicktime');
      const extension = isMp4 ? 'mp4' : 'webm';
      setExt(extension);
      const blob = new Blob(chunks.current, { type: mime });
      setRecorded(URL.createObjectURL(blob));
    };
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecord = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={photos.length > 0 || !!recorded}>
      <div className="space-y-4">
        {!stream ? (
          <Button onClick={startCam}><Camera className="w-4 h-4 mr-1" /> Start Camera</Button>
        ) : (
          <div className="space-y-3">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-xl border" />
            <div className="flex gap-2">
              <Button onClick={snap} variant="outline">Snap Photo</Button>
              <Button onClick={recording ? stopRecord : startRecord}>
                {recording ? 'Stop Record' : 'Record Video'}
              </Button>
              <Button onClick={stopCam} variant="destructive">Stop Camera</Button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt={`Photo ${i}`} className="w-24 h-24 object-cover rounded-lg border" />
              <a href={p} download={`photo-${i}.png`} className="absolute bottom-1 right-1 bg-background/80 rounded p-1"><Download className="w-3 h-3" /></a>
            </div>
          ))}
        </div>
        {recorded && (
          <div className="flex flex-col gap-2">
            <video src={recorded} controls className="w-full max-w-md rounded-xl border" />
            <a href={recorded} download={`webcam-recording.${ext}`} className="flex items-center gap-1 text-sm text-primary hover:underline self-start">
              <Download className="w-4 h-4" /> Download Recording ({ext.toUpperCase()})
            </a>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}
