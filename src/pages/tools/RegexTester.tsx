import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function RegexTester() {
  const tool = getToolById('regex-tester')!;
  const { toast } = useToast();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gm');
  const [testText, setTestText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [copied, setCopied] = useState(false);

  const { matches, error, replaceResult } = useMemo(() => {
    if (!pattern.trim() || !testText) return { matches: [], error: null, replaceResult: '' };
    try {
      const regex = new RegExp(pattern, flags);
      const ms: { full: string; groups: string[]; index: number }[] = [];
      let m: RegExpExecArray | null;
      while ((m = regex.exec(testText)) !== null) {
        const groups: string[] = [];
        for (let i = 1; i < m.length; i++) groups.push(m[i] ?? '');
        ms.push({ full: m[0], groups, index: m.index });
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }
      let replaceResult = '';
      if (replaceText !== undefined) {
        replaceResult = testText.replace(regex, replaceText);
      }
      return { matches: ms, error: null, replaceResult };
    } catch (e) {
      return { matches: [], error: (e as Error).message, replaceResult: '' };
    }
  }, [pattern, flags, testText, replaceText]);

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(matches, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={testText.length > 0}>
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground block mb-1">Regular Expression</label>
            <Input placeholder="/pattern/flags" value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" />
          </div>
          <div className="w-24">
            <label className="text-sm text-muted-foreground block mb-1">Flags</label>
            <Input placeholder="gm" value={flags} onChange={(e) => setFlags(e.target.value)} className="font-mono" />
          </div>
        </div>
        <Textarea placeholder="Test text..." value={testText} onChange={(e) => setTestText(e.target.value)} className="min-h-[150px] resize-y font-mono text-sm" />
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Replace with (optional)</label>
          <Input placeholder="$1 - replacement string" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className="font-mono" />
        </div>
        {error && <div className="rounded-xl border border-destructive bg-destructive/5 p-3 text-destructive text-sm">{error}</div>}
        {matches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {matches.map((m, i) => (
                <div key={i} className="rounded-lg border bg-card p-2 text-sm">
                  <span className="font-medium">#{i + 1}</span> @ index {m.index}: <code className="bg-muted px-1 rounded">{m.full}</code>
                  {m.groups.filter(g => g).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">Groups: {m.groups.filter(g => g).join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
            {replaceText && (
              <div>
                <span className="font-medium">Replacement Result</span>
                <div className="rounded-xl border bg-card p-3 mt-1">
                  <pre className="text-sm whitespace-pre-wrap max-h-48 font-mono">{replaceResult}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
