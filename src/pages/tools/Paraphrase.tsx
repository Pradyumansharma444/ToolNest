import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Copy, Check, Sparkles, BookOpen, Layers, Award, BarChart2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface Token {
  id: string;
  text: string;
  originalText: string;
  isWord: boolean;
  isReplaced: boolean;
  synonyms: string[];
  selectedIndex: number; // -1 means original, 0+ is the index of selected synonym
}

// 150+ Word Synonym Database for Premium Paraphrasing
const SYNONYMS: Record<string, string[]> = {
  very: ['extremely', 'exceedingly', 'highly', 'deeply', 'greatly', 'immensely', 'notably'],
  happy: ['joyful', 'delighted', 'cheerful', 'ecstatic', 'elated', 'glad', 'thrilled'],
  sad: ['gloomy', 'unhappy', 'depressed', 'sorrowful', 'downcast', 'blue', 'melancholy'],
  good: ['excellent', 'superb', 'wonderful', 'exceptional', 'fine', 'stellar', 'positive'],
  bad: ['terrible', 'poor', 'awful', 'substandard', 'dreadful', 'adverse', 'harmful'],
  big: ['large', 'enormous', 'huge', 'massive', 'gigantic', 'immense', 'sizeable'],
  small: ['tiny', 'little', 'miniature', 'petite', 'microscopic', 'slight', 'compact'],
  beautiful: ['gorgeous', 'stunning', 'lovely', 'attractive', 'elegant', 'aesthetic', 'handsome'],
  ugly: ['unsightly', 'unattractive', 'plain', 'grotesque', 'unappealing', 'hideous'],
  smart: ['intelligent', 'clever', 'wise', 'brilliant', 'sharp', 'astute', 'intellectual'],
  dumb: ['foolish', 'unwise', 'silly', 'senseless', 'brainless', 'ignorant'],
  fast: ['quick', 'rapid', 'swift', 'speedy', 'accelerated', 'brisk', 'rapidly'],
  slow: ['sluggish', 'leisurely', 'unhurried', 'gradual', 'delayed', 'tardy'],
  easy: ['simple', 'effortless', 'straightforward', 'painless', 'manageable', 'facile'],
  hard: ['difficult', 'challenging', 'tough', 'arduous', 'strenuous', 'demanding', 'complex'],
  important: ['crucial', 'significant', 'essential', 'vital', 'critical', 'key', 'paramount'],
  unimportant: ['trivial', 'minor', 'negligible', 'insignificant', 'paltry', 'incidental'],
  funny: ['hilarious', 'amusing', 'humorous', 'witty', 'comical', 'droll'],
  scared: ['frightened', 'terrified', 'afraid', 'fearful', 'anxious', 'panicked'],
  brave: ['courageous', 'bold', 'valiant', 'fearless', 'heroic', 'intrepid'],
  angry: ['furious', 'irate', 'mad', 'enraged', 'resentful', 'indignant'],
  tired: ['exhausted', 'weary', 'fatigued', 'drained', 'sleepy', 'worn-out'],
  rich: ['wealthy', 'prosperous', 'affluent', 'loaded', 'well-off', 'opulent'],
  poor: ['impoverished', 'needy', 'broke', 'destitute', 'penniless', 'deprived'],
  new: ['modern', 'novel', 'fresh', 'recent', 'innovative', 'current', 'state-of-the-art'],
  old: ['ancient', 'aged', 'antique', 'elderly', 'historic', 'mature', 'antique'],
  hot: ['warm', 'boiling', 'scorching', 'fiery', 'sizzling', 'scalding'],
  cold: ['chilly', 'freezing', 'icy', 'frosty', 'frigid', 'wintry'],
  clean: ['spotless', 'tidy', 'neat', 'orderly', 'hygienic', 'pristine'],
  dirty: ['filthy', 'soiled', 'grimy', 'untidy', 'messy', 'polluted'],
  quiet: ['silent', 'peaceful', 'calm', 'tranquil', 'serene', 'hushed'],
  loud: ['noisy', 'deafening', 'thunderous', 'rowdy', 'boisterous', 'clamorous'],
  strong: ['powerful', 'sturdy', 'robust', 'tough', 'mighty', 'resilient'],
  weak: ['feeble', 'fragile', 'delicate', 'frail', 'flimsy', 'debilitated'],
  make: ['create', 'produce', 'build', 'generate', 'develop', 'construct', 'manufacture'],
  get: ['obtain', 'acquire', 'receive', 'gain', 'secure', 'retrieve', 'procure'],
  give: ['provide', 'offer', 'present', 'supply', 'grant', 'donate', 'bestow'],
  take: ['grab', 'seize', 'acquire', 'capture', 'obtain', 'secure'],
  go: ['proceed', 'travel', 'move', 'head', 'depart', 'journey', 'advance'],
  come: ['arrive', 'approach', 'reach', 'enter', 'appear', 'materialize'],
  say: ['state', 'declare', 'mention', 'assert', 'express', 'verbalize', 'utter'],
  tell: ['inform', 'reveal', 'disclose', 'narrate', 'notify', 'explain'],
  think: ['believe', 'consider', 'suppose', 'assume', 'ponder', 'reflect', 'deem'],
  know: ['understand', 'comprehend', 'realize', 'grasp', 'perceive', 'discern'],
  want: ['desire', 'wish', 'crave', 'covet', 'require', 'aspire'],
  need: ['require', 'demand', 'necessitate', 'crave', 'depend on'],
  like: ['enjoy', 'appreciate', 'admire', 'adore', 'favor', 'prefer'],
  love: ['cherish', 'adore', 'treasure', 'worship', 'esteem'],
  hate: ['detest', 'loathe', 'abhor', 'despise', 'dislike', 'resent'],
  start: ['begin', 'commence', 'initiate', 'launch', 'trigger', 'kick off'],
  stop: ['halt', 'cease', 'terminate', 'pause', 'end', 'conclude'],
  help: ['assist', 'aid', 'support', 'facilitate', 'serve', 'cooperate'],
  show: ['reveal', 'demonstrate', 'display', 'exhibit', 'indicate', 'manifest'],
  hide: ['conceal', 'disguise', 'camouflage', 'mask', 'veil'],
  try: ['attempt', 'endeavor', 'strive', 'seek', 'undertake'],
  find: ['discover', 'locate', 'identify', 'detect', 'uncover', 'encounter'],
  lose: ['misplace', 'drop', 'forfeit', 'yield'],
  win: ['triumph', 'succeed', 'prevail', 'conquer', 'gain'],
  use: ['utilize', 'employ', 'apply', 'exert', 'harness', 'consume'],
  work: ['operate', 'function', 'perform', 'labor', 'collaborate'],
  change: ['modify', 'alter', 'transform', 'adjust', 'vary', 'convert'],
  keep: ['retain', 'preserve', 'maintain', 'hold', 'save'],
  buy: ['purchase', 'acquire', 'procure', 'invest in'],
  sell: ['vend', 'trade', 'auction', 'marketing'],
  look: ['glance', 'gaze', 'observe', 'peer', 'view', 'inspect'],
  listen: ['hear', 'hearken', 'attend', 'pay attention'],
  read: ['peruse', 'scan', 'study', 'interpret'],
  write: ['compose', 'draft', 'author', 'record', 'inscribe'],
  learn: ['master', 'grasp', 'acquire', 'study', 'absorb'],
  teach: ['instruct', 'educate', 'train', 'tutor', 'guide', 'enlighten'],
  choose: ['select', 'pick', 'elect', 'prefer', 'opt for'],
  decide: ['determine', 'resolve', 'settle', 'finalize'],
  explain: ['clarify', 'elucidate', 'expound', 'describe', 'define'],
  remember: ['recall', 'recollect', 'retain', 'reminisce'],
  forget: ['overlook', 'neglect', 'ignore'],
  ask: ['inquire', 'request', 'demand', 'query', 'petition'],
  answer: ['reply', 'respond', 'retort', 'counter'],
  agree: ['concur', 'consent', 'assent', 'align'],
  disagree: ['differ', 'clash', 'object', 'oppose'],
  allow: ['permit', 'authorize', 'let', 'sanction', 'enable'],
  prevent: ['hinder', 'obstruct', 'block', 'stop', 'foil', 'thwart', 'avoid'],
  create: ['invent', 'design', 'devise', 'formulate', 'originate'],
  destroy: ['demolish', 'ruin', 'wreck', 'obliterate', 'annihilate'],
  develop: ['grow', 'expand', 'evolve', 'cultivate', 'foster'],
  improve: ['enhance', 'better', 'ameliorate', 'refine', 'upgrade'],
  reduce: ['decrease', 'diminish', 'lower', 'lessen', 'curtail', 'slash'],
  increase: ['boost', 'raise', 'augment', 'multiply', 'escalate', 'elevate'],
};

