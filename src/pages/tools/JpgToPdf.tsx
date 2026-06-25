import { useState, useCallback } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { ProcessingState } from '@/types';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function JpgToPdf() {
  const tool = getToolById('jpg-to-pdf')!;
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', progress: 0, message: '' });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages = files.map(f => ({
      id: Math.random().toString(36).substring(2, 15),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setProcessing({ status: 'processing', progress: 0, message: 'Creating PDF...' });

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const imgBytes = await images[i].file.arrayBuffer();
        let img;
        const fileName = images[i].file.name.toLowerCase();
        if (fileName.endsWith('.png')) {
          img = await pdfDoc.embedPng(imgBytes);
        } else {
          img = await pdfDoc.embedJpg(imgBytes);
        }

        let pageWidth = img.width;
        let pageHeight = img.height;

        if (orientation === 'portrait' && pageWidth > pageHeight) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        } else if (orientation === 'landscape' && pageHeight > pageWidth) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        const maxSize = 842; // A4-ish
        if (pageWidth > maxSize || pageHeight > maxSize) {
          const scale = maxSize / Math.max(pageWidth, pageHeight);
          pageWidth *= scale;
          pageHeight *= scale;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(img, { x: 0, y: 0, width: pageWidth, height: pageHeight });

        setProcessing({ status: 'processing', progress: Math.round(((i + 1) / images.length) * 100), message: `Processing image ${i + 1} of ${images.length}...` });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'images.pdf');
      setProcessing({ status: 'complete', progress: 100, message: `Created PDF with ${images.length} images!` });
      toast({ title: 'Success!', description: `PDF created with ${images.length} images.` });
    } catch {
      setProcessing({ status: 'error', progress: 0, message: 'Failed to create PDF.' });
      toast({ title: 'Error', description: 'Failed to create PDF.', variant: 'destructive' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={processing.status === 'complete'}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }}
          multiple
          maxFiles={50}
          onFilesSelected={handleFilesSelected}
          label="Upload Images"
          description="Drag & drop JPG, PNG, or WebP images"
        />

        {images.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{images.length} image(s) selected</span>
              <span className="text-xs text-muted-foreground">{images.reduce((acc, img) => acc + img.file.size, 0) / 1024 / 1024 > 1 ? (images.reduce((acc, img) => acc + img.file.size, 0) / 1024 / 1024).toFixed(1) + ' MB' : (images.reduce((acc, img) => acc + img.file.size, 0) / 1024).toFixed(0) + ' KB'}</span>
            </div>

            <div className="flex gap-2">
              {(['auto', 'portrait', 'landscape'] as const).map(o => (
                <Button key={o} variant={orientation === o ? 'default' : 'outline'} size="sm" onClick={() => setOrientation(o)}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-24 object-cover rounded-lg border" />
                  <button onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{img.file.name}</p>
                </div>
              ))}
            </div>

            <Button onClick={convertToPdf} disabled={processing.status === 'processing'} size="lg" className="w-full">
              {processing.status === 'processing' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {processing.message}</>
              ) : (
                <><ImageIcon className="w-4 h-4 mr-2" /> Convert to PDF</>
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
