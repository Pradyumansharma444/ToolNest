import { useState, useCallback } from 'react';
import { Image as ImageIcon, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { ProcessingState } from '@/types';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

async function fileToPngBytes(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  );
  return new Uint8Array(await blob.arrayBuffer());
}

export default function ImageToPdf() {
  const tool = getToolById('image-to-pdf')!;
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', progress: 0, message: '' });
  const [pageSize, setPageSize] = useState<'a4' | 'fit' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');

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

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return updated;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setProcessing({ status: 'processing', progress: 0, message: 'Creating PDF...' });

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      const pageSizes = {
        a4: { width: 595, height: 842 },
        letter: { width: 612, height: 792 },
        fit: null,
      };

      for (let i = 0; i < images.length; i++) {
        const file = images[i].file;
        const fileName = file.name.toLowerCase();
        const isPng = fileName.endsWith('.png');
        const isJpg = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

        let img;
        if (isPng) {
          const imgBytes = await file.arrayBuffer();
          img = await pdfDoc.embedPng(imgBytes);
        } else if (isJpg) {
          const imgBytes = await file.arrayBuffer();
          img = await pdfDoc.embedJpg(imgBytes);
        } else {
          const pngBytes = await fileToPngBytes(file);
          img = await pdfDoc.embedPng(pngBytes);
        }

        let pageWidth = img.width;
        let pageHeight = img.height;

        if (orientation === 'portrait' && pageWidth > pageHeight) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        } else if (orientation === 'landscape' && pageHeight > pageWidth) {
          [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }

        if (pageSize !== 'fit') {
          const target = pageSizes[pageSize as keyof typeof pageSizes];
          if (target) {
            const scaleX = target.width / pageWidth;
            const scaleY = target.height / pageHeight;
            const scale = Math.min(scaleX, scaleY, 1);
            pageWidth = pageWidth * scale;
            pageHeight = pageHeight * scale;
          }
        } else {
          const maxSize = 842;
          if (pageWidth > maxSize || pageHeight > maxSize) {
            const scale = maxSize / Math.max(pageWidth, pageHeight);
            pageWidth *= scale;
            pageHeight *= scale;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(img, { x: 0, y: 0, width: pageWidth, height: pageHeight });

        setProcessing({ status: 'processing', progress: Math.round(((i + 1) / images.length) * 100), message: `Processing image ${i + 1} of ${images.length}...` });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'images.pdf');
      setProcessing({ status: 'complete', progress: 100, message: `PDF created with ${images.length} images!` });
      toast({ title: 'Success!', description: `PDF created with ${images.length} images.` });
    } catch {
      setProcessing({ status: 'error', progress: 0, message: 'Failed to create PDF. Make sure all files are valid images.' });
      toast({ title: 'Error', description: 'Failed to create PDF. Some files may not be valid images.', variant: 'destructive' });
    }
  };

  const totalSize = images.reduce((acc, img) => acc + img.file.size, 0);

  return (
    <ToolLayout tool={tool} resultVisible={processing.status === 'complete'}>
      <div className="space-y-6">
        <FileUpload
          accept={{
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
            'image/bmp': ['.bmp'],
            'image/tiff': ['.tiff', '.tif'],
            'image/x-icon': ['.ico'],
          }}
          multiple
          maxFiles={50}
          onFilesSelected={handleFilesSelected}
          label="Upload Images"
          description="Drag & drop JPG, PNG, WebP, GIF, BMP, TIFF, or ICO images"
        />

        {images.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{images.length} image(s) selected</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(totalSize)}
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Page Size</label>
                <div className="flex gap-1.5">
                  {(['fit', 'a4', 'letter'] as const).map(s => (
                    <Button key={s} variant={pageSize === s ? 'default' : 'outline'} size="sm" onClick={() => setPageSize(s)}>
                      {s === 'fit' ? 'Fit Image' : s.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Orientation</label>
                <div className="flex gap-1.5">
                  {(['auto', 'portrait', 'landscape'] as const).map(o => (
                    <Button key={o} variant={orientation === o ? 'default' : 'outline'} size="sm" onClick={() => setOrientation(o)}>
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {images.map((img, index) => (
                <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background/50 group">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveImage(img.id, 'up')}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <GripVertical className="w-3 h-3 rotate-180" />
                    </button>
                    <button
                      onClick={() => moveImage(img.id, 'down')}
                      disabled={index === images.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <GripVertical className="w-3 h-3" />
                    </button>
                  </div>
                  <img src={img.preview} alt="" className="w-12 h-12 object-cover rounded border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{img.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(img.file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(img.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
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
