import { useMemo, useState } from 'react';
import { Hash, Clock, BookOpen, Type, AlignLeft, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function WordCounter() {
  const tool = getToolById('word-counter')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0,
        avgWordLength: 0,
        longestWord: '',
        wordFrequency: [] as [string, number][],
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean).length || 1;
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 WPM
    const speakingTime = Math.ceil(wordCount / 130); // 130 WPM

    const avgWordLength = charactersNoSpaces / wordCount;
    const longestWord = words.reduce((a, b) => a.length > b.length ? a : b, '');

    // Word frequency
    const freq: Record<string, number> = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length > 2) freq[clean] = (freq[clean] || 0) + 1;
    });
    const wordFrequency = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return {
      words: wordCount,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      avgWordLength,
      longestWord,
      wordFrequency,
    };
  }, [text]);

  const copyStats = () => {
    const summary = `Words: ${stats.words}\nCharacters: ${stats.characters}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading Time: ${stats.readingTime} min`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Stats copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <Textarea
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] resize-y"
        />

        {/* Main Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <Type className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.words}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <Hash className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.characters}</p>
            <p className="text-xs text-muted-foreground">Characters</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.sentences}</p>
            <p className="text-xs text-muted-foreground">Sentences</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <AlignLeft className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.paragraphs}</p>
            <p className="text-xs text-muted-foreground">Paragraphs</p>
          </div>
        </div>

        {/* Detailed Stats */}
        {text.trim() && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Detailed Statistics</h3>
              <Button size="sm" variant="ghost" onClick={copyStats}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Characters (no spaces)</p>
                <p className="font-medium">{stats.charactersNoSpaces}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Word Length</p>
                <p className="font-medium">{stats.avgWordLength.toFixed(1)} chars</p>
              </div>
              <div>
                <p className="text-muted-foreground">Longest Word</p>
                <p className="font-medium">{stats.longestWord}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Reading Time</p>
                  <p className="font-medium">{stats.readingTime} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Speaking Time</p>
                  <p className="font-medium">{stats.speakingTime} min</p>
                </div>
              </div>
            </div>

            {/* Word Frequency */}
            {stats.wordFrequency.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Most Used Words</h4>
                <div className="space-y-1">
                  {stats.wordFrequency.map(([word, count]) => (
                    <div key={word} className="flex items-center gap-2">
                      <span className="text-sm w-24 truncate">{word}</span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${(count / stats.wordFrequency[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
