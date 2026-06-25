import { useState, useMemo } from 'react';
import { Code, Download, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CsvToXml() {
  const tool = getToolById('csv-to-xml')!;
  const { toast } = useToast();
  const [csv, setCsv] = useState('');
  const [rootElement, setRootElement] = useState('root');
  const [rowElement, setRowElement] = useState('row');
  const [copied, setCopied] = useState(false);

  const xml = useMemo(() => {
    if (!csv.trim()) return '';
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) return '';

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/\s+/g, '_'));
      const safeRoot = rootElement.replace(/[^a-zA-Z0-9_]/g, '') || 'root';
      const safeRow = rowElement.replace(/[^a-zA-Z0-9_]/g, '') || 'row';

      let result = `<?xml version="1.0" encoding="UTF-8"?>\n<${safeRoot}>\n`;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        result += `  <${safeRow}>\n`;
        headers.forEach((h, idx) => {
          const safeHeader = h.replace(/[^a-zA-Z0-9_]/g, '') || `col_${idx}`;
          const escaped = (values[idx] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          result += `    <${safeHeader}>${escaped}</${safeHeader}>\n`;
        });
        result += `  </${safeRow}>\n`;
      }

      result += `</${safeRoot}>`;
      return result;
    } catch {
      return 'Invalid CSV';
    }
  }, [csv, rootElement, rowElement]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadXml = () => {
    downloadFile(xml, 'converted.xml', 'application/xml');
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={xml.length > 0}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Root Element</label>
            <Input value={rootElement} onChange={(e) => setRootElement(e.target.value)} placeholder="root" />
          </div>
          <div>
            <label className="text-sm font-medium">Row Element</label>
            <Input value={rowElement} onChange={(e) => setRowElement(e.target.value)} placeholder="row" />
          </div>
        </div>

        <Textarea
          placeholder="Paste CSV here...\nname,age\nJohn,30\nJane,25"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="min-h-[150px] resize-y font-mono text-sm"
        />

        {xml && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="font-medium">XML Output</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadXml}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{xml}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
