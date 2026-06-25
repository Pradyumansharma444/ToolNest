import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function TextToSlug() {
  const tool = getToolById('text-to-slug')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    let slug = input.trim();
    slug = slug.replace(/[^\w\s-]/g, '');
    slug = slug.replace(/\s+/g, separator);
    slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);
    slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
    return lowercase ? slug.toLowerCase() : slug;
  }, [input, separator, lowercase]);

  const copySlug = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={slug.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter text to convert to slug..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[100px] resize-y" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <label className="text-sm text-muted-foreground">Separator:</label>
            <Input value={separator} onChange={(e) => setSeparator(e.target.value || '-')} className="w-16 font-mono" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded border-muted-foreground" />Lowercase</label>
        </div>
        {slug && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Slug</span>
              <Button size="sm" variant="ghost" onClick={copySlug}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm font-mono mt-1 break-all bg-muted p-2 rounded-lg">{slug}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
