import { useState, useMemo } from 'react';
import { Hash, BookOpen, Type, AlignLeft, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function CharCounter() {
  const tool = getToolById('char-counter')!;
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length || 1 : 0;
    const lines = text.split('\n').length;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    const longestWord = words ? trimmed.split(/\s+/).reduce((a, b) => a.length > b.length ? a : b, '') : '';
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    const digitCount = (text.match(/[0-9]/g) || []).length;
    const spaceCount = (text.match(/\s/g) || []).length;
    const punctuationCount = (text.match(/[^\w\s]/g) || []).length;
    return { words, chars, charsNoSpace, sentences, paragraphs, lines, readingTime, speakingTime, longestWord, letterCount, digitCount, spaceCount, punctuationCount };
  }, [text]);

  return (
    <ToolLayout tool={tool} resultVisible={text.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Type or paste text..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[150px] resize-y" />
        {text && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-card p-4 text-center">
                <Type className="w-6 h-6 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{stats.words}</p><p className="text-xs text-muted-foreground">Words</p></div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <Hash className="w-6 h-6 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{stats.chars}</p><p className="text-xs text-muted-foreground">Characters</p></div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{stats.sentences}</p><p className="text-xs text-muted-foreground">Sentences</p></div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <AlignLeft className="w-6 h-6 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{stats.lines}</p><p className="text-xs text-muted-foreground">Lines</p></div>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h3 className="font-semibold">Detailed Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Chars (no spaces)</span><p className="font-medium">{stats.charsNoSpace}</p></div>
                <div><span className="text-muted-foreground">Paragraphs</span><p className="font-medium">{stats.paragraphs}</p></div>
                <div><span className="text-muted-foreground">Letters</span><p className="font-medium">{stats.letterCount}</p></div>
                <div><span className="text-muted-foreground">Digits</span><p className="font-medium">{stats.digitCount}</p></div>
                <div><span className="text-muted-foreground">Spaces</span><p className="font-medium">{stats.spaceCount}</p></div>
                <div><span className="text-muted-foreground">Punctuation</span><p className="font-medium">{stats.punctuationCount}</p></div>
                <div><span className="text-muted-foreground">Longest Word</span><p className="font-medium">{stats.longestWord}</p></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><div><span className="text-muted-foreground">Reading</span><p className="font-medium">{stats.readingTime} min</p></div></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><div><span className="text-muted-foreground">Speaking</span><p className="font-medium">{stats.speakingTime} min</p></div></div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
