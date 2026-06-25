import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function FindReplace() {
  const tool = getToolById('find-replace')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [copied, setCopied] = useState(false);

  const { result, matchCount } = useMemo(() => {
    if (!text || !find) return { result: text, matchCount: 0 };
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = text.match(pattern);
      return { result: text.replace(pattern, replace), matchCount: matches ? matches.length : 0 };
    } catch {
      return { result: text, matchCount: 0 };
    }
  }, [text, find, replace, useRegex, caseSensitive]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={text.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter text..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px] resize-y font-mono text-sm" />
        <Input placeholder="Find..." value={find} onChange={(e) => setFind(e.target.value)} className="font-mono" />
        <Input placeholder="Replace with..." value={replace} onChange={(e) => setReplace(e.target.value)} className="font-mono" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-muted-foreground" />Case sensitive</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="rounded border-muted-foreground" />Regex</label>
        </div>
        {text && find && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono">{result}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
