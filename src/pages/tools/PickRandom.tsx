import { useState, useMemo } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PickRandom() {
  const tool = getToolById('pick-random')!;
  const { toast } = useToast();
  const [items, setItems] = useState('');
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const list = useMemo(() => items.split('\n').map(l => l.trim()).filter(Boolean), [items]);

  const pick = () => {
    if (list.length === 0) { toast({ title: 'Enter at least one item', variant: 'destructive' }); return; }
    if (count > list.length) { toast({ title: 'Count exceeds number of items', variant: 'destructive' }); return; }
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setResult(shuffled.slice(0, count));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter items, one per line..." value={items} onChange={(e) => setItems(e.target.value)} className="min-h-[150px] resize-y font-mono text-sm" />
        <div className="flex items-center gap-2">
          <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, +e.target.value))} className="w-24" />
          <span className="text-sm text-muted-foreground">item(s) to pick from {list.length}</span>
        </div>
        <Button onClick={pick}><Shuffle className="w-4 h-4 mr-1" />Pick Random</Button>
        {result.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Selected</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {result.map((item, i) => <li key={i} className="text-sm">{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
