import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
(pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as { version: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;

import { Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ConvertedPage {
  pageNum: number;
  dataUrl: string;
  fileName: string;
}

export default function PdfToJpg() {
  const tool = getToolById('pdf-to-jpg') || {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    description: 'Convert PDF pages into high-quality JPG images directly in your browser.',
    metaTitle: 'Convert PDF to JPG Online Free - PDF to Image | ToolNest',
    metaDescription: 'Convert PDF pages to high-quality JPG or PNG images. Download individual images or a ZIP file. Fast and secure client-side conversion.',
    category: 'pdf',
  };

  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setConvertedPages([]);
      setProgress(0);
    }
  };

  const convertPdf = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setConvertedPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (pdfjsLib as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: unknown) => { promise: Promise<void> } }> }> } }).getDocument({ data: arrayBuffer }).promise as { numPages: number; getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: unknown) => { promise: Promise<void> } }> };
      const pages: ConvertedPage[] = [];

      // Limit conversion to a safe maximum to prevent memory exhaustion in browser
      const maxPages = Math.min(pdf.numPages, 50);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        
        // Render at 2.0x scale for crisp high-quality images
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.92 : 1.0;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        pages.push({
          pageNum: i,
          dataUrl,
          fileName: `${file.name.replace(/\.pdf$/i, '')}_page_${i}.${format}`
        });

        setProgress(Math.round((i / maxPages) * 100));
        
        // Cleanup canvas resources
        canvas.width = 0;
        canvas.height = 0;
      }

      setConvertedPages(pages);
      
      if (pdf.numPages > 50) {
        toast({ 
          title: 'Partial Conversion', 
          description: `Converted first 50 pages of the PDF to prevent browser lag.`,
          variant: 'default' 
        });
      } else {
        toast({ title: 'Conversion Complete!', description: `Successfully converted ${pdf.numPages} pages.` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Conversion failed', description: 'Failed to convert PDF. Ensure it is not locked.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const downloadSinglePage = (page: ConvertedPage) => {
    const base64 = page.dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' });
    downloadBlob(blob, page.fileName);
  };

  const downloadAllAsZip = async () => {
    if (convertedPages.length === 0 || !file) return;
    setProcessing(true);
    
    try {
      const zip = new JSZip();
      for (const page of convertedPages) {
        const base64 = page.dataUrl.split(',')[1];
        zip.file(page.fileName, base64, { base64: true });
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${file.name.replace(/\.pdf$/i, '')}_images.zip`);
      toast({ title: 'ZIP downloaded!', description: 'All converted page images downloaded.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'ZIP failed', description: 'Failed to package images into a ZIP file.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={convertedPages.length > 0}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setConvertedPages([]); setProgress(0); }}
          label="Upload PDF to Convert"
        />

        {file && convertedPages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm text-sm">
              <h3 className="font-semibold text-base">Conversion Options</h3>
              <div className="flex items-center gap-4">
                <span className="font-medium text-muted-foreground">Output Format:</span>
                <div className="flex gap-2">
                  <Button variant={format === 'jpeg' ? 'default' : 'outline'} size="sm" onClick={() => setFormat('jpeg')}>JPG</Button>
                  <Button variant={format === 'png' ? 'default' : 'outline'} size="sm" onClick={() => setFormat('png')}>PNG</Button>
                </div>
              </div>
            </div>

            <Button onClick={convertPdf} disabled={processing} size="lg" className="w-full gap-2">
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Converting PDF...</>
              ) : (
                <><ImageIcon className="w-4 h-4" /> Convert to Images</>
              )}
            </Button>
          </div>
        )}

        {processing && convertedPages.length === 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">Rendering pages... {progress}%</p>
          </div>
        )}

        {convertedPages.length > 0 && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center p-4 rounded-xl border bg-muted/40">
              <div className="text-sm">
                <p className="font-semibold">Conversion Results</p>
                <p className="text-xs text-muted-foreground">{convertedPages.length} pages ready to download</p>
              </div>
              <Button onClick={downloadAllAsZip} disabled={processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download All as ZIP
              </Button>
            </div>

            {/* Page Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {convertedPages.map((page) => (
                <div key={page.pageNum} className="rounded-xl border bg-card p-3 shadow-sm hover:shadow transition-shadow flex flex-col justify-between space-y-3">
                  <div className="aspect-[3/4] border rounded-lg bg-slate-50 dark:bg-slate-900/50 overflow-hidden flex items-center justify-center p-1">
                    <img src={page.dataUrl} alt={`Page ${page.pageNum}`} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Page {page.pageNum}</span>
                    <Button size="sm" variant="ghost" className="h-8 text-primary gap-1" onClick={() => downloadSinglePage(page)}>
                      <Download className="w-3.5 h-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
