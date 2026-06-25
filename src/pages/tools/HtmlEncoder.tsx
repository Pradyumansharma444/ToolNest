import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const htmlEntities: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

const htmlEntitiesReverse: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'",
};

export default function HtmlEncoder() {
  const tool = getToolById('html-encoder')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    if (mode === 'encode') {
      return input.replace(/[&<>"']/g, c => htmlEntities[c] || c);
    } else {
      return input.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, m => htmlEntitiesReverse[m] || m);
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>Encode</Button>
          <Button size="sm" variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>Decode</Button>
        </div>
        <Textarea placeholder='Enter text...' value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[150px] resize-y font-mono text-sm" />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Output</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
