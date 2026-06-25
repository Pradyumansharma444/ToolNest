import { useState, useMemo } from 'react';
import { SpellCheck as SpellCheckIcon, BookOpen, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

// Common English words dictionary (simplified)
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he',
  'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
  'most', 'us', 'is', 'was', 'are', 'were', 'been', 'has', 'had', 'did', 'does', 'doing', 'done', 'being',
  'am', 'shall', 'should', 'may', 'might', 'must', 'need', 'dare', 'used', 'ought', 'used', 'having',
  'hello', 'world', 'text', 'tool', 'free', 'online', 'browser', 'privacy', 'secure', 'fast', 'easy',
  'simple', 'quick', 'instant', 'powerful', 'useful', 'helpful', 'amazing', 'great', 'nice', 'love',
  'thanks', 'please', 'welcome', 'sorry', 'yes', 'no', 'ok', 'okay', 'sure', 'maybe', 'perhaps', 'probably',
  'definitely', 'absolutely', 'exactly', 'precisely', 'correct', 'right', 'wrong', 'false', 'true',
  'here', 'there', 'where', 'everywhere', 'somewhere', 'nowhere', 'anywhere', 'everyone', 'someone',
  'anyone', 'noone', 'nobody', 'everybody', 'somebody', 'anybody', 'everything', 'something',
  'anything', 'nothing', 'always', 'never', 'sometimes', 'often', 'usually', 'rarely', 'seldom',
  'frequently', 'occasionally', 'regularly', 'daily', 'weekly', 'monthly', 'yearly',
]);

export default function SpellCheck() {
  const tool = getToolById('spell-check')!;
  const [text, setText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  const words = useMemo(() => {
    if (!text.trim()) return [];
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, idx) => {
      const clean = token.toLowerCase().replace(/[^a-z]/g, '');
      return {
        token,
        isWord: /^[a-zA-Z]+$/.test(token),
        isCorrect: clean.length < 2 || COMMON_WORDS.has(clean),
        index: idx,
      };
    });
  }, [text]);

  const stats = useMemo(() => {
    const allWords = words.filter(w => w.isWord);
    const incorrect = allWords.filter(w => !w.isCorrect);
    return {
      total: allWords.length,
      incorrect: incorrect.length,
      correct: allWords.length - incorrect.length,
    };
  }, [words]);

  const getSuggestions = (word: string): string[] => {
    // Simple suggestion: find words in dictionary with small edit distance
    const clean = word.toLowerCase();
    const suggestions: string[] = [];

    for (const dictWord of COMMON_WORDS) {
      if (Math.abs(dictWord.length - clean.length) <= 2) {
        const distance = levenshtein(clean, dictWord);
        if (distance <= 2) {
          suggestions.push(dictWord);
        }
      }
      if (suggestions.length >= 5) break;
    }
    return suggestions;
  };

  const levenshtein = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  };

  const replaceWord = (oldWord: string, newWord: string, index: number) => {
    const tokens = text.split(/(\s+)/);
    tokens[index] = newWord;
    setText(tokens.join(''));
    setShowSuggestions(null);
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <strong>Note:</strong> This tool uses a basic word list. It may not catch all errors or know all words.
          </div>
        </div>

        <Textarea
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] resize-y"
        />

        {/* Stats */}
        {text && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Words</p>
              <p className="font-semibold text-lg">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Correct</p>
              <p className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">{stats.correct}</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
              <p className="text-xs text-red-600 dark:text-red-400">Possible Issues</p>
              <p className="font-semibold text-lg text-red-700 dark:text-red-300">{stats.incorrect}</p>
            </div>
          </div>
        )}

        {/* Highlighted Text */}
        {text && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <SpellCheckIcon className="w-4 h-4" /> Spell Check Results
            </h3>
            <div className="text-sm leading-relaxed flex flex-wrap gap-0.5">
              {words.map((w, i) => {
                if (!w.isWord) return <span key={i}>{w.token}</span>;
                if (w.isCorrect) return <span key={i} className="text-emerald-600 dark:text-emerald-400">{w.token}</span>;
                return (
                  <span key={i} className="relative">
                    <button
                      className="underline decoration-red-500 decoration-wavy text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-0.5"
                      onClick={() => setShowSuggestions(showSuggestions === `${w.token}-${i}` ? null : `${w.token}-${i}`)}
                    >
                      {w.token}
                    </button>
                    {showSuggestions === `${w.token}-${i}` && (
                      <div className="absolute z-10 left-0 top-full mt-1 bg-popover border rounded-lg shadow-lg p-2 min-w-[150px]">
                        <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                        {getSuggestions(w.token).map(s => (
                          <button
                            key={s}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                            onClick={() => replaceWord(w.token, s, w.index)}
                          >
                            {s}
                          </button>
                        ))}
                        {getSuggestions(w.token).length === 0 && (
                          <p className="text-xs text-muted-foreground">No suggestions</p>
                        )}
                      </div>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Grammar stats */}
        {text && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Grammar Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Sentences</p>
                <p className="font-semibold">{text.split(/[.!?]+/).filter(Boolean).length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Characters</p>
                <p className="font-semibold">{text.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Words</p>
                <p className="font-semibold">{text.trim().split(/\s+/).filter(Boolean).length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Word Length</p>
                <p className="font-semibold">
                  {text.trim()
                    ? (text.replace(/\s/g, '').length / text.trim().split(/\s+/).filter(Boolean).length).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
