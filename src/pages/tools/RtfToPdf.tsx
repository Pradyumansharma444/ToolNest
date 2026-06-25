import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export default function RtfToPdf() {
  const tool = getToolById('rtf-to-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [processing, setProcessing] = useState(false);

  const convert = async () => {
    setProcessing(true);
    try {
      let text = manualText;
      if (file) {
        const content = await file.text();
        text = content.replace(/\{\\[^}]+\}/g, '').replace(/[{}]/g, '').replace(/\\[a-z]+/gi, '').replace(/\\'[0-9a-f]{2}/gi, '').trim();
      }
      if (!text) { toast({ title: 'No text content', variant: 'destructive' }); setProcessing(false); return; }
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const lines = text.split('\n').filter(l => l.trim());
      let page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      let y = height - 50;
      for (const line of lines) {
        if (y < 50) { page = pdfDoc.addPage([612, 792]); y = height - 50; }
        page.drawText(line.slice(0, 100), { x: 50, y, size: 11, font, maxWidth: width - 100 });
        y -= 18;
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = (file?.name.replace(/\.[^.]+$/, '') || 'document') + '.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'PDF created!' });
    } catch { toast({ title: 'Conversion failed', variant: 'destructive' }); }
    setProcessing(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <FileUpload accept={{ 'text/rtf': ['.rtf'], 'text/plain': ['.txt'] }} maxSize={10 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} label="Upload RTF/TXT file" description="Or type/paste text below" />
        <Textarea placeholder="Or type/paste text directly here..." value={manualText} onChange={(e) => setManualText(e.target.value)} className="min-h-[200px] resize-y" />
        <Button onClick={convert} disabled={processing || (!file && !manualText)}><Download className="w-4 h-4 mr-1" />{processing ? 'Converting...' : 'Convert to PDF'}</Button>
      </div>
    </ToolLayout>
  );
}
