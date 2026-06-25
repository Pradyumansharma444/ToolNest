import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ReverseText() {
  const tool = getToolById('reverse-text')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'characters' | 'words' | 'lines'>('characters');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return '';
    switch (mode) {
      case 'characters': return input.split('').reverse().join('');
      case 'words': return input.split(/\s+/).reverse().join(' ');
      case 'lines': return input.split('\n').reverse().join('\n');
    }
  }, [input, mode]);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter text to reverse..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[150px] resize-y" />
        <div className="flex gap-2">
          {(['characters', 'words', 'lines'] as const).map(m => (
            <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'} onClick={() => setMode(m)}>{m.charAt(0).toUpperCase() + m.slice(1)}</Button>
          ))}
        </div>
        {result && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Reversed Text</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-mono">{result}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
