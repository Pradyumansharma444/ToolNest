import { useState } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PageNumbers() {
  const tool = getToolById('page-numbers')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const addPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const pageNum = String(startNumber + i);
        const textWidth = font.widthOfTextAtSize(pageNum, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0, y = 0;
        if (position.includes('bottom')) y = 30;
        else y = height - 30 - textHeight;
        if (position.includes('left')) x = 40;
        else if (position.includes('right')) x = width - 40 - textWidth;
        else x = (width - textWidth) / 2;

        page.drawText(pageNum, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'numbered_' + file.name);
      setComplete(true);
      toast({ title: 'Success!', description: `Added page numbers to ${pages.length} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add page numbers.', variant: 'destructive' });
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
          label="Upload PDF"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={position} onValueChange={(v: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left') => setPosition(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Number</Label>
                <Input type="number" min={1} value={startNumber} onChange={e => setStartNumber(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input type="number" min={8} max={36} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
              </div>
            </div>
            <Button onClick={addPageNumbers} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : <><Hash className="w-4 h-4 mr-2" /> Add Page Numbers</>}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
