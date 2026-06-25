import { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PdfToWord() {
  const tool = getToolById('pdf-to-word')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [resultReady, setResultReady] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setExtractedText(''); setResultReady(false); }
  };

  const extractText = async () => {
    if (!file) return;
    setProcessing(true);
    setExtractedText('');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as unknown as { version: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise as { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> };
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: { str: string }) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      setExtractedText(fullText);
      setResultReady(true);
      toast({ title: 'Text extracted!', description: `Extracted from ${pdf.numPages} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to extract text from PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const downloadAsTxt = () => {
    downloadFile(extractedText, 'extracted-text.txt', 'text/plain');
  };

  const downloadAsDocx = () => {
    const html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Document</title>
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.5;}h1{font-size:16pt;}p{margin:6pt 0;}</style>
</head><body>${extractedText.split('\n').map(line => {
      if (line.startsWith('--- Page')) return `<h1>${line}</h1>`;
      if (line.trim() === '') return '<br>';
      return `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }).join('\n')}</body></html>`;
    downloadFile(html, 'document.doc', 'application/msword');
  };

  return (
    <ToolLayout tool={tool} resultVisible={resultReady}>
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> This tool extracts text from PDFs. Complex formatting, tables, and images may not be preserved.
        </div>
        <FileUpload accept={{ 'application/pdf': ['.pdf'] }} onFilesSelected={handleFileSelected} selectedFile={file} onFileRemoved={() => { setFile(null); setExtractedText(''); setResultReady(false); }} label="Upload PDF" />
        {file && (
          <Button onClick={extractText} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</> : <><FileText className="w-4 h-4 mr-2" /> Extract Text</>}
          </Button>
        )}
        {extractedText && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-card">
              <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
                <span className="font-medium text-sm">Extracted Text</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={downloadAsTxt}><Download className="w-4 h-4 mr-1" /> TXT</Button>
                  <Button size="sm" variant="outline" onClick={downloadAsDocx}><FileText className="w-4 h-4 mr-1" /> DOC</Button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto"><pre className="text-sm whitespace-pre-wrap font-mono">{extractedText}</pre></div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
