import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function UrlEncoder() {
  const tool = getToolById('url-encoder')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch {
      return mode === 'encode' ? 'Encoding failed' : 'Invalid URL encoding';
    }
  }, [input, mode]);

  const isError = result === 'Encoding failed' || result === 'Invalid URL encoding';

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
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>Encode</Button>
          <Button size="sm" variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>Decode</Button>
        </div>
        <Textarea
          placeholder={mode === 'encode' ? 'Enter text to URL encode...' : 'Paste URL encoded string...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] resize-y font-mono text-sm"
        />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={isError ? 'text-destructive font-medium' : 'font-medium'}>{mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}</span>
              {!isError && (
                <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              )}
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
