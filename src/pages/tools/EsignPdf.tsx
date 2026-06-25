import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
(pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; version?: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as { version?: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;

import { PenTool, Loader2, Download, Trash2, X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface Signature {
  id: string;
  x: number; // relative to preview container
  y: number; // relative to preview container
  width: number;
  height: number;
  data: string; // PNG base64 Data URL
  page: number; // 0-indexed page index
}

export default function EsignPdf() {
  const tool = getToolById('esign-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageSizes, setPageSizes] = useState<{ width: number; height: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [placingMode, setPlacingMode] = useState(false);
  
  // Signature Stamp creation state
  const [signatureStamp, setSignatureStamp] = useState<string | null>(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [modalTab, setModalTab] = useState<'draw' | 'type'>('draw');
  
  // Drawing pad state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Type signature state
  const [typeText, setTypeText] = useState('');
  const [typeColor, setTypeColor] = useState('#0000ff');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setSignatures([]);
      setProcessing(true);

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await (pdfjsLib as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }>; getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (opts: unknown) => { promise: Promise<void> } }> }> } }).getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];
        const sizes: { width: number; height: number }[] = [];

        // Limit preview generation to first 15 pages for safety/speed
        const pageLimit = Math.min(pdf.numPages, 15);
        for (let i = 1; i <= pageLimit; i++) {
          const page = await pdf.getPage(i);
          // Scale to fit a standard width in the web UI (e.g. max 650px)
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          images.push(canvas.toDataURL('image/png'));
          sizes.push({ width: viewport.width, height: viewport.height });
        }

        setPageImages(images);
        setPageSizes(sizes);
        setCurrentPage(0);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to load PDF preview. Make sure it is not password-protected.', variant: 'destructive' });
      } finally {
        setProcessing(false);
      }
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Create & save signature stamp
  const saveSignatureStamp = () => {
    if (modalTab === 'draw') {
      const canvas = modalCanvasRef.current;
      if (!canvas) return;
      
      // Check if canvas is blank
      const buffer = new Uint32Array(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      const isBlank = !buffer.some(color => color !== 0);
      if (isBlank) {
        toast({ title: 'Canvas is empty', description: 'Please draw your signature first.', variant: 'destructive' });
        return;
      }
      
      setSignatureStamp(canvas.toDataURL('image/png'));
    } else {
      if (!typeText.trim()) {
        toast({ title: 'Empty text', description: 'Please type your signature first.', variant: 'destructive' });
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Premium handwritten style font fallback chain
      ctx.font = 'italic 38px "Dancing Script", "Brush Script MT", "Caveat", cursive, sans-serif';
      ctx.fillStyle = typeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeText, canvas.width / 2, canvas.height / 2);
      
      setSignatureStamp(canvas.toDataURL('image/png'));
    }
    
    setShowStampModal(false);
    toast({ title: 'Signature saved!', description: 'Click "Place Signature" to stamp it on your PDF.' });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingMode || !signatureStamp || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = 150;
    const height = 50;

    const newSig: Signature = {
      id: crypto.randomUUID(),
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      data: signatureStamp,
      page: currentPage
    };

    setSignatures(prev => [...prev, newSig]);
    setPlacingMode(false);
  };

  const removeSignature = (id: string) => {
    setSignatures(prev => prev.filter(s => s.id !== id));
  };

  const signPdf = async () => {
    if (!file || signatures.length === 0) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const sig of signatures) {
        const page = pages[sig.page];
        if (!page) continue;

        const { width: pdfW, height: pdfH } = page.getSize();
        const viewSize = pageSizes[sig.page];
        if (!viewSize) continue;

        // Decode signature base64 PNG image stream
        const base64Data = sig.data.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const embeddedPng = await pdfDoc.embedPng(bytes);

        // Convert UI viewport coordinate metrics back to PDF coordinate metrics
        const pdfX = (sig.x / viewSize.width) * pdfW;
        // Adjust for PDF coordinate system origin starting at bottom-left corner
        const pdfY = pdfH - ((sig.y / viewSize.height) * pdfH) - ((sig.height / viewSize.height) * pdfH);
        
        const drawW = (sig.width / viewSize.width) * pdfW;
        const drawH = (sig.height / viewSize.height) * pdfH;

        page.drawImage(embeddedPng, {
          x: pdfX,
          y: pdfY,
          width: drawW,
          height: drawH,
        });
      }

      const signedBytes = await pdfDoc.save();
      const blob = uint8ToBlob(signedBytes, 'application/pdf');
      downloadBlob(blob, file.name.replace(/\.pdf$/i, '_signed.pdf'));
      toast({ title: 'PDF signed successfully!', description: 'Your signed PDF has been downloaded.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Signing failed', description: 'Failed to apply signatures to PDF.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const currentSize = pageSizes[currentPage] || { width: 0, height: 0 };

  return (
    <ToolLayout tool={tool} resultVisible={pageImages.length > 0}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setPageImages([]); setPageSizes([]); setSignatures([]); setSignatureStamp(null); }}
          label="Upload PDF to e-Sign"
        />

        {processing && pageImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Rendering PDF page previews...</p>
          </div>
        )}

        {pageImages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm text-sm">
                <h3 className="font-semibold text-base">Signature Stamp</h3>
                
                {signatureStamp ? (
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex justify-center items-center h-24 relative group">
                      <img src={signatureStamp} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                      <button 
                        onClick={() => setSignatureStamp(null)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <Button 
                      onClick={() => setPlacingMode(!placingMode)} 
                      variant={placingMode ? 'default' : 'outline'}
                      className="w-full gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      {placingMode ? 'Click on PDF page...' : 'Place Signature'}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowStampModal(true)} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Create Signature
                  </Button>
                )}

                {signatures.length > 0 && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Signatures ({signatures.length})</span>
                      <button onClick={() => setSignatures([])} className="text-destructive hover:underline">Clear All</button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {signatures.map((sig, idx) => (
                        <div key={sig.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30 text-xs">
                          <span className="truncate">Stamp {idx + 1} (Page {sig.page + 1})</span>
                          <button onClick={() => removeSignature(sig.id)} className="text-destructive hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button onClick={signPdf} disabled={processing} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Apply & Download
                    </Button>
                  </div>
                )}
              </div>

              {/* Page Thumbnails Selector */}
              {pageImages.length > 1 && (
                <div className="rounded-xl border bg-card p-3 shadow-sm text-sm space-y-2">
                  <p className="font-semibold text-xs text-muted-foreground">Select Page</p>
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-72 pb-2 lg:pb-0 scrollbar-thin">
                    {pageImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentPage(i); setPlacingMode(false); }}
                        className={`flex-shrink-0 relative w-16 lg:w-full border rounded-lg p-1 overflow-hidden transition-all ${currentPage === i ? 'ring-2 ring-primary border-transparent' : 'hover:border-muted-foreground/30 border-muted'}`}
                      >
                        <img src={img} alt={`Page thumbnail ${i + 1}`} className="w-full h-12 lg:h-16 object-contain" />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded">P. {i + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Editor Viewer */}
            <div className="lg:col-span-3 flex justify-center bg-slate-100 dark:bg-slate-900/40 p-6 rounded-xl border relative min-h-[400px]">
              {pageImages[currentPage] && (
                <div 
                  ref={containerRef}
                  onClick={handleContainerClick}
                  className={`relative border shadow-md bg-white rounded-lg transition-all select-none ${placingMode ? 'cursor-crosshair ring-2 ring-primary/40 ring-offset-2' : ''}`}
                  style={{ width: currentSize.width, height: currentSize.height }}
                >
                  <img
                    src={pageImages[currentPage]}
                    alt={`Page preview ${currentPage + 1}`}
                    className="w-full h-full object-contain pointer-events-none rounded-lg"
                    draggable={false}
                  />

                  {/* Signatures overlay */}
                  {signatures.filter(s => s.page === currentPage).map(sig => (
                    <div
                      key={sig.id}
                      className="absolute border border-dashed border-primary bg-primary/5 rounded p-1 group flex items-center justify-center"
                      style={{
                        left: sig.x,
                        top: sig.y,
                        width: sig.width,
                        height: sig.height,
                      }}
                    >
                      <img src={sig.data} alt="Signature stamp" className="max-w-full max-h-full object-contain" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
                        className="absolute -top-2.5 -right-2.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  {placingMode && signatureStamp && (
                    <div className="absolute inset-0 pointer-events-none bg-primary/5 flex items-center justify-center">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded shadow-md animate-bounce">
                        Click anywhere on the document to stamp signature
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE SIGNATURE MODAL DIALOG */}
      {showStampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border shadow-xl flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-muted/40">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" /> Create Signature
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowStampModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b bg-muted/20">
              <button 
                onClick={() => setModalTab('draw')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${modalTab === 'draw' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Draw Signature
              </button>
              <button 
                onClick={() => setModalTab('type')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${modalTab === 'type' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Type Signature
              </button>
            </div>

            <div className="p-5 flex-1 space-y-4">
              {modalTab === 'draw' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Draw using your mouse, trackpad, or screen</span>
                    <button onClick={clearCanvas} className="text-primary hover:underline">Clear</button>
                  </div>
                  
                  {/* Drawing Canvas */}
                  <div className="border rounded-lg bg-slate-50 dark:bg-slate-900/30 overflow-hidden flex justify-center">
                    <canvas
                      ref={modalCanvasRef}
                      width={450}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawingTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair bg-transparent"
                    />
                  </div>

                  {/* Draw Color Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Ink Color:</span>
                    {['#000000', '#0000ff', '#ff0000'].map(c => (
                      <button
                        key={c}
                        onClick={() => setDrawColor(c)}
                        className={`w-6 h-6 rounded-full border relative flex items-center justify-center`}
                        style={{ backgroundColor: c }}
                      >
                        {drawColor === c && <Check className="w-3.5 h-3.5 text-white mix-blend-difference" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Type your signature text</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={typeText} 
                    onChange={(e) => setTypeText(e.target.value)} 
                    maxLength={30}
                    className="text-lg"
                  />

                  {/* Type Preview styling options */}
                  {typeText.trim() && (
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center h-20">
                      <span 
                        style={{ 
                          color: typeColor, 
                          fontFamily: '"Dancing Script", "Brush Script MT", "Caveat", cursive, sans-serif',
                          fontSize: '28px',
                          fontStyle: 'italic'
                        }}
                      >
                        {typeText}
                      </span>
                    </div>
                  )}

                  {/* Type Color Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Ink Color:</span>
                    {['#000000', '#0000ff', '#ff0000'].map(c => (
                      <button
                        key={c}
                        onClick={() => setTypeColor(c)}
                        className={`w-6 h-6 rounded-full border relative flex items-center justify-center`}
                        style={{ backgroundColor: c }}
                      >
                        {typeColor === c && <Check className="w-3.5 h-3.5 text-white mix-blend-difference" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowStampModal(false)}>Cancel</Button>
              <Button onClick={saveSignatureStamp}>Save Signature</Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-muted-foreground block">{children}</label>;
}
