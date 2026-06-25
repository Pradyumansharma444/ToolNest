import { useState, useMemo } from 'react';
import { Merge, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSVLine } from '@/lib/csv-parser';

export default function MergeCsv() {
  const tool = getToolById('merge-csv')!;
  const { toast } = useToast();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [csv1, setCsv1] = useState('');
  const [csv2, setCsv2] = useState('');
  const [joinType, setJoinType] = useState<'inner' | 'left' | 'right'>('inner');
  const [joinColumn, setJoinColumn] = useState('');
  const [copied, setCopied] = useState(false);

  const headers1 = useMemo(() => {
    if (!csv1.trim()) return [];
    return parseCSVLine(csv1.trim().split('\n')[0] || '').map(h => h.trim().replace(/^"|"$/g, ''));
  }, [csv1]);

  const headers2 = useMemo(() => {
    if (!csv2.trim()) return [];
    return parseCSVLine(csv2.trim().split('\n')[0] || '').map(h => h.trim().replace(/^"|"$/g, ''));
  }, [csv2]);

  const commonHeaders = useMemo(() => {
    return headers1.filter(h => headers2.includes(h));
  }, [headers1, headers2]);

  const merged = useMemo(() => {
    if (!csv1.trim() || !csv2.trim() || !joinColumn) return '';

    try {
      const parseCSV = (csv: string) => {
        const lines = csv.trim().split('\n');
        const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line).map(v => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h, i) => row[h] = values[i] || '');
          return row;
        });
        return { headers, rows };
      };

      const data1 = parseCSV(csv1);
      const data2 = parseCSV(csv2);

      const mergedHeaders = [...data1.headers, ...data2.headers.filter(h => h !== joinColumn)];
      const result: string[][] = [];

      for (const row1 of data1.rows) {
        const matches = data2.rows.filter(row2 => row2[joinColumn] === row1[joinColumn]);
        if (matches.length > 0) {
          for (const match of matches) {
            const mergedRow = [...data1.headers.map(h => row1[h])];
            for (const h of data2.headers) {
              if (h !== joinColumn) mergedRow.push(match[h]);
            }
            result.push(mergedRow);
          }
        } else if (joinType === 'left') {
          const mergedRow = [...data1.headers.map(h => row1[h])];
          for (const h of data2.headers) {
            if (h !== joinColumn) mergedRow.push('');
          }
          result.push(mergedRow);
        }
      }

      if (joinType === 'right') {
        for (const row2 of data2.rows) {
          const alreadyMatched = data1.rows.some(row1 => row1[joinColumn] === row2[joinColumn]);
          if (!alreadyMatched) {
            const mergedRow = data1.headers.map(() => '');
            for (const h of data2.headers) {
              if (h !== joinColumn) mergedRow.push(row2[h]);
            }
            result.push(mergedRow);
          }
        }
      }

      return [mergedHeaders.join(','), ...result.map(r => r.join(','))].join('\n');
    } catch {
      return 'Error merging CSVs';
    }
  }, [csv1, csv2, joinColumn, joinType]);

  const handleFile1 = async (files: File[]) => {
    if (files.length > 0) {
      setFile1(files[0]);
      setCsv1(await files[0].text());
    }
  };

  const handleFile2 = async (files: File[]) => {
    if (files.length > 0) {
      setFile2(files[0]);
      setCsv2(await files[0].text());
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(merged);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadCsv = () => {
    downloadFile(merged, 'merged.csv', 'text/csv');
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={merged.length > 0}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            accept={{ 'text/csv': ['.csv'] }}
            onFilesSelected={handleFile1}
            selectedFile={file1}
            onFileRemoved={() => { setFile1(null); setCsv1(''); }}
            label="Upload CSV 1 (Left)"
          />
          <FileUpload
            accept={{ 'text/csv': ['.csv'] }}
            onFilesSelected={handleFile2}
            selectedFile={file2}
            onFileRemoved={() => { setFile2(null); setCsv2(''); }}
            label="Upload CSV 2 (Right)"
          />
        </div>

        {csv1 && csv2 && commonHeaders.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-sm font-medium">Join Type</label>
                <div className="flex gap-2 mt-1">
                  {(['inner', 'left', 'right'] as const).map(t => (
                    <Button key={t} variant={joinType === t ? 'default' : 'outline'} size="sm" onClick={() => setJoinType(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Join Column</label>
                <Select value={joinColumn} onValueChange={setJoinColumn}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonHeaders.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {merged && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Merge className="w-4 h-4 text-primary" />
                <span className="font-medium">Merged CSV</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadCsv}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{merged}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
