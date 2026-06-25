import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PdfToPowerpoint() {
  const tool = getToolById('pdf-to-powerpoint')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pages, setPages] = useState<{ num: number; text: string }[]>([]);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setPages([]); setComplete(false); }
  };

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise as { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> };
      const extracted: { num: number; text: string }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: { str: string }) => item.str).join(' ');
        extracted.push({ num: i, text });
      }

      setPages(extracted);

      const pptContent = extracted.map(p =>
        `<div style="width:100%;height:100vh;display:flex;align-items:center;justify-content:center;border-bottom:2px solid #ccc;page-break-after:always;">
          <div style="max-width:80%;text-align:center;"><h2>Slide ${p.num}</h2><p style="font-size:16px;line-height:1.8;">${p.text || '(No text content)'}</p></div>
        </div>`
      ).join('');

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        @page{size:landscape;margin:0;}body{margin:0;font-family:Arial;}*{box-sizing:border-box;}
      </style></head><body>${pptContent}</body></html>`;

      downloadFile(html, file.name.replace(/\.pdf$/i, '') + '_slides.html', 'text/html');
      setComplete(true);
      toast({ title: 'Success!', description: `Extracted text from ${extracted.length} pages. HTML file downloaded - open and print to PDF.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPages([]); setComplete(false); }}
          label="Upload PDF"
        />
        {file && (
          <Button onClick={convert} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><FileText className="w-4 h-4 mr-2" /> Convert to PowerPoint</>}
          </Button>
        )}
        {pages.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-2">Extracted {pages.length} slides</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {pages.map(p => (
                <div key={p.num} className="p-2 bg-muted/50 rounded text-sm">
                  <span className="font-medium">Slide {p.num}:</span> {p.text.slice(0, 100)}{p.text.length > 100 ? '...' : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
