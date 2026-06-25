import { useState, useRef } from 'react';
import { Loader2, Download, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export default function EditPdf() {
  const tool = getToolById('edit-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<import('pdf-lib').PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'highlight'>('text');
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdf);
      setTotalPages(pdf.getPageCount());
      setCurrentPage(1);
      setAnnotations([]);
      await renderPage(1);
    } catch {
      toast({ title: 'Error', description: 'Could not read PDF.', variant: 'destructive' });
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!file) return;
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }>; getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: unknown) => { promise: Promise<void> } }> }> } }).getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch { /* silent */ }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const text = prompt('Enter text:');
    if (text) {
      setAnnotations(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        x, y, text, fontSize, color: fontColor,
      }]);
    }
  };

  const savePdf = async () => {
    if (!pdfDoc || !file) return;
    setProcessing(true);
    try {
      const { rgb } = await import('pdf-lib');
      const pages = pdfDoc.getPages();
      const page = pages[currentPage - 1];
      if (page) {
        const { width, height } = page.getSize();
        const canvas = canvasRef.current;
        const scaleX = canvas ? width / (canvas.width / 1.5) : 1;
        const scaleY = canvas ? height / (canvas.height / 1.5) : 1;

        for (const ann of annotations) {
          const r = parseInt(ann.color.slice(1, 3), 16) / 255;
          const g = parseInt(ann.color.slice(3, 5), 16) / 255;
          const b = parseInt(ann.color.slice(5, 7), 16) / 255;
          page.drawText(ann.text, {
            x: ann.x * scaleX,
            y: height - ann.y * scaleY,
            size: ann.fontSize,
            color: rgb(r, g, b),
          });
        }
      }
      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'edited.pdf');
      toast({ title: 'Success!', description: 'PDF saved with annotations.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPdfDoc(null); setAnnotations([]); }}
          label="Upload PDF to Edit"
        />

        {file && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant={selectedTool === 'text' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTool('text')}>
                <Type className="w-4 h-4 mr-1" /> Add Text
              </Button>
              <Input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-20" min={8} max={72} />
              <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-sm text-muted-foreground ml-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); renderPage(Math.max(1, currentPage - 1)); }} disabled={currentPage <= 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); renderPage(Math.min(totalPages, currentPage + 1)); }} disabled={currentPage >= totalPages}>Next</Button>
            </div>

            <div className="relative inline-block border rounded-lg overflow-hidden">
              <canvas ref={canvasRef} onClick={handleCanvasClick} className="cursor-crosshair" />
              {annotations.map(ann => (
                <div key={ann.id} className="absolute pointer-events-none" style={{ left: ann.x, top: ann.y, fontSize: ann.fontSize, color: ann.color }}>
                  {ann.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={savePdf} disabled={processing} size="lg">
                {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Download className="w-4 h-4 mr-2" /> Save PDF</>}
              </Button>
              <Button variant="outline" onClick={() => setAnnotations([])}>Clear Annotations</Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
