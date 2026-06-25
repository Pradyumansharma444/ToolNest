import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function TextRepeater() {
  const tool = getToolById('text-repeater')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [joinWith, setJoinWith] = useState('\n');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return '';
    const items = Array.from({ length: count }, () => text);
    return items.join(joinWith);
  }, [text, count, joinWith]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Text to repeat..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px] resize-y" />
        <div className="flex gap-4">
          <div><label className="text-sm text-muted-foreground block">Times</label><Input type="number" min={1} max={10000} value={count} onChange={(e) => setCount(Math.max(1, +e.target.value))} className="w-24" /></div>
          <div><label className="text-sm text-muted-foreground block">Join with</label><Input value={joinWith} onChange={(e) => setJoinWith(e.target.value)} className="w-24 font-mono" /></div>
        </div>
        {result && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Output ({result.length} chars)</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono bg-muted p-3 rounded-lg">{result.slice(0, 2000)}{result.length > 2000 ? '...' : ''}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
