import { useMemo, useState } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function DiffChecker() {
  const tool = getToolById('diff-checker')!;
  const { toast } = useToast();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    if (!text1 && !text2) return [];

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    const result: { type: 'same' | 'removed' | 'added' | 'modified'; line1?: string; line2?: string; lineNum: number }[] = [];

    for (let i = 0; i < maxLines; i++) {
      const l1 = lines1[i] || '';
      const l2 = lines2[i] || '';

      if (l1 === l2) {
        result.push({ type: 'same', line1: l1, line2: l2, lineNum: i + 1 });
      } else if (!l2 && l1) {
        result.push({ type: 'removed', line1: l1, lineNum: i + 1 });
      } else if (!l1 && l2) {
        result.push({ type: 'added', line2: l2, lineNum: i + 1 });
      } else {
        result.push({ type: 'modified', line1: l1, line2: l2, lineNum: i + 1 });
      }
    }

    return result;
  }, [text1, text2]);

  const stats = useMemo(() => {
    const same = diff.filter(d => d.type === 'same').length;
    const changed = diff.filter(d => d.type !== 'same').length;
    return { same, changed, total: diff.length };
  }, [diff]);

  const copyDiff = () => {
    const summary = diff.map(d => {
      if (d.type === 'same') return `  ${d.line1}`;
      if (d.type === 'removed') return `- ${d.line1}`;
      if (d.type === 'added') return `+ ${d.line2}`;
      return `- ${d.line1}\n+ ${d.line2}`;
    }).join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Diff copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Original Text</label>
            <Textarea
              placeholder="Paste original text..."
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[200px] resize-y"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Modified Text</label>
            <Textarea
              placeholder="Paste modified text..."
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[200px] resize-y"
            />
          </div>
        </div>

        {/* Stats */}
        {(text1 || text2) && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <GitCompare className="w-4 h-4 inline mr-1" />
              {stats.total} lines
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">{stats.same} same</span>
            <span className="text-red-600 dark:text-red-400">{stats.changed} changed</span>
          </div>
        )}

        {/* Diff View */}
        {(text1 || text2) && (
          <div className="rounded-xl border bg-card">
            <div className="p-3 border-b bg-muted/50 rounded-t-xl flex items-center justify-between">
              <span className="font-medium text-sm">Difference</span>
              <Button size="sm" variant="ghost" onClick={copyDiff}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {diff.map((d, i) => {
                if (d.type === 'same') {
                  return (
                    <div key={i} className="flex px-3 py-1 text-sm">
                      <span className="text-muted-foreground w-8 flex-shrink-0">{d.lineNum}</span>
                      <span className="text-muted-foreground">{d.line1}</span>
                    </div>
                  );
                }
                if (d.type === 'removed') {
                  return (
                    <div key={i} className="flex px-3 py-1 text-sm bg-red-50 dark:bg-red-900/10">
                      <span className="text-red-500 w-8 flex-shrink-0">{d.lineNum}-</span>
                      <span className="text-red-700 dark:text-red-400 line-through">{d.line1}</span>
                    </div>
                  );
                }
                if (d.type === 'added') {
                  return (
                    <div key={i} className="flex px-3 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/10">
                      <span className="text-emerald-500 w-8 flex-shrink-0">{d.lineNum}+</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{d.line2}</span>
                    </div>
                  );
                }
                return (
                  <div key={i} className="divide-y">
                    <div className="flex px-3 py-1 text-sm bg-red-50 dark:bg-red-900/10">
                      <span className="text-red-500 w-8 flex-shrink-0">{d.lineNum}-</span>
                      <span className="text-red-700 dark:text-red-400 line-through">{d.line1}</span>
                    </div>
                    <div className="flex px-3 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/10">
                      <span className="text-emerald-500 w-8 flex-shrink-0">{d.lineNum}+</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{d.line2}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
