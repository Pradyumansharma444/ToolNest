import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Match {
  sentence1: string;
  sentence2: string;
  similarity: number;
}

function normalize(str: string) { return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(); }

function splitSentences(text: string): string[] {
  return text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 5);
}

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const wordsB = normalize(b).split(/\s+/).filter(Boolean);
  if (wordsA.size === 0) return 0;
  let matchCount = 0;
  for (const w of wordsB) { if (wordsA.has(w)) matchCount++; }
  return matchCount / wordsA.size;
}

function getNGrams(text: string, n: number): Set<string> {
  const words = normalize(text).split(/\s+/).filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    grams.add(words.slice(i, i + n).join(' '));
  }
  return grams;
}

function ngramSimilarity(a: string, b: string, n: number): number {
  const gramsA = getNGrams(a, n);
  const gramsB = getNGrams(b, n);
  if (gramsA.size === 0) return 0;
  let overlap = 0;
  for (const g of gramsA) { if (gramsB.has(g)) overlap++; }
  return overlap / gramsA.size;
}

export default function PlagiarismChecker() {
  const tool = getToolById('plagiarism-checker')!;
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [threshold, setThreshold] = useState(0.5);

  const matches = useMemo((): Match[] => {
    if (!text1.trim() || !text2.trim()) return [];
    const s1 = splitSentences(text1);
    const s2 = splitSentences(text2);
    const results: Match[] = [];
    for (const a of s1) {
      for (const b of s2) {
        const wordSim = wordOverlap(a, b);
        const ngramSim = ngramSimilarity(a, b, 3);
        const similarity = Math.max(wordSim, ngramSim);
        if (similarity >= threshold) {
          results.push({ sentence1: a, sentence2: b, similarity: Math.round(similarity * 100) });
        }
      }
    }
    results.sort((x, y) => y.similarity - x.similarity);
    return results;
  }, [text1, text2, threshold]);

  const overallScore = useMemo(() => {
    if (!text1.trim() || matches.length === 0) return 0;
    const uniqueSentences = new Set(matches.map(m => m.sentence1));
    const total = splitSentences(text1).length;
    return Math.round((uniqueSentences.size / total) * 100);
  }, [text1, matches]);

  const highlightText = (text: string, source: 1 | 2) => {
    const sentences = splitSentences(text);
    const matchSentences = new Set(matches.map(m => source === 1 ? m.sentence1 : m.sentence2));
    return sentences.map((s, i) => {
      const isMatch = matchSentences.has(s);
      return (
        <span key={i} className={isMatch ? 'bg-red-200 dark:bg-red-900/50 rounded px-0.5' : ''}>
          {i > 0 && '. '}{s}
        </span>
      );
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!text1 && !!text2}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Text</label>
            <Textarea value={text1} onChange={e => setText1(e.target.value)} placeholder="Paste the original text here..." rows={8} className="font-mono text-sm" />
            {text1 && <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap bg-muted/30">{highlightText(text1, 1)}</div>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Text to Check</label>
            <Textarea value={text2} onChange={e => setText2(e.target.value)} placeholder="Paste the text to compare..." rows={8} className="font-mono text-sm" />
            {text2 && <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap bg-muted/30">{highlightText(text2, 2)}</div>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Similarity Threshold: {(threshold * 100).toFixed(0)}%</label>
          <input type="range" min={0.1} max={0.9} step={0.05} value={threshold} onChange={e => setThreshold(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>10%</span><span>90%</span></div>
        </div>

        {matches.length > 0 && (
          <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="font-semibold">Potential Matches Found</p>
              <Badge variant="outline" className="ml-auto">{overallScore}% similarity</Badge>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {matches.map((m, i) => (
                <div key={i} className="rounded-lg border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">{m.similarity}%</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs mb-0.5">Original:</p>
                  <p className="mb-2">{m.sentence1}</p>
                  <p className="text-muted-foreground text-xs mb-0.5">Checked:</p>
                  <p>{m.sentence2}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {text1 && text2 && matches.length === 0 && (
          <div className="rounded-lg border-2 border-green-300 bg-green-50 dark:bg-green-950 p-4 text-center">
            <p className="text-green-700 dark:text-green-300 font-medium">No significant matches found above {(threshold * 100).toFixed(0)}% threshold.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
