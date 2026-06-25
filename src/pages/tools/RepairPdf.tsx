import { useState } from 'react';
import { Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function RepairPdf() {
  const tool = getToolById('repair-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const repairPdf = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();

      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch {
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer);
        } catch {
          toast({ title: 'Error', description: 'PDF is too corrupted to repair.', variant: 'destructive' });
          setProcessing(false);
          return;
        }
      }

      const pageCount = pdfDoc.getPageCount();
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'repaired_' + file.name);
      setComplete(true);
      toast({ title: 'Success!', description: `Repaired PDF with ${pageCount} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to repair PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> This tool attempts to repair corrupted PDFs by re-encoding them. Success depends on the level of corruption.
        </div>
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload Damaged PDF"
        />
        {file && (
          <Button onClick={repairPdf} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Repairing...</> : <><Wrench className="w-4 h-4 mr-2" /> Repair PDF</>}
          </Button>
        )}
        {complete && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">PDF repaired and downloaded!</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
