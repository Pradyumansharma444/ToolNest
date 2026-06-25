import { useState } from 'react';
import { Crop, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CropPdf() {
  const tool = getToolById('crop-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const cropPdf = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const newWidth = width - left - right;
        const newHeight = height - top - bottom;
        if (newWidth > 0 && newHeight > 0) {
          page.setMediaBox(left, bottom, newWidth, newHeight);
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'cropped_' + file.name);
      setComplete(true);
      toast({ title: 'Success!', description: `Cropped ${pages.length} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to crop PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload PDF to Crop"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Enter crop margins in points (1 inch = 72 points)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Top (pt)</Label>
                <Input type="number" min={0} value={top} onChange={e => setTop(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Bottom (pt)</Label>
                <Input type="number" min={0} value={bottom} onChange={e => setBottom(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Left (pt)</Label>
                <Input type="number" min={0} value={left} onChange={e => setLeft(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Right (pt)</Label>
                <Input type="number" min={0} value={right} onChange={e => setRight(Number(e.target.value))} />
              </div>
            </div>
            <Button onClick={cropPdf} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cropping...</> : <><Crop className="w-4 h-4 mr-2" /> Crop PDF</>}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
