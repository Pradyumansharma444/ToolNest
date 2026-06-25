import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { BarChart } from 'lucide-react';

export default function ChineseCharCounter() {
  const tool = getToolById('chinese-char-counter')!;

  const [input, setInput] = useState('');
  const [stats, setStats] = useState({
    totalChars: 0,
    chineseChars: 0,
    punctuation: 0,
    alphanumeric: 0,
    readingTime: 0,
  });

  const handleCount = () => {
    const text = input;
    if (!text) return;

    const totalChars = text.length;
    let chineseChars = 0;
    let punctuation = 0;
    let alphanumeric = 0;

    // Regex lists
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const punctRegex = /[\u3000-\u303f\u0020-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007e，。！？、；：]/;
    const alnumRegex = /[a-zA-Z0-9]/;

    for (const char of text) {
      if (chineseRegex.test(char)) {
        chineseChars++;
      } else if (alnumRegex.test(char)) {
        alphanumeric++;
      } else if (punctRegex.test(char)) {
        punctuation++;
      }
    }

    // Estimate reading duration: Chinese reading speed is roughly 250 characters/minute
    const readingTime = Math.ceil(chineseChars / 250);

    setStats({
      totalChars,
      chineseChars,
      punctuation,
      alphanumeric,
      readingTime,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={stats.totalChars > 0}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">CJK Text Input</label>
          <Textarea
            placeholder="Paste Chinese / Japanese / Korean text here..."
            className="min-h-[180px] p-4 text-base rounded-2xl resize-y"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {stats.totalChars > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-muted/40 p-4 rounded-xl text-center border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Total Chars</div>
              <div className="text-2xl font-black">{stats.totalChars}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl text-center border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Chinese Chars</div>
              <div className="text-2xl font-black text-primary">{stats.chineseChars}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl text-center border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Punctuation</div>
              <div className="text-2xl font-black">{stats.punctuation}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl text-center border">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Alphanumeric</div>
              <div className="text-2xl font-black">{stats.alphanumeric}</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-xl text-center border col-span-2 sm:col-span-1">
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Reading Time</div>
              <div className="text-2xl font-black text-emerald-500">{stats.readingTime} min</div>
            </div>
          </div>
        )}

        <Button onClick={handleCount} disabled={!input.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <BarChart className="w-5 h-5" /> Calculate Character Breakdown
        </Button>
      </div>
    </ToolLayout>
  );
}
