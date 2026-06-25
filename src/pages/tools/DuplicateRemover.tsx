import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function DuplicateRemover() {
  const tool = getToolById('duplicate-remover')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [sortOutput, setSortOutput] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    const lines = input.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase().trim();
      if (key && !seen.has(key)) { seen.add(key); result.push(line); }
    }
    return sortOutput ? result.sort((a, b) => caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())) : result;
  }, [input, sortOutput, caseSensitive]);

  const originalCount = input.split('\n').filter(l => l.trim()).length;
  const outputCount = output.length;

  const copyResult = () => {
    navigator.clipboard.writeText(output.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={input.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Paste text with duplicate lines..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-muted-foreground" />Case sensitive</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sortOutput} onChange={(e) => setSortOutput(e.target.checked)} className="rounded border-muted-foreground" />Sort alphabetically</label>
        </div>
        {input && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{originalCount} lines → {outputCount} unique lines (removed {originalCount - outputCount})</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono">{output.join('\n')}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
