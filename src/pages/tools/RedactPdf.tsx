import { useState } from 'react';
import { Loader2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function RedactPdf() {
  const tool = getToolById('redact-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [foundCount, setFoundCount] = useState(0);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); setFoundCount(0); }
  };

  const redactPdf = async () => {
    if (!file || !searchText.trim()) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string; transform: number[]; width: number; height: number }[] }>; getViewport: (opts: { scale: number }) => { width: number; height: number } }> }> } }).getDocument({ data: arrayBuffer.slice(0) }).promise;
      const pages = pdfDoc.getPages();
      let totalFound = 0;

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });

        for (const item of content.items as { str: string; transform: number[]; width: number; height: number }[]) {
          if (item.str.toLowerCase().includes(searchText.toLowerCase())) {
            const tx = item.transform;
            const x = tx[4] * (pages[i].getWidth() / viewport.width);
            const y = pages[i].getHeight() - (tx[5] * (pages[i].getHeight() / viewport.height));
            const w = item.width * (pages[i].getWidth() / viewport.width);
            const h = item.height * (pages[i].getHeight() / viewport.height);

            pages[i].drawRectangle({
              x: x - 2,
              y: y - 2,
              width: w + 4,
              height: h + 4,
              color: rgb(0, 0, 0),
            });
            totalFound++;
          }
        }
      }

      setFoundCount(totalFound);
      if (totalFound > 0) {
        const pdfBytes = await pdfDoc.save();
        downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'redacted_' + file.name);
        setComplete(true);
        toast({ title: 'Success!', description: `Redacted ${totalFound} instances of "${searchText}".` });
      } else {
        toast({ title: 'Not found', description: `"${searchText}" not found in the PDF.` });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to redact PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); setFoundCount(0); }}
          label="Upload PDF to Redact"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Text to Redact</Label>
              <Input placeholder="Enter text to redact..." value={searchText} onChange={e => setSearchText(e.target.value)} />
              <p className="text-xs text-muted-foreground">All instances of this text will be blacked out.</p>
            </div>
            <Button onClick={redactPdf} disabled={processing || !searchText.trim()} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redacting...</> : <><EyeOff className="w-4 h-4 mr-2" /> Redact Text</>}
            </Button>
          </div>
        )}

        {complete && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Redacted {foundCount} instances. File downloaded.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
