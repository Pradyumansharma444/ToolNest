import { useState } from 'react';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function AiSummarizer() {
  const tool = getToolById('ai-summarizer')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setFile(f);
    setSummary('');
    setComplete(false);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      const arrayBuffer = await f.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
      }
      setExtractedText(fullText);
    } catch {
      toast({ title: 'Error', description: 'Could not extract text from PDF.', variant: 'destructive' });
    }
  };

  const generateSummary = async () => {
    if (!extractedText) return;
    setProcessing(true);
    try {
      const sentences = extractedText
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .filter((s: string) => s.trim().length > 10);

      const wordFreq: Record<string, number> = {};
      const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who', 'whom']);

      const words = extractedText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      words.forEach(word => {
        if (!stopWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      const topWords = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);

      const scored = sentences.map((s: string) => {
        const lower = s.toLowerCase();
        let score = 0;
        topWords.forEach(word => {
          if (lower.includes(word)) score++;
        });
        if (s.length < 50) score *= 0.5;
        if (/^[A-Z]/.test(s)) score *= 1.2;
        return { text: s.trim(), score };
      });

      const topSentences = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(5, scored.length))
        .sort((a, b) => scored.indexOf(a) - scored.indexOf(b))
        .map(s => s.text);

      const summaryText = topSentences.join(' ');
      setSummary(summaryText || 'Could not generate a summary from this document.');
      setComplete(true);
      toast({ title: 'Summary generated!', description: 'Key sentences extracted from the document.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate summary.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const downloadSummary = () => {
    downloadFile(summary, 'summary.txt', 'text/plain');
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setExtractedText(''); setSummary(''); setComplete(false); }}
          label="Upload PDF to Summarize"
        />

        {extractedText && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Extracted Text ({extractedText.length} characters)</p>
            <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground font-mono whitespace-pre-wrap">{extractedText.slice(0, 500)}...</div>
            <Button onClick={generateSummary} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Summarizing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Summary</>}
            </Button>
          </div>
        )}

        {summary && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Summary</span>
              <Button size="sm" variant="outline" onClick={downloadSummary}><FileText className="w-4 h-4 mr-1" /> Download</Button>
            </div>
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
