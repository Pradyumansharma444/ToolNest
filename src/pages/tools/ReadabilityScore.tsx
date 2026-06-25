import { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function syllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  const vowels = word.match(/[aeiouy]+/g);
  return vowels ? vowels.length : 1;
}

function flesch(totalWords: number, totalSentences: number, totalSyllables: number): number {
  return 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
}

function gradeLevel(f: number): string {
  if (f >= 90) return '5th grade (Very easy)';
  if (f >= 80) return '6th grade (Easy)';
  if (f >= 70) return '7th grade (Fairly easy)';
  if (f >= 60) return '8th-9th grade (Standard)';
  if (f >= 50) return '10th-12th grade (Fairly hard)';
  if (f >= 30) return 'College (Hard)';
  return 'College graduate (Very hard)';
}

export default function ReadabilityScore() {
  const tool = getToolById('readability-score')!;
  const [text, setText] = useState('');

  const words = text.trim() ? text.split(/\s+/).filter(w => w.length > 0) : [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = words.length;
  const totalSentences = sentences.length || 1;
  const totalSyllables = words.reduce((sum, w) => sum + syllables(w), 0);
  const score = totalWords > 0 ? flesch(totalWords, totalSentences, totalSyllables) : 0;

  return (
    <ToolLayout tool={tool} resultVisible={totalWords > 0}>
      <div className="space-y-4">
        <textarea className="w-full h-40 rounded-xl border bg-background p-3 text-sm" placeholder="Paste your text (min 100 words suggested)..." value={text} onChange={(e) => setText(e.target.value)} />
        {totalWords > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold">{score.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Flesch Reading Ease</p>
              <p className="text-sm font-medium mt-1">{gradeLevel(score)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="font-bold">{totalWords}</p><p className="text-xs text-muted-foreground">Words</p></div>
              <div><p className="font-bold">{totalSentences}</p><p className="text-xs text-muted-foreground">Sentences</p></div>
              <div><p className="font-bold">{totalSyllables}</p><p className="text-xs text-muted-foreground">Syllables</p></div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
