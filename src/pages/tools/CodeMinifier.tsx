import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function minifyJS(code: string): string {
  return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}();,:])\s*/g, '$1').trim();
}

function minifyCSS(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1').replace(/;\}/g, '}').trim();
}

function minifyHTML(code: string): string {
  return code.replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

export default function CodeMinifier() {
  const tool = getToolById('code-minifier')!;
  const { toast } = useToast();
  const [lang, setLang] = useState<'js' | 'css' | 'html'>('js');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      switch (lang) {
        case 'js': return minifyJS(input);
        case 'css': return minifyCSS(input);
        case 'html': return minifyHTML(input);
      }
    } catch { return 'Minification failed'; }
  }, [input, lang]);

  const savings = input.length > 0 ? ((1 - result.length / input.length) * 100).toFixed(1) : '0';

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
          {(['js', 'css', 'html'] as const).map(l => (
            <Button key={l} size="sm" variant={lang === l ? 'default' : 'outline'} onClick={() => setLang(l)}>{l.toUpperCase()}</Button>
          ))}
        </div>
        <Textarea placeholder={`Paste ${lang.toUpperCase()} code here...`} value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Minified ({input.length} → {result.length} bytes, -{savings}%)</span>
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
