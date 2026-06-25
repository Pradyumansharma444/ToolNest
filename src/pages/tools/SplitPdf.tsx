import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Scissors, Loader2, Download, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { ProcessingState } from '@/types';

export default function SplitPdf() {
  const tool = getToolById('split-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'every'>('range');
  const [pageRange, setPageRange] = useState('');
  const [everyN, setEveryN] = useState(1);
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [splitFiles, setSplitFiles] = useState<{ name: string; blob: Blob; pages: number }[]>([]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
        setSplitFiles([]);
        setProcessing({ status: 'idle', progress: 0, message: '' });
      } catch {
        toast({
          title: 'Invalid PDF',
          description: 'Could not read the PDF file.',
          variant: 'destructive',
        });
      }
    }
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[][] => {
    const ranges: number[][] = [];
    const parts = rangeStr.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, start);
          const e = Math.min(maxPages, end);
          if (s <= e) {
            const pages: number[] = [];
            for (let i = s - 1; i < e; i++) pages.push(i);
            ranges.push(pages);
          }
        }
      } else {
        const page = Number(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          ranges.push([page - 1]);
        }
      }
    }
    return ranges;
  };

  const splitPdf = async () => {
    if (!file) return;

    setProcessing({ status: 'processing', progress: 0, message: 'Reading PDF...' });
    setSplitFiles([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const pageGroups: number[][] = [];

      if (splitMode === 'range') {
        pageGroups.push(...parsePageRange(pageRange, totalPages));
      } else {
        // Split every N pages
        for (let i = 0; i < totalPages; i += everyN) {
          const group: number[] = [];
          for (let j = i; j < Math.min(i + everyN, totalPages); j++) {
            group.push(j);
          }
          pageGroups.push(group);
        }
      }

      if (pageGroups.length === 0) {
        toast({
          title: 'Invalid range',
          description: 'Please enter valid page numbers.',
          variant: 'destructive',
        });
        setProcessing({ status: 'idle', progress: 0, message: '' });
        return;
      }

      const results: { name: string; blob: Blob; pages: number }[] = [];

      for (let i = 0; i < pageGroups.length; i++) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, pageGroups[i]);
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = uint8ToBlob(bytes, "application/pdf");
        const startPage = pageGroups[i][0] + 1;
        const endPage = pageGroups[i][pageGroups[i].length - 1] + 1;
        const name = pageGroups[i].length === 1
          ? `page_${startPage}.pdf`
          : `pages_${startPage}-${endPage}.pdf`;

        results.push({ name, blob, pages: pageGroups[i].length });

        setProcessing({
          status: 'processing',
          progress: Math.round(((i + 1) / pageGroups.length) * 100),
          message: `Creating part ${i + 1} of ${pageGroups.length}...`,
        });
      }

      setSplitFiles(results);
      setProcessing({ status: 'complete', progress: 100, message: `Split into ${results.length} files` });
      toast({
        title: 'Success!',
        description: `PDF split into ${results.length} files.`,
      });
    } catch {
      setProcessing({ status: 'error', progress: 0, message: 'Failed to split PDF.' });
      toast({
        title: 'Error',
        description: 'Failed to split PDF. Please check your page range.',
        variant: 'destructive',
      });
    }
  };

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    splitFiles.forEach(f => zip.file(f.name, f.blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'split_pdfs.zip');
  };

  return (
    <ToolLayout tool={tool} resultVisible={splitFiles.length > 0}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setTotalPages(0); setSplitFiles([]); }}
          label="Upload PDF to Split"
        />

        {file && totalPages > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-3">Total pages: {totalPages}</p>

            {/* Split Mode */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={splitMode === 'range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSplitMode('range')}
              >
                By Page Range
              </Button>
              <Button
                variant={splitMode === 'every' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSplitMode('every')}
              >
                Every N Pages
              </Button>
            </div>

            {splitMode === 'range' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Range</label>
                <Input
                  placeholder="e.g., 1-5, 8, 10-12"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter page numbers and/or ranges separated by commas. Max: {totalPages} pages.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Split Every</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={everyN}
                    onChange={(e) => setEveryN(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm">pages</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Split Button */}
        {file && (
          <Button
            onClick={splitPdf}
            disabled={processing.status === 'processing'}
            size="lg"
            className="w-full"
          >
            {processing.status === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {processing.message} {processing.progress}%
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4 mr-2" />
                Split PDF
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {splitFiles.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
              <span className="font-medium text-sm">{splitFiles.length} file(s) generated</span>
              <Button size="sm" variant="outline" onClick={downloadAll}>
                <FileArchive className="w-4 h-4 mr-1" />
                Download All (ZIP)
              </Button>
            </div>
            <div className="divide-y">
              {splitFiles.map((sf, idx) => (
                <div key={idx} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{sf.name}</p>
                    <p className="text-xs text-muted-foreground">{sf.pages} page(s)</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => downloadBlob(sf.blob, sf.name)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
