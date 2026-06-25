/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { FileSearch, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface DuplicateMatch {
  sentence: string;
  matchWith: string;
  similarity: number;
}

export default function DuplicateSentenceFinder() {
  const tool = getToolById('duplicate-sentences') || {
    id: 'duplicate-sentences',
    name: 'Duplicate Sentence Finder',
    description: 'Find and highlight duplicate or highly similar sentences in your text using customized similarity thresholds.',
    metaTitle: 'Duplicate Sentence & Similarity Finder | ToolNest',
    metaDescription: 'Find repeating thoughts. Paste articles to scan for redundant sentences with Jaccard token overlap sliders.',
    category: 'text',
  };

  const [text, setText] = useState('');
  const [threshold, setThreshold] = useState<number>(0.8); // 80% default threshold

  // Split text into sentences and compute duplicates
  const { sentences, duplicatesMap, matchesList } = useMemo(() => {
    if (!text.trim()) {
      return { sentences: [], duplicatesMap: new Set<number>(), matchesList: [] };
    }

    // Split text by sentence terminals, keeping spacing
    // Regexp matches period, exclamation, question mark followed by whitespace
    const sentenceList = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const dupSet = new Set<number>();
    const dMatches: DuplicateMatch[] = [];

    // Helper: Jaccard word token similarity
    const getTokens = (str: string) => {
      return new Set(
        str
          .toLowerCase()
          .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
          .split(/\s+/)
          .filter(Boolean)
      );
    };

    const getSimilarity = (s1: string, s2: string) => {
      const t1 = getTokens(s1);
      const t2 = getTokens(s2);
      if (t1.size === 0 || t2.size === 0) return 0;

      const intersection = new Set([...t1].filter((x) => t2.has(x)));
      const union = new Set([...t1, ...t2]);
      return intersection.size / union.size;
    };

    // Compare pairs
    for (let i = 0; i < sentenceList.length; i++) {
      for (let j = i + 1; j < sentenceList.length; j++) {
        // Skip comparing if strings are identical at other indices
        const similarity = getSimilarity(sentenceList[i], sentenceList[j]);
        if (similarity >= threshold) {
          dupSet.add(i);
          dupSet.add(j);
          dMatches.push({
            sentence: sentenceList[i],
            matchWith: sentenceList[j],
            similarity: Math.round(similarity * 100),
          });
        }
      }
    }

    return {
      sentences: sentenceList,
      duplicatesMap: dupSet,
      matchesList: dMatches,
    };
  }, [text, threshold]);

  return (
    <ToolLayout tool={tool as any} resultVisible={text.length > 0}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
          {/* Inputs & Settings Panel */}
          <div className="lg:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm">
            <h3 className="font-semibold text-base mb-2">Configurations</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Similarity Sensitivity</span>
                <span>{Math.round(threshold * 100)}%</span>
              </div>
              <Slider
                min={0.5}
                max={1.0}
                step={0.05}
                value={[threshold]}
                onValueChange={(val) => setThreshold(val[0])}
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                100% checks for exact word matching. Lower percentages (e.g. 70-80%) catch rephrased sentences with high word overlaps.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Original Text Input</label>
              <Textarea
                placeholder="Paste your paragraphs here to check for duplicate or redundant sentences..."
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {text.trim() ? (
              <div className="space-y-6">
                {/* Visual highlighted rendering */}
                <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Highlighted Document View
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/20 border min-h-[150px] leading-relaxed text-xs">
                    {sentences.map((sent, idx) => {
                      const isDup = duplicatesMap.has(idx);
                      return (
                        <span
                          key={idx}
                          className={`mr-1.5 transition-colors ${
                            isDup
                              ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 px-1 rounded font-medium'
                              : ''
                          }`}
                        >
                          {sent}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    * Sentences marked in <span className="text-yellow-600 font-semibold">yellow</span> are flagged as redundant/similar.
                  </p>
                </div>

                {/* List of matched pairs */}
                {matchesList.length > 0 ? (
                  <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileSearch className="w-4 h-4 text-amber-500" /> Similar Pairs Detected
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {matchesList.map((match, idx) => (
                        <div key={idx} className="p-3 border rounded-xl bg-muted/20 space-y-2 text-xs">
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground">
                            <span>Pair #{idx + 1}</span>
                            <span className="text-amber-500 font-extrabold">{match.similarity}% Similarity</span>
                          </div>
                          <div className="space-y-1 pl-2 border-l-2 border-amber-300">
                            <p className="font-medium text-foreground">"{match.sentence}"</p>
                            <p className="text-muted-foreground">matches</p>
                            <p className="font-medium text-foreground">"{match.matchWith}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-card p-5 text-center text-xs text-muted-foreground font-medium py-8">
                    No duplicate sentences found at the current similarity threshold.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
                <FileSearch className="w-12 h-12 mb-3 text-muted-foreground/60 animate-pulse" />
                <h3 className="font-semibold text-base mb-1">Verify Document Duplications</h3>
                <p className="text-sm max-w-md">
                  Paste your text in the side panel to examine repeating sentences or rephrased statements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Explain info */}
        <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Jaccard Index Word Similarity</p>
            <p>
              This scanner uses token intersection algorithms. It strips punctuation, converts characters to lowercase, and segments sentences into distinct unique word sets. Similarity is computed by dividing the number of overlapping words (intersection) by the total number of unique words (union) present in both sentences. This effectively catches sentence repetitions even if word orders or spacing change.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
