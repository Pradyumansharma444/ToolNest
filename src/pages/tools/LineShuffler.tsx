import { useState, useMemo } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function LineShuffler() {
  const tool = getToolById('line-shuffler')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'shuffle' | 'pick'>('shuffle');
  const [pickCount, setPickCount] = useState(1);
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => input.split('\n').filter(l => l.trim()), [input]);

  const process = () => {
    if (lines.length === 0) return;
    if (mode === 'shuffle') {
      setOutput([...lines].sort(() => Math.random() - 0.5));
    } else {
      const shuffled = [...lines].sort(() => Math.random() - 0.5);
      setOutput(shuffled.slice(0, Math.min(pickCount, lines.length)));
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={output.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter items, one per line..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'shuffle' ? 'default' : 'outline'} onClick={() => setMode('shuffle')}>Shuffle All</Button>
          <Button size="sm" variant={mode === 'pick' ? 'default' : 'outline'} onClick={() => setMode('pick')}>Pick Random</Button>
          {mode === 'pick' && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Pick:</span>
              <input type="number" min={1} max={lines.length} value={pickCount} onChange={(e) => setPickCount(Math.min(lines.length, Math.max(1, +e.target.value)))}
                className="w-16 h-8 rounded-md border bg-background px-2 text-sm" />
            </div>
          )}
          <Button size="sm" variant="outline" onClick={process}><Shuffle className="w-4 h-4 mr-1" />Go</Button>
        </div>
        {output.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{mode === 'shuffle' ? 'Shuffled' : 'Picked'} ({output.length})</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono">{output.join('\n')}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
