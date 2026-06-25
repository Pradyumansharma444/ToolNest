import { useState, useMemo } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function JsonFormatter() {
  const tool = getToolById('json-formatter')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [minify, setMinify] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, minify ? 0 : 2);
    } catch (e) {
      return `Invalid JSON: ${(e as Error).message}`;
    }
  }, [input, minify]);

  const isError = result.startsWith('Invalid JSON');

  const copyResult = () => {
    if (!isError) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  const download = () => {
    if (!isError) {
      downloadFile(result, 'formatted.json', 'application/json');
      toast({ title: 'Downloaded!' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea
          placeholder='Paste JSON here...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant={minify ? 'outline' : 'default'} onClick={() => setMinify(false)}>Format</Button>
          <Button size="sm" variant={minify ? 'default' : 'outline'} onClick={() => setMinify(true)}>Minify</Button>
        </div>
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={isError ? 'text-destructive font-medium' : 'font-medium'}>
                {isError ? 'Error' : 'Output'}
              </span>
              {!isError && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyResult}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={download}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className={`text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono ${isError ? 'text-destructive' : ''}`}>
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