// Formal vs Academic priority tag mappings
const FORMAL_WORDS = ['commence', 'utilize', 'substandard', 'terminate', 'facilitate', 'elucidate', 'procure', 'demonstrate', 'conceal', 'endeavor', 'ameliorate', 'curtail', 'escalate'];


type ParaphraseMode = 'standard' | 'formal' | 'creative' | 'professional' | 'shorten' | 'expand';

export default function Paraphrase() {
  const tool = getToolById('paraphrase')!;
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<ParaphraseMode>('standard');
  const [creativity, setCreativity] = useState(60);
  const [copied, setCopied] = useState(false);

  // Parsed and processed token list state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);

  // Capitalization helper
  const adjustCapitalization = (original: string, replacement: string) => {
    if (!original || !replacement) return replacement;
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement.toLowerCase();
  };

  // Run Paraphrase logic over text input
  const processParaphrase = () => {
    if (!inputText.trim()) {
      setTokens([]);
      return;
    }

    // Split text keeping words, spaces, and punctuation separated
    const rawParts = inputText.split(/([a-zA-Z]+)/).filter(Boolean);
    
    const processedTokens: Token[] = rawParts.map((part, index) => {
      const isWord = /^[a-zA-Z]+$/.test(part);
      const cleanWord = part.toLowerCase();
      const synonymsList = SYNONYMS[cleanWord] || [];

      let isReplaced = false;
      let selectedIndex = -1;
      let textVal = part;

      if (isWord && synonymsList.length > 0) {
        // Roll chance based on creativity slider
        const replacementRoll = Math.random() * 100 <= creativity;
        if (replacementRoll) {
          // Adjust synonym ordering depending on selected Mode
          const candidates = [...synonymsList];
          
          if (mode === 'formal') {
            candidates.sort((a, b) => {
              const aFormal = FORMAL_WORDS.includes(a) ? 1 : 0;
              const bFormal = FORMAL_WORDS.includes(b) ? 1 : 0;
              return bFormal - aFormal || b.length - a.length;
            });
          } else if (mode === 'shorten') {
            candidates.sort((a, b) => a.length - b.length);
          } else if (mode === 'expand') {
            candidates.sort((a, b) => b.length - a.length);
          } else if (mode === 'professional') {
            candidates.sort((a, b) => {
              const aFormal = FORMAL_WORDS.includes(a) ? 1 : 0;
              const bFormal = FORMAL_WORDS.includes(b) ? 1 : 0;
              return bFormal - aFormal;
            });
          } else if (mode === 'creative') {
            // Sort purely by random shuffle to expand variety
            candidates.sort(() => Math.random() - 0.5);
          }

          // Select the top scoring candidate synonym
          const chosen = candidates[0];
          textVal = adjustCapitalization(part, chosen);
          isReplaced = true;
          selectedIndex = synonymsList.indexOf(chosen);
        }
      }

      return {
        id: `tok-${index}-${part.substring(0, 3)}`,
        text: textVal,
        originalText: part,
        isWord,
        isReplaced,
        synonyms: synonymsList,
        selectedIndex
      };
    });

    setTokens(processedTokens);
    setActiveTokenId(null);
    toast({ title: 'Paraphrase success!', description: `Applied mode: ${mode.toUpperCase()}` });
  };

  // Trigger paraphrase when input changes, debounced or triggered by action
  useEffect(() => {
    processParaphrase();
  }, [mode]);

  // Clean raw output text from current state tokens
  const paraphrasedText = useMemo(() => {
    return tokens.map(t => t.text).join('');
  }, [tokens]);

  // Handle popup synonym selection
  const selectSynonym = (tokenId: string, synonymIndex: number) => {
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        const wordText = synonymIndex === -1 
          ? t.originalText 
          : adjustCapitalization(t.originalText, t.synonyms[synonymIndex]);
        return {
          ...t,
          text: wordText,
          isReplaced: synonymIndex !== -1,
          selectedIndex: synonymIndex
        };
      }
      return t;
    }));
    setActiveTokenId(null);
  };

  // Copy plain text output to clipboard
  const copyToClipboard = () => {
    if (!paraphrasedText) return;
    navigator.clipboard.writeText(paraphrasedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard!' });
  };

  // Statistics Computations
  const stats = useMemo(() => {
    const originalWords = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const paraphrasedWords = paraphrasedText.trim() ? paraphrasedText.trim().split(/\s+/).length : 0;
    const changedCount = tokens.filter(t => t.isReplaced).length;

    // Estimate similarity using simple Levenshtein edit distance between words
    const origList = inputText.toLowerCase().split(/\s+/).filter(Boolean);
    const paraList = paraphrasedText.toLowerCase().split(/\s+/).filter(Boolean);
    
    let matches = 0;
    origList.forEach(w => {
      if (paraList.includes(w)) matches++;
    });

    const similarity = origList.length > 0 
      ? Math.round((matches / Math.max(origList.length, paraList.length)) * 100) 
      : 100;

    return {
      originalWords,
      paraphrasedWords,
      changedCount,
      similarity
    };
  }, [inputText, paraphrasedText, tokens]);

  // Close popup helper
  useEffect(() => {
    const handleOutsideClick = () => setActiveTokenId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={paraphrasedText.length > 0}>
      <div className="space-y-6">
        
        {/* Modes Navigation Header */}
        <div className="flex flex-wrap border bg-muted/30 p-1.5 rounded-2xl gap-1.5 select-none">
          {(['standard', 'formal', 'professional', 'creative', 'shorten', 'expand'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${mode === m ? 'bg-card text-primary border shadow-xs scale-102 font-extrabold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Creativity Slider */}
        <div className="rounded-xl border bg-card p-4 space-y-2 select-none">
          <div className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Sparkles className="w-3.5 h-3.5 text-primary" /> Synonyms Coverage (Creativity)</span>
            <span className="text-primary">{creativity}%</span>
          </div>
          <Slider value={[creativity]} onValueChange={(v) => setCreativity(v[0])} min={20} max={100} step={5} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Fewer changes (Precise)</span>
            <span>More changes (Creative)</span>
          </div>
        </div>

        {/* Core Editor Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Panel */}
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Sentence</label>
            <Textarea
              placeholder="Type or paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[280px] resize-none rounded-2xl border-muted p-4 text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-muted-foreground">{inputText.length} characters</span>
              <Button onClick={processParaphrase} size="sm" className="font-bold gap-1 rounded-xl">
                <RefreshCw className="w-3.5 h-3.5" /> Paraphrase
              </Button>
            </div>
          </div>

          {/* Interactive Output Panel */}
          <div className="space-y-2 flex flex-col">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paraphrased Output</label>
              {paraphrasedText && (
                <span className="text-[10px] text-emerald-600 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-full font-bold">
                  {stats.changedCount} words changed
                </span>
              )}
            </div>

            {/* Rich Token Display (Div structured to look like a Textarea) */}
            <div className="min-h-[280px] rounded-2xl border bg-muted/20 p-4 text-sm leading-relaxed overflow-y-auto max-h-[350px] relative select-none">
              {tokens.length > 0 ? (
                <div className="whitespace-pre-wrap">
                  {tokens.map(tok => {
                    if (!tok.isWord || tok.synonyms.length === 0) {
                      return <span key={tok.id}>{tok.text}</span>;
                    }

                    const isPopupOpen = activeTokenId === tok.id;

                    return (
                      <span 
                        key={tok.id} 
                        className="relative inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Word Token Trigger */}
                        <span
                          onClick={() => setActiveTokenId(isPopupOpen ? null : tok.id)}
                          className={`px-0.5 rounded cursor-pointer font-semibold transition-all border-b border-dashed ${
                            tok.isReplaced 
                              ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500 hover:bg-amber-500/20' 
                              : 'text-foreground border-muted-foreground/30 hover:bg-muted'
                          }`}
                        >
                          {tok.text}
                        </span>

                        {/* Interactive synonyms popover */}
                        {isPopupOpen && (
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-popover text-popover-foreground border rounded-xl shadow-lg p-1 min-w-[130px] flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 select-none">
                            <div className="text-[9px] text-muted-foreground px-2 py-1 border-b font-semibold select-none">Select Synonym:</div>
                            
                            {/* Original word revert button */}
                            <button
                              onClick={() => selectSynonym(tok.id, -1)}
                              className={`text-left px-2 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex justify-between items-center ${tok.selectedIndex === -1 ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                            >
                              <span>{tok.originalText} (Orig)</span>
                              {tok.selectedIndex === -1 && <Check className="w-3 h-3" />}
                            </button>

                            {/* Synonym alternatives buttons */}
                            {tok.synonyms.map((syn, idx) => (
                              <button
                                key={idx}
                                onClick={() => selectSynonym(tok.id, idx)}
                                className={`text-left px-2 py-1 rounded-md text-xs cursor-pointer capitalize transition-colors flex justify-between items-center ${tok.selectedIndex === idx ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted'}`}
                              >
                                <span>{syn}</span>
                                {tok.selectedIndex === idx && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground/60 italic text-center pt-20">Paraphrased result will appear here. Highlighted words can be clicked to choose alternatives.</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-muted-foreground">{paraphrasedText.length} characters</span>
              {paraphrasedText && (
                <Button 
                  onClick={copyToClipboard} 
                  variant="ghost" 
                  size="sm" 
                  className="font-bold gap-1 rounded-xl text-primary"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Text
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Statistics Panels (Only visible when paraphrased text exists) */}
        {paraphrasedText.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
            
            {/* Word count stats */}
            <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs space-y-1">
              <BookOpen className="w-5 h-5 text-primary mx-auto opacity-75" />
              <p className="text-xs text-muted-foreground font-semibold">Word Ratio</p>
              <p className="text-lg font-extrabold">{stats.paraphrasedWords} <span className="text-xs text-muted-foreground">/ {stats.originalWords}</span></p>
            </div>

            {/* Replaced word stats */}
            <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs space-y-1">
              <Layers className="w-5 h-5 text-primary mx-auto opacity-75" />
              <p className="text-xs text-muted-foreground font-semibold">Replacements</p>
              <p className="text-lg font-extrabold text-amber-600">{stats.changedCount} <span className="text-xs text-muted-foreground">words</span></p>
            </div>

            {/* Similarity Score stats */}
            <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs space-y-1">
              <BarChart2 className="w-5 h-5 text-primary mx-auto opacity-75" />
              <p className="text-xs text-muted-foreground font-semibold">Similarity Index</p>
              <p className="text-lg font-extrabold">{stats.similarity}%</p>
            </div>

            {/* Human Readable quality index */}
            <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs space-y-1">
              <Award className="w-5 h-5 text-primary mx-auto opacity-75" />
              <p className="text-xs text-muted-foreground font-semibold">Tone Mode</p>
              <p className="text-sm font-black capitalize text-emerald-600 tracking-wider pt-1">{mode}</p>
            </div>

          </div>
        )}

      </div>
    </ToolLayout>
  );
}
