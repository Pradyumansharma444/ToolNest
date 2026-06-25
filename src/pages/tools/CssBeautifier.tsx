import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function beautifyCSS(code: string): string {
  const cleaned = code.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  let result = '';
  let indent = 0;
  let i = 0;
  while (i < cleaned.length) {
    const c = cleaned[i];
    if (c === '{') { result += ' {\n'; indent++; i++; continue; }
    if (c === '}') { indent = Math.max(0, indent - 1); result += '\n' + '  '.repeat(indent) + '}\n'; i++; continue; }
    if (c === ';') { result += ';\n' + '  '.repeat(indent); i++; continue; }
    if (c === '\n' || c === '\r') { i++; continue; }
    if (/\s/.test(c) && result.endsWith(' ')) { i++; continue; }
    result += c;
    i++;
  }
  return result.replace(/\n{2,}/g, '\n').trim();
}

export default function CssBeautifier() {
  const tool = getToolById('css-beautifier')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try { return beautifyCSS(input); }
    catch { return 'Formatting failed'; }
  }, [input]);

  const isError = result === 'Formatting failed';

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
        <Textarea placeholder="Paste CSS, SCSS, or Less here..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Formatted CSS</span>
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
