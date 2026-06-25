import { useState, useMemo } from 'react';
import { Copy, Check, ArrowUpDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ListSorter() {
  const tool = getToolById('list-sorter')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'length' | 'natural' | 'reverse'>('alpha');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const items = input.split('\n').filter(l => l.trim());
    if (items.length === 0) return [];
    switch (sortBy) {
      case 'alpha': return [...items].sort((a, b) => a.localeCompare(b));
      case 'reverse': return [...items].sort((a, b) => b.localeCompare(a));
      case 'length': return [...items].sort((a, b) => a.length - b.length);
      case 'natural': return [...items].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
  }, [input, sortBy]);

  const copyResult = () => {
    navigator.clipboard.writeText(result.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter items, one per line..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alphabetical</SelectItem>
              <SelectItem value="reverse">Reverse Alpha</SelectItem>
              <SelectItem value="length">By Length</SelectItem>
              <SelectItem value="natural">Natural Order</SelectItem>
            </SelectContent>
          </Select>
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        </div>
        {result.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Sorted ({result.length} items)</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono">{result.join('\n')}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
