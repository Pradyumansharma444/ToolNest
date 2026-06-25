import { useState, useMemo } from 'react';
import { ArrowRight, Download, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CsvToJson() {
  const tool = getToolById('csv-to-json')!;
  const { toast } = useToast();
  const [csv, setCsv] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const json = useMemo(() => {
    if (!csv.trim()) return '';
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) return '';

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const result: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        result.push(row);
      }

      return JSON.stringify(result, null, 2);
    } catch {
      return 'Invalid CSV format';
    }
  }, [csv]);

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values.map(v => v.replace(/^"|"$/g, ''));
  };

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const text = await selectedFile.text();
      setCsv(text);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadJson = () => {
    downloadFile(json, 'converted.json', 'application/json');
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={json.length > 0}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'text/csv': ['.csv'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setCsv(''); }}
          label="Upload CSV File"
          description="Or paste CSV below"
        />

        <Textarea
          placeholder="Paste CSV here... (first row = headers)\nname,age,city\nJohn,30,NYC\nJane,25,LA"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="min-h-[150px] resize-y font-mono text-sm"
        />

        {json && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="font-medium">JSON Output</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadJson}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{json}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
