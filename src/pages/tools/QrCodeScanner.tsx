import { useState, useRef } from 'react';
import { Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function QrCodeScanner() {
  const tool = getToolById('qr-code-scanner')!;
  const { toast } = useToast();
  const [result, setResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScan = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { toast({ title: 'Camera access denied', variant: 'destructive' }); setScanning(false); }
  };

  const stopScan = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setScanning(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { default: jsQR } = await import('jsqr');
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(data.data, data.width, data.height);
        setResult(code ? code.data : 'No QR code found');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch { toast({ title: 'Error decoding QR code', variant: 'destructive' }); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={scanning ? stopScan : startScan}><Scan className="w-4 h-4 mr-1" />{scanning ? 'Stop Camera' : 'Start Camera'}</Button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            Or upload image: <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <span className="text-primary text-xs underline">Choose file</span>
          </label>
        </div>
        {scanning && <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-xl border" />}
        {result && (
          <div className="rounded-xl border bg-card p-4">
            <span className="text-sm text-muted-foreground">Result:</span>
            <p className="text-sm font-mono mt-1 break-all">{result}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
