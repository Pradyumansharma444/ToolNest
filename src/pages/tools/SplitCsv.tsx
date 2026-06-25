import { useState, useMemo } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseCSVLine } from '@/lib/csv-parser';

export default function SplitCsv() {
  const tool = getToolById('split-csv')!;
  const { toast } = useToast();
  const [csv, setCsv] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'rows' | 'column'>('rows');
  const [rowsPerFile, setRowsPerFile] = useState(100);
  const [splitColumn, setSplitColumn] = useState('');
  const [processing, setProcessing] = useState(false);

  const headers = useMemo(() => {
    if (!csv.trim()) return [];
    return parseCSVLine(csv.trim().split('\n')[0] || '').map(h => h.trim().replace(/^"|"$/g, ''));
  }, [csv]);

  const splitFiles = useMemo(() => {
    if (!csv.trim()) return [];
    try {
      const lines = csv.trim().split('\n');
      const header = lines[0];
      const dataLines = lines.slice(1);

      if (splitMode === 'rows') {
        const files: { name: string; content: string }[] = [];
        for (let i = 0; i < dataLines.length; i += rowsPerFile) {
          const chunk = dataLines.slice(i, i + rowsPerFile);
          files.push({
            name: `part_${Math.floor(i / rowsPerFile) + 1}.csv`,
            content: [header, ...chunk].join('\n'),
          });
        }
        return files;
      } else {
        if (!splitColumn) return [];
        const colIndex = headers.indexOf(splitColumn);
        if (colIndex === -1) return [];

        const groups: Record<string, string[]> = {};
        for (const line of dataLines) {
          const values = parseCSVLine(line);
          const key = (values[colIndex] || 'empty').trim().replace(/^"|"$/g, '');
          if (!groups[key]) groups[key] = [];
          groups[key].push(line);
        }

        return Object.entries(groups).map(([key, lines]) => ({
          name: `${key.replace(/[^a-zA-Z0-9]/g, '_')}.csv`,
          content: [header, ...lines].join('\n'),
        }));
      }
    } catch {
      return [];
    }
  }, [csv, splitMode, rowsPerFile, splitColumn, headers]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setCsv(await files[0].text());
    }
  };

  const downloadAll = async () => {
    setProcessing(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      splitFiles.forEach(f => zip.file(f.name, f.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split_csv.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded as ZIP!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create ZIP.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={splitFiles.length > 0}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'text/csv': ['.csv'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setCsv(''); }}
          label="Upload CSV to Split"
        />

        {csv && (
          <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as 'rows' | 'column')}>
            <TabsList>
              <TabsTrigger value="rows">By Rows</TabsTrigger>
              <TabsTrigger value="column">By Column Value</TabsTrigger>
            </TabsList>

            <TabsContent value="rows" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Rows per file</label>
                <Input
                  type="number"
                  value={rowsPerFile}
                  onChange={(e) => setRowsPerFile(Number(e.target.value))}
                  min={1}
                  max={10000}
                />
              </div>
            </TabsContent>

            <TabsContent value="column" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Split by Column</label>
                <select
                  value={splitColumn}
                  onChange={(e) => setSplitColumn(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select column...</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {splitFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{splitFiles.length} files generated</span>
              <Button size="sm" onClick={downloadAll} disabled={processing}>
                {processing ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating ZIP...</>
                ) : (
                  <><Download className="w-4 h-4 mr-1" /> Download All (ZIP)</>
                )}
              </Button>
            </div>
            <div className="rounded-xl border divide-y max-h-64 overflow-y-auto">
              {splitFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/50">
                  <span className="text-sm">{f.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => downloadFile(f.content, f.name, 'text/csv')}>
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
