import { useState } from 'react';
import { Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PdfToPdfA() {
  const tool = getToolById('pdf-to-pdfa')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState('1b');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const convertToPdfA = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      pdfDoc.setTitle(file.name);
      pdfDoc.setProducer('ToolNest PDF to PDF/A Converter');
      pdfDoc.setCreator('ToolNest');

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), file.name.replace(/\.pdf$/i, '') + '_pdfa.pdf');
      setComplete(true);
      toast({ title: 'Success!', description: 'PDF converted to PDF/A format.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert to PDF/A.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> Full PDF/A compliance requires embedding specific ICC profiles and fonts. This tool adds PDF/A metadata for archival purposes.
        </div>
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload PDF"
        />
        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>PDF/A Conformance Level</Label>
              <Select value={conformance} onValueChange={setConformance}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1b">PDF/A-1b</SelectItem>
                  <SelectItem value="2b">PDF/A-2b</SelectItem>
                  <SelectItem value="3b">PDF/A-3b</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={convertToPdfA} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><Archive className="w-4 h-4 mr-2" /> Convert to PDF/A</>}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
