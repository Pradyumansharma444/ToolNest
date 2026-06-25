import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

export default function MarkdownConverter() {
  const tool = getToolById('markdown-converter')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'md-to-html' | 'html-to-md'>('md-to-html');
  const [copied, setCopied] = useState(false);

  const result = mode === 'md-to-html'
    ? marked(input) as string
    : turndown.turndown(input);

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={input.length > 0}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'md-to-html' ? 'default' : 'outline'} onClick={() => setMode('md-to-html')}>Markdown → HTML</Button>
          <Button size="sm" variant={mode === 'html-to-md' ? 'default' : 'outline'} onClick={() => setMode('html-to-md')}>HTML → Markdown</Button>
        </div>
        <Textarea
          placeholder={mode === 'md-to-html' ? 'Paste Markdown here...' : 'Paste HTML here...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
        />
        {input && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{mode === 'md-to-html' ? 'HTML Output' : 'Markdown Output'}</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="rounded-xl border bg-card p-4">
              {mode === 'md-to-html' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result }} />
              ) : (
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{result}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
