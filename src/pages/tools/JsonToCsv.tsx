import { useState, useMemo } from 'react';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function JsonToCsv() {
  const tool = getToolById('json-to-csv')!;
  const { toast } = useToast();
  const [json, setJson] = useState('');
  const [copied, setCopied] = useState(false);

  const csv = useMemo(() => {
    if (!json.trim()) return '';
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data) || data.length === 0) return 'JSON must be an array of objects';

      const headers = Object.keys(data[0]);
      const escapeCSV = (value: unknown): string => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = data.map((row: Record<string, unknown>) =>
        headers.map(h => escapeCSV(row[h])).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    } catch {
      return 'Invalid JSON';
    }
  }, [json]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadCsv = () => {
    downloadFile(csv, 'converted.csv', 'text/csv');
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={csv.length > 0 && !csv.startsWith('Invalid') && !csv.startsWith('JSON')}>
      <div className="space-y-6">
        <Textarea
          placeholder='Paste JSON array here...\n[\n  {"name": "John", "age": 30},\n  {"name": "Jane", "age": 25}\n]'
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
        />

        {csv && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span className="font-medium">CSV Output</span>
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
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{csv}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
