import { useState, useMemo } from 'react';
import { Database, Download, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { parseCSVLine } from '@/lib/csv-parser';

export default function CsvToSql() {
  const tool = getToolById('csv-to-sql')!;
  const { toast } = useToast();
  const [csv, setCsv] = useState('');
  const [tableName, setTableName] = useState('my_table');
  const [copied, setCopied] = useState(false);

  const sql = useMemo(() => {
    if (!csv.trim()) return '';
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) return '';

      const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').replace(/\s+/g, '_'));
      const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '') || 'my_table';

      let result = `-- CREATE TABLE ${safeTable}\n`;
      result += `CREATE TABLE ${safeTable} (\n`;
      result += headers.map(h => `  ${h.replace(/[^a-zA-Z0-9_]/g, '')} VARCHAR(255)`).join(',\n');
      result += '\n);\n\n';

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]).map(v => {
          const trimmed = v.trim().replace(/^"|"$/g, '');
          return `'${trimmed.replace(/'/g, "''")}'`;
        });
        result += `INSERT INTO ${safeTable} (${headers.map(h => h.replace(/[^a-zA-Z0-9_]/g, '')).join(', ')}) VALUES (${values.join(', ')});\n`;
      }

      return result;
    } catch {
      return 'Invalid CSV';
    }
  }, [csv, tableName]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadSql = () => {
    downloadFile(sql, 'data.sql', 'text/plain');
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={sql.length > 0}>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Table Name</label>
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="my_table" />
        </div>

        <Textarea
          placeholder="Paste CSV here...\nid,name,email\n1,John,john@example.com\n2,Jane,jane@example.com"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="min-h-[150px] resize-y font-mono text-sm"
        />

        {sql && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="font-medium">SQL Output</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadSql}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{sql}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
