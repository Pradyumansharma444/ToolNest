import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

(pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as { version: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;

import { FileSpreadsheet, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface TextLine {
  items: TextItem[];
  y: number;
}

function groupItemsByLine(items: TextItem[], lineThreshold = 3): TextLine[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) < lineThreshold) return a.transform[4] - b.transform[4];
    return yDiff;
  });
  const lines: TextLine[] = [];
  let currentLine: TextLine = { items: [sorted[0]], y: sorted[0].transform[5] };
  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    if (Math.abs(item.transform[5] - currentLine.y) < lineThreshold) {
      currentLine.items.push(item);
    } else {
      currentLine.items.sort((a, b) => a.transform[4] - b.transform[4]);
      lines.push(currentLine);
      currentLine = { items: [item], y: item.transform[5] };
    }
  }
  currentLine.items.sort((a, b) => a.transform[4] - b.transform[4]);
  lines.push(currentLine);
  return lines;
}

function detectTableColumns(lines: TextLine[]): number[] {
  const xPositions = new Map<number, number>();
  for (const line of lines) {
    for (const item of line.items) {
      const x = Math.round(item.transform[4]);
      xPositions.set(x, (xPositions.get(x) || 0) + 1);
    }
  }
  return Array.from(xPositions.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => a[0] - b[0])
    .map(([x]) => x);
}

function buildTableFromLines(lines: TextLine[], columns: number[]): string[][] {
  if (columns.length === 0) {
    return lines.map(line => [line.items.map(item => item.str).join(' ')]);
  }
  const rows: string[][] = [];
  for (const line of lines) {
    const cells: string[] = new Array(columns.length).fill('');
    for (const item of line.items) {
      const x = item.transform[4];
      let bestCol = 0;
      let bestDist = Infinity;
      for (let c = 0; c < columns.length; c++) {
        const dist = Math.abs(x - columns[c]);
        if (dist < bestDist) { bestDist = dist; bestCol = c; }
      }
      cells[bestCol] = cells[bestCol] ? cells[bestCol] + ' ' + item.str : item.str;
    }
    rows.push(cells);
  }
  return rows;
}

export default function PdfToExcel() {
  const tool = getToolById('pdf-to-excel')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setResultReady(false); setPreview(''); }
  };

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (pdfjsLib as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: import('pdfjs-dist/types/src/display/api').TextItem[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise as { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: import('pdfjs-dist/types/src/display/api').TextItem[] }> }> };
      const allRows: string[][] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items as TextItem[];
        const lines = groupItemsByLine(items);
        const columns = detectTableColumns(lines);
        const table = buildTableFromLines(lines, columns);
        if (i > 1 && table.length > 0) allRows.push([]);
        allRows.push(...table);
      }
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      ws['!cols'] = (allRows[0] || []).map((_, colIdx) => {
        let maxLen = 10;
        for (const row of allRows) { const len = (row[colIdx] || '').length; if (len > maxLen) maxLen = len; }
        return { wch: Math.min(maxLen + 2, 50) };
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
      const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setPreview(allRows.slice(0, 20).map(row => row.join(' | ')).join('\n') || 'No text content found');
      setResultReady(true);
      downloadBlob(blob, file.name.replace(/\.pdf$/i, '.xlsx'));
      toast({ title: 'PDF converted to Excel!', description: `Extracted ${allRows.length} rows from ${pdf.numPages} pages.` });
    } catch {
      toast({ title: 'Conversion failed', description: 'Could not extract data from this PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={resultReady}>
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> This tool extracts text and tabular data from PDFs into .xlsx format. Scanned/image-based PDFs may not produce accurate results.
        </div>
        <FileUpload accept={{ 'application/pdf': ['.pdf'] }} onFilesSelected={handleFileSelected} selectedFile={file} onFileRemoved={() => { setFile(null); setResultReady(false); setPreview(''); }} label="Upload PDF" />
        {file && (
          <Button onClick={convert} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><FileSpreadsheet className="w-4 h-4 mr-2" /> Convert to Excel (.xlsx)</>}
          </Button>
        )}
        {resultReady && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-card">
              <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
                <span className="font-medium text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Preview (first 20 rows)</span>
                <Button size="sm" variant="outline" onClick={convert} disabled={processing}><Download className="w-4 h-4 mr-1" /> Download .xlsx</Button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto"><pre className="text-xs whitespace-pre-wrap font-mono">{preview}</pre></div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
