import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const SUFFIXES = ['tips', 'guide', 'howto', 'ideas', 'inspo', 'lifehack', 'goals', 'vibes', 'daily', 'essentials'];

export default function HashtagGenerator() {
  const tool = getToolById('hashtag-generator')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const unique = new Set<string>();
    words.forEach(w => unique.add(`#${w}`));
    words.forEach(w => unique.add(`#${w}${SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]}`));
    setTags(Array.from(unique).slice(0, 30));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(tags.join(' '));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Hashtags copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={tags.length > 0}>
      <div className="space-y-4">
        <Input placeholder="Type keywords or paste text..." value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={generate}>Generate Hashtags</Button>
        {tags.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{tags.length} hashtags</span>
              <Button size="sm" variant="ghost" onClick={copyAll}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => <span key={i} className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">{t}</span>)}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
