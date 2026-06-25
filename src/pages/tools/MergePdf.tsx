import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { 
  Trash2, Merge, Loader2, GripVertical, 
  RotateCw, FileText, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob, generateId } from '@/lib/utils';
import type { ProcessingState } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  totalPages: number;
}

interface PdfPageItem {
  id: string;
  fileId: string;
  fileName: string;
  originalPageIndex: number; // 0-based page number
  thumbnailUrl: string;     // Low-res canvas JPEG data URL
  rotation: number;          // 0, 90, 180, 270 degrees
}

export default function MergePdf() {
  const tool = getToolById('merge-pdf')!;
  const { toast } = useToast();
  
  // State variables
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  // Drag and drop sorting states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // File Upload Handlers (with live rendering of page thumbnails)
  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    setProcessing({ 
      status: 'processing', 
      progress: 0, 
      message: 'Initializing PDF.js rendering worker...' 
    });

    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;

      const newPagesList: PdfPageItem[] = [];
      const newFilesList: PdfFileItem[] = [];

      for (let fIdx = 0; fIdx < selectedFiles.length; fIdx++) {
        const file = selectedFiles[fIdx];
        const fileId = generateId();

        setProcessing({
          status: 'processing',
          progress: Math.round((fIdx / selectedFiles.length) * 100),
          message: `Reading document data: ${file.name}...`
        });

        const arrayBuffer = await file.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf = await (pdfjsLib as unknown as { getDocument: (args: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: unknown) => { promise: Promise<void> } }> }> } }).getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        newFilesList.push({
          id: fileId,
          file,
          name: file.name,
          totalPages
        });

        // Limit rendering to a maximum page limit per document to prevent out-of-memory lockups in browser
        const importLimit = Math.min(totalPages, 30);

        for (let pIdx = 1; pIdx <= importLimit; pIdx++) {
          setProcessing({
            status: 'processing',
            progress: Math.round(((fIdx + pIdx / importLimit) / selectedFiles.length) * 100),
            message: `Rendering thumbnail for ${file.name} (page ${pIdx}/${importLimit})...`
          });

          const page = await pdf.getPage(pIdx);
          
          // Render to low-resolution thumbnail
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          newPagesList.push({
            id: `page-${fileId}-${pIdx}-${Math.random().toString(36).substring(2, 6)}`,
            fileId,
            fileName: file.name,
            originalPageIndex: pIdx - 1,
            thumbnailUrl: dataUrl,
            rotation: 0
          });

          // Free canvas resources
          canvas.width = 0;
          canvas.height = 0;
        }

        if (totalPages > 30) {
          toast({
            title: 'Large Document Loaded',
            description: `Only the first 30 pages of ${file.name} were imported to optimize page memory.`,
          });
        }
      }

      setFiles(prev => [...prev, ...newFilesList]);
      setPages(prev => [...prev, ...newPagesList]);
      setProcessing({ status: 'idle', progress: 0, message: '' });
      toast({ title: 'PDF pages loaded!', description: 'You can now visually sort, rotate, or delete pages.' });
    } catch (err) {
      console.error(err);
      setProcessing({ status: 'idle', progress: 0, message: '' });
      toast({
        title: 'Error loading files',
        description: 'Failed to extract PDF details. Make sure the document is not password protected.',
        variant: 'destructive'
      });
    }
  };

  // Delete a single page from assembly list
  const deletePageItem = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  // Rotate a single page item clockwise by 90 degrees
  const rotatePageItem = (id: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === id) {
        const nextRotation = (p.rotation + 90) % 360;
        return { ...p, rotation: nextRotation };
      }
      return p;
    }));
  };

  // Rearrange items drag events
  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIdx(index);
  };

  const handleDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      setPages(prev => {
        const next = [...prev];
        const [moved] = next.splice(draggedIdx, 1);
        next.splice(dragOverIdx, 0, moved);
        return next;
      });
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Compile final merged PDF document
  const mergePdfs = async () => {
    if (pages.length === 0) {
      toast({
        title: 'Merge Failed',
        description: 'You must have at least 1 page in the queue to compile.',
        variant: 'destructive'
      });
      return;
    }

    setProcessing({ status: 'processing', progress: 0, message: 'Loading document buffers...' });

    try {
      const mergedPdf = await PDFDocument.create();

      // Read each unique parent file bytes once
      const fileBytesMap: Record<string, Uint8Array> = {};
      for (const item of files) {
        const buffer = await item.file.arrayBuffer();
        fileBytesMap[item.id] = new Uint8Array(buffer);
      }

      // PDF structures cache
      const pdfDocsCache: Record<string, PDFDocument> = {};

      for (let i = 0; i < pages.length; i++) {
        const pgItem = pages[i];
        
        setProcessing({
          status: 'processing',
          progress: Math.round((i / pages.length) * 100),
          message: `Assembling page ${i + 1} of ${pages.length}...`
        });

        if (!pdfDocsCache[pgItem.fileId]) {
          const bytes = fileBytesMap[pgItem.fileId];
          pdfDocsCache[pgItem.fileId] = await PDFDocument.load(bytes);
        }

        const srcDoc = pdfDocsCache[pgItem.fileId];
        const [copiedPage] = await mergedPdf.copyPages(srcDoc, [pgItem.originalPageIndex]);

        // Apply visual rotation from options
        if (pgItem.rotation > 0) {
          copiedPage.setRotation(degrees(pgItem.rotation));
        }

        mergedPdf.addPage(copiedPage);
      }

      setProcessing({ status: 'processing', progress: 95, message: 'Finalizing PDF output...' });
      const mergedBytes = await mergedPdf.save();
      const finalBlob = uint8ToBlob(mergedBytes, 'application/pdf');
      downloadBlob(finalBlob, 'merged_visual_document.pdf');

      setProcessing({ status: 'complete', progress: 100, message: 'PDF document merged successfully!' });
      toast({
        title: 'Merge complete!',
        description: `Successfully assembled a ${pages.length}-page document.`
      });
    } catch (err) {
      console.error(err);
      setProcessing({ status: 'error', progress: 0, message: 'PDF assembly failed.' });
      toast({
        title: 'Error during assembly',
        description: 'Failed to write merged PDF file. Check file corruption.',
        variant: 'destructive'
      });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={processing.status === 'complete'}>
      <div className="space-y-6">
        
        {/* Upload area */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFilesSelected}
          multiple
          maxFiles={20}
          label="Add PDF Documents"
          description="Drag & drop PDF files to load all their pages visually"
        />

        {/* Loading Overlay */}
        {processing.status === 'processing' && (
          <div className="rounded-2xl border bg-muted/30 p-6 text-center space-y-4 select-none">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-sm font-semibold">{processing.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{processing.progress}% Complete</p>
            </div>
            <div className="w-full bg-muted-foreground/10 h-2 rounded-full overflow-hidden max-w-md mx-auto">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${processing.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Visual Organizer Workspace */}
        {pages.length > 0 && processing.status !== 'processing' && (
          <div className="space-y-5">
            
            {/* Toolbar header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl border bg-muted/40 select-none">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary" /> Visual Organizer</h3>
                <p className="text-xs text-muted-foreground">Arrange pages by dragging. Rotate or delete individual pages.</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={mergePdfs} 
                  className="flex-1 sm:flex-initial font-bold h-10 rounded-xl"
                >
                  <Merge className="w-4 h-4 mr-1.5" /> Assemble PDF ({pages.length} pages)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setPages([]); setFiles([]); }}
                  className="h-10 rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 select-none">
              {pages.map((page, index) => {
                const isBeingDragged = index === draggedIdx;
                const isDraggedOver = index === dragOverIdx;

                return (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`rounded-2xl border bg-card p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative cursor-grab active:cursor-grabbing ${
                      isBeingDragged ? 'opacity-30 border-dashed border-primary/50' : ''
                    } ${isDraggedOver ? 'border-primary scale-102 bg-primary/5' : ''}`}
                  >
                    
                    {/* Page Thumbnail Image */}
                    <div className="aspect-[3/4] rounded-lg border bg-slate-50 overflow-hidden flex items-center justify-center p-1 relative group select-none">
                      <img 
                        src={page.thumbnailUrl} 
                        alt={`page-${index}`} 
                        className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-300"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                      
                      {/* Floating hover grab handler */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-colors">
                        <GripVertical className="w-5 h-5 text-transparent group-hover:text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>

                      {/* Display overlay index */}
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Metadata & Actions row */}
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] min-w-0">
                        <p className="font-bold truncate" title={page.fileName}>
                          {page.fileName}
                        </p>
                        <p className="text-muted-foreground font-medium">Original Page {page.originalPageIndex + 1}</p>
                      </div>

                      <div className="flex gap-1 justify-end pt-1 border-t">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary rounded-lg"
                          onClick={() => rotatePageItem(page.id)}
                          title="Rotate Page 90° Clockwise"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => deletePageItem(page.id)}
                          title="Exclude Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Assembly status complete card */}
        {processing.status === 'complete' && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-5 text-center space-y-1.5 animate-in zoom-in-95 duration-200 select-none">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">{processing.message}</h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Your newly assembled PDF document has been downloaded to your local device.</p>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
