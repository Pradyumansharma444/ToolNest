import { useState } from 'react';
import { GitCompare, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ComparePdf() {
  const tool = getToolById('compare-pdf')!;
  const { toast } = useToast();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ page: number; text1: string; text2: string; diff: string }[]>([]);

  const extractText = async (file: File): Promise<string[]> => {
    const pdfjsLib = await import('pdfjs-dist');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise;
    const texts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map((item: { str: string }) => item.str).join(' '));
    }
    return texts;
  };

  const comparePdfs = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    try {
      const [texts1, texts2] = await Promise.all([extractText(file1), extractText(file2)]);
      const maxPages = Math.max(texts1.length, texts2.length);
      const diffs: { page: number; text1: string; text2: string; diff: string }[] = [];

      for (let i = 0; i < maxPages; i++) {
        const t1 = texts1[i] || '(Page not found)';
        const t2 = texts2[i] || '(Page not found)';
        if (t1 !== t2) {
          diffs.push({ page: i + 1, text1: t1, text2: t2, diff: 'Different content' });
        }
      }

      setResults(diffs);
      if (diffs.length === 0) {
        toast({ title: 'Identical', description: 'Both PDFs have the same text content.' });
      } else {
        toast({ title: 'Differences found', description: `${diffs.length} page(s) differ.` });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to compare PDFs.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={results.length > 0}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            accept={{ 'application/pdf': ['.pdf'] }}
            onFilesSelected={(f) => { if (f[0]) setFile1(f[0]); setResults([]); }}
            selectedFile={file1}
            onFileRemoved={() => { setFile1(null); setResults([]); }}
            label="PDF 1 (Original)"
          />
          <FileUpload
            accept={{ 'application/pdf': ['.pdf'] }}
            onFilesSelected={(f) => { if (f[0]) setFile2(f[0]); setResults([]); }}
            selectedFile={file2}
            onFileRemoved={() => { setFile2(null); setResults([]); }}
            label="PDF 2 (Modified)"
          />
        </div>

        {file1 && file2 && (
          <Button onClick={comparePdfs} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing...</> : <><GitCompare className="w-4 h-4 mr-2" /> Compare PDFs</>}
          </Button>
        )}

        {results.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="p-3 border-b bg-muted/50 rounded-t-xl">
              <span className="font-medium text-sm">{results.length} page(s) differ</span>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {results.map(r => (
                <div key={r.page} className="p-4 space-y-2">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <FileText className="w-4 h-4" />
                    Page {r.page}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
                      <p className="font-medium text-red-700 dark:text-red-300 mb-1">PDF 1:</p>
                      <p className="text-muted-foreground">{r.text1.slice(0, 200)}...</p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800">
                      <p className="font-medium text-green-700 dark:text-green-300 mb-1">PDF 2:</p>
                      <p className="text-muted-foreground">{r.text2.slice(0, 200)}...</p>
                    </div>
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
