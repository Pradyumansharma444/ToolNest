import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

(pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as { version: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;

import { Scan, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';


export default function OcrPdf() {
  const tool = getToolById('ocr-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setExtractedText('');
      setProgress(0);
    }
  };

  const ocrPdf = async () => {
    if (!file) return;
    setProcessing(true);
    setExtractedText('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (pdfjsLib as { getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } } }> } }).getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        setCurrentPage(i);
        setProgress(Math.round((i / pdf.numPages) * 100));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = canvas.toDataURL('image/png');

        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: () => {}, // suppress internal logs
        });

        if (result.data.text.trim()) {
          fullText += `--- Page ${i} ---\n${result.data.text}\n\n`;
        }

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;
      }

      setExtractedText(fullText || 'No text found in the PDF.');
      toast({ title: 'OCR Complete!', description: `Processed ${pdf.numPages} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to OCR PDF. Make sure it contains scanned images.', variant: 'destructive' });
    } finally {
      setProcessing(false);
      setProgress(0);
      setCurrentPage(0);
    }
  };

  const downloadText = () => {
    downloadFile(extractedText, 'ocr-text.txt', 'text/plain');
  };

  return (
    <ToolLayout tool={tool} resultVisible={extractedText.length > 0}>
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>OCR</strong> extracts text from scanned PDF pages. Each page is converted to an image and analyzed.
          Processing may take a while for large documents.
        </div>

        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setExtractedText(''); }}
          label="Upload Scanned PDF"
        />

        {file && (
          <Button onClick={ocrPdf} disabled={processing} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing page {currentPage} of {totalPages}...</>
            ) : (
              <><Scan className="w-4 h-4 mr-2" /> Start OCR</>
            )}
          </Button>
        )}

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({progress}%)
            </p>
          </div>
        )}

        {extractedText && (
          <div className="rounded-xl border bg-card">
            <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
              <span className="font-medium text-sm">Extracted Text</span>
              <Button size="sm" variant="outline" onClick={downloadText}>
                <Download className="w-4 h-4 mr-1" /> Download TXT
              </Button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">{extractedText}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
