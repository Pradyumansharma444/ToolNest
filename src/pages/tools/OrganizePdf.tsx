import { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Trash2, GripVertical, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface PdfPage {
  id: string;
  pageNum: number;
  fileName: string;
}

export default function OrganizePdf() {
  const tool = getToolById('organize-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [processing, setProcessing] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      const pageList: PdfPage[] = [];
      for (let i = 0; i < pageCount; i++) {
        pageList.push({ id: Math.random().toString(36).substring(2, 9), pageNum: i + 1, fileName: f.name });
      }
      setPages(pageList);
    } catch {
      toast({ title: 'Error', description: 'Could not read PDF.', variant: 'destructive' });
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    setPages(prev => {
      const newPages = [...prev];
      if (direction === 'up' && index > 0) {
        [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
      } else if (direction === 'down' && index < newPages.length - 1) {
        [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
      }
      return newPages;
    });
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      setPages(prev => {
        const newPages = [...prev];
        const [moved] = newPages.splice(dragItem.current!, 1);
        newPages.splice(dragOverItem.current!, 0, moved);
        return newPages;
      });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrganized = async () => {
    if (!file || pages.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const indices = pages.map(p => p.pageNum - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      copiedPages.forEach(page => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'organized.pdf');
      toast({ title: 'Success!', description: `PDF organized with ${pages.length} pages.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to organize PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPages([]); }}
          label="Upload PDF to Organize"
        />

        {pages.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
              <span className="font-medium text-sm">{pages.length} pages</span>
              <span className="text-xs text-muted-foreground">Drag to reorder</span>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors cursor-move"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground w-8 text-center">{page.pageNum}</span>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm flex-1">Page {page.pageNum}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePage(index, 'up')} disabled={index === 0}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePage(index, 'down')} disabled={index === pages.length - 1}>
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removePage(page.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pages.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={saveOrganized} disabled={processing || pages.length === 0} size="lg" className="flex-1">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><FileText className="w-4 h-4 mr-2" /> Save Organized PDF</>}
            </Button>
            <Button variant="outline" onClick={() => { setPages([]); setFile(null); }}>Clear</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
