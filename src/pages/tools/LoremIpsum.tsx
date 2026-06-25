import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

function seededRandom() {
  let seed = Date.now();
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function LoremIpsum() {
  const tool = getToolById('lorem-ipsum')!;
  const { toast } = useToast();
  const [paragraphs, setParagraphs] = useState(3);
  const [words, setWords] = useState(50);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const rand = seededRandom();
    const result: string[] = [];
    for (let p = 0; p < paragraphs; p++) {
      const sentenceCount = Math.max(3, Math.floor(words / 10));
      const sentences: string[] = [];
      for (let s = 0; s < sentenceCount; s++) {
        const wordCount = Math.floor(rand() * 8) + 5;
        const sentWords: string[] = [];
        for (let w = 0; w < wordCount; w++) {
          sentWords.push(LOREM_WORDS[Math.floor(rand() * LOREM_WORDS.length)]);
        }
        sentences.push(sentWords.join(' ') + '.');
      }
      const para = sentences.join(' ');
      result.push(includeHtml ? `<p>${para.charAt(0).toUpperCase() + para.slice(1)}</p>` : para.charAt(0).toUpperCase() + para.slice(1));
    }
    setOutput(result.join(includeHtml ? '' : '\n\n'));
  }, [paragraphs, words, includeHtml]);

  const copyText = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={output.length > 0}>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div><label className="text-sm text-muted-foreground block">Paragraphs</label><Input type="number" min={1} max={50} value={paragraphs} onChange={(e) => setParagraphs(Math.max(1, +e.target.value))} /></div>
          <div><label className="text-sm text-muted-foreground block">Words per para</label><Input type="number" min={10} max={500} value={words} onChange={(e) => setWords(Math.max(10, +e.target.value))} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeHtml} onChange={(e) => setIncludeHtml(e.target.checked)} className="rounded border-muted-foreground" />
          Include HTML tags
        </label>
        <Button onClick={generate}>Generate</Button>
        {output && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Generated Text</span>
              <Button size="sm" variant="ghost" onClick={copyText}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <p className="text-sm whitespace-pre-wrap">{output}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
