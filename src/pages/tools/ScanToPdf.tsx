import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ScanToPdf() {
  const tool = getToolById('scan-to-pdf')!;
  const { toast } = useToast();
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages = files.map(f => ({
      id: Math.random().toString(36).substring(2, 15),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...newImages]);
    setComplete(false);
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      toast({ title: 'Camera access denied', description: 'Please allow camera access or upload an image.', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFilesSelected([file]);
      }
    }, 'image/jpeg', 0.95);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const createPdf = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const arrayBuffer = await img.file.arrayBuffer();
        let embedded;
        if (img.file.type === 'image/png') {
          embedded = await pdfDoc.embedPng(arrayBuffer);
        } else {
          embedded = await pdfDoc.embedJpg(arrayBuffer);
        }
        const page = pdfDoc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'scanned.pdf');
      setComplete(true);
      toast({ title: 'Success!', description: `PDF created with ${images.length} scanned page(s).` });
    } catch {
      toast({ title: 'Error', description: 'Failed to create PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={cameraActive ? stopCamera : startCamera} variant={cameraActive ? 'destructive' : 'outline'}>
            <Camera className="w-4 h-4 mr-2" /> {cameraActive ? 'Stop Camera' : 'Open Camera'}
          </Button>
        </div>

        {cameraActive && (
          <div className="rounded-xl border overflow-hidden">
            <video ref={videoRef} className="w-full" autoPlay playsInline />
            <div className="p-3 bg-muted/50 flex justify-center">
              <Button onClick={capturePhoto}><Camera className="w-4 h-4 mr-2" /> Capture</Button>
            </div>
          </div>
        )}

        <FileUpload
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
          multiple
          onFilesSelected={handleFilesSelected}
          label="Or Upload Images"
          description="Upload scanned images to combine into PDF"
        />

        {images.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <span className="font-medium text-sm">{images.length} scanned page(s)</span>
            <div className="grid grid-cols-3 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-32 object-cover rounded-lg border" />
                  <button onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
            </div>
            <Button onClick={createPdf} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><ImageIcon className="w-4 h-4 mr-2" /> Create PDF</>}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
