import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
  'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS', 'ORDER', 'BY', 'ASC',
  'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'BETWEEN', 'LIKE', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'COALESCE', 'IF',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT',
  'WITH', 'RECURSIVE', 'EXCEPT', 'INTERSECT', 'SOME', 'ANY',
];

function formatSql(sql: string): string {
  const formatted = sql
    .replace(/;?\s*$/g, '')
    .replace(/\b(SELECT|FROM|WHERE|INSERT INTO|VALUES|UPDATE|SET|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|UNION|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|CROSS JOIN|JOIN|ON)\b/gi,
      (match) => `\n${match.toUpperCase()}`)
    .replace(/\b(AND|OR)\b/gi, (match) => `\n  ${match.toUpperCase()}`)
    .trim();

  let indentLevel = 0;
  const lines = formatted.split('\n').map(line => line.trim()).filter(Boolean);
  const result: string[] = [];

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.startsWith('SELECT') || upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE') || upper.startsWith('CREATE') || upper.startsWith('ALTER') || upper.startsWith('DROP')) {
      indentLevel = 1;
    } else if (upper.startsWith('ORDER') || upper.startsWith('GROUP') || upper.startsWith('HAVING') || upper.startsWith('LIMIT') || upper.startsWith('OFFSET') || upper.startsWith('UNION')) {
      indentLevel = 1;
    } else if (upper.startsWith('FROM') || upper.startsWith('WHERE') || upper.startsWith('JOIN') || upper.startsWith('LEFT') || upper.startsWith('RIGHT') || upper.startsWith('INNER') || upper.startsWith('FULL') || upper.startsWith('CROSS') || upper.startsWith('ON')) {
      indentLevel = 1;
    }
    result.push('  '.repeat(indentLevel) + line);
  }

  let final = result.join('\n');
  for (const kw of KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    if (kw.length > 2) {
      final = final.replace(regex, kw);
    }
  }

  return final;
}

export default function SqlFormatter() {
  const tool = getToolById('sql-formatter')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return formatSql(input);
    } catch {
      return 'Error formatting SQL';
    }
  }, [input]);

  const isError = result.startsWith('Error');

  const copyResult = () => {
    if (!isError) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your SQL query here..."
          className="min-h-[180px] font-mono text-sm resize-y" />

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Formatted SQL</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className={`text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono ${isError ? 'text-destructive' : ''}`}>{result}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
