import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function CharFrequency() {
  const tool = getToolById('char-frequency')!;
  const [text, setText] = useState('');

  const letters = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const freq: Record<string, number> = {};
  for (const ch of letters) freq[ch] = (freq[ch] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] || 1;

  return (
    <ToolLayout tool={tool} resultVisible={sorted.length > 0}>
      <div className="space-y-4">
        <textarea className="w-full h-32 rounded-xl border bg-background p-3 text-sm" placeholder="Paste text..." value={text} onChange={(e) => setText(e.target.value)} />
        {sorted.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-1">
            {sorted.map(([ch, count]) => (
              <div key={ch} className="flex items-center gap-2">
                <span className="w-6 text-center font-mono text-sm font-bold">{ch}</span>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
