import { useState, useMemo } from 'react';
import { Copy, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface Rule {
  id: number;
  userAgent: string;
  allow: boolean;
  path: string;
}

let nextId = 1;

export default function RobotsTxtGenerator() {
  const tool = getToolById('robots-txt-generator')!;
  const { toast } = useToast();
  const [sitemap, setSitemap] = useState('');
  const [crawlDelay, setCrawlDelay] = useState('');
  const [rules, setRules] = useState<Rule[]>([{ id: nextId++, userAgent: '*', allow: true, path: '/' }]);
  const [copied, setCopied] = useState(false);

  const addRule = () => setRules([...rules, { id: nextId++, userAgent: '*', allow: true, path: '' }]);
  const removeRule = (id: number) => setRules(rules.filter(r => r.id !== id));
  const updateRule = (id: number, field: keyof Rule, value: string | boolean) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const generated = useMemo(() => {
    const lines: string[] = [];
    const grouped: Record<string, Rule[]> = {};
    rules.forEach(r => {
      if (!grouped[r.userAgent]) grouped[r.userAgent] = [];
      grouped[r.userAgent].push(r);
    });
    Object.entries(grouped).forEach(([ua, rs]) => {
      lines.push(`User-agent: ${ua}`);
      if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
      rs.forEach(r => {
        if (r.path) lines.push(`${r.allow ? 'Allow' : 'Disallow'}: ${r.path}`);
      });
      lines.push('');
    });
    if (sitemap) lines.push(`Sitemap: ${sitemap}`);
    return lines.join('\n');
  }, [rules, sitemap, crawlDelay]);

  const copyResult = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Sitemap URL</label>
            <Input value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Crawl-delay (seconds)</label>
            <Input value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} placeholder="10" type="number" min="0" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rules</span>
            <Button size="sm" variant="outline" onClick={addRule}><Plus className="w-3 h-3 mr-1" />Add Rule</Button>
          </div>
          {rules.map(r => (
            <div key={r.id} className="flex flex-wrap gap-2 items-center rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="text-xs text-muted-foreground">User-agent:</span>
                <Input value={r.userAgent} onChange={e => updateRule(r.id, 'userAgent', e.target.value)} className="h-8 flex-1" placeholder="*" />
              </div>
              <Select value={r.allow ? 'allow' : 'disallow'} onValueChange={v => updateRule(r.id, 'allow', v === 'allow')}>
                <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="disallow">Disallow</SelectItem>
                </SelectContent>
              </Select>
              <Input value={r.path} onChange={e => updateRule(r.id, 'path', e.target.value)} placeholder="/path" className="flex-1 h-8 min-w-[120px]" />
              <Button size="sm" variant="ghost" onClick={() => removeRule(r.id)}><X className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated robots.txt</span>
            <Button size="sm" variant="ghost" onClick={copyResult}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg">{generated}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
