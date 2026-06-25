import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Languages, ArrowLeftRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
];

export default function TextTranslator() {
  const tool = getToolById('text-translator')!;
  const { toast } = useToast();

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Translate handler
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        inputText
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      
      // Parse translation output parts
      const translated = (data[0] as string[][]).map((sentence: string[]) => sentence[0]).join('');
      setTranslatedText(translated);
    } catch {
      toast({ title: 'Error translating', description: 'Please check your connection and try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Translation copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={translatedText.length > 0}>
      <div className="space-y-6">
        
        {/* Languages selector row */}
        <div className="flex items-center justify-between gap-4 bg-muted/40 p-3 rounded-2xl border flex-wrap">
          <select
            className="bg-transparent font-semibold focus:outline-none cursor-pointer max-w-[150px] text-sm"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} disabled={l.code === targetLang}>
                {l.name}
              </option>
            ))}
          </select>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
            className="rounded-full"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>

          <select
            className="bg-transparent font-semibold focus:outline-none cursor-pointer max-w-[150px] text-sm"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code} disabled={l.code === sourceLang}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Translation Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Source Text</label>
            <Textarea
              placeholder="Enter text to translate..."
              className="min-h-[220px] rounded-2xl resize-y text-base p-4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Translation Output</label>
              {translatedText && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
            <div className="min-h-[220px] rounded-2xl border bg-muted/20 p-4 font-normal text-base break-words whitespace-pre-wrap">
              {loading ? (
                <span className="text-muted-foreground animate-pulse">Translating text...</span>
              ) : (
                translatedText || <span className="text-muted-foreground/60 italic">Translation will appear here...</span>
              )}
            </div>
          </div>
        </div>

        <Button onClick={handleTranslate} disabled={loading || !inputText.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Languages className="w-5 h-5" /> Translate Text
        </Button>
      </div>
    </ToolLayout>
  );
}
