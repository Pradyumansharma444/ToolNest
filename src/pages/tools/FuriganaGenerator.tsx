import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Sparkles } from 'lucide-react';

// Common Kanji word to Furigana Hiragana dictionary mappings
const FURIGANA_DICT: Record<string, { kanji: string; furigana: string }> = {
  '日本語': { kanji: '日本語', furigana: 'にほんご' },
  '日本': { kanji: '日本', furigana: 'にほん' },
  '漢字': { kanji: '漢字', furigana: 'かんじ' },
  '先生': { kanji: '先生', furigana: 'せんせい' },
  '学生': { kanji: '学生', furigana: 'がくせい' },
  '学校': { kanji: '学校', furigana: 'がっこう' },
  '大学': { kanji: '大学', furigana: 'だいがく' },
  '私': { kanji: '私', furigana: 'わたし' },
  '君': { kanji: '君', furigana: 'きみ' },
  '食べる': { kanji: '食', furigana: 'た' },
  '飲む': { kanji: '飲', furigana: 'の' },
  '行く': { kanji: '行', furigana: 'い' },
  '来る': { kanji: '来', furigana: 'く' },
  '見る': { kanji: '見', furigana: 'み' },
  '書く': { kanji: '書', furigana: 'か' },
  '読む': { kanji: '読', furigana: 'よ' },
  '話す': { kanji: '話', furigana: 'はな' },
  '勉強': { kanji: '勉強', furigana: 'べんきょう' },
  '仕事': { kanji: '仕事', furigana: 'しごと' },
  '今日': { kanji: '今日', furigana: 'きょう' },
  '明日': { kanji: '明日', furigana: 'あした' },
  '昨日': { kanji: '昨日', furigana: 'きのう' },
  '時間': { kanji: '時間', furigana: 'じかん' },
  '友達': { kanji: '友達', furigana: 'ともだち' },
  '元気': { kanji: '元気', furigana: 'げんき' },
};

export default function FuriganaGenerator() {
  const tool = getToolById('furigana-generator')!;
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate Furigana markup
  const handleGenerate = () => {
    if (!input.trim()) return;

    const temp = input;
    let htmlResult = input;

    // Scan dictionary entries and replace them with ruby tags
    Object.keys(FURIGANA_DICT).forEach((word) => {
      const { kanji, furigana } = FURIGANA_DICT[word];
      if (temp.includes(word)) {
        const regex = new RegExp(word, 'g');
        // If it's a verb/adjective with okurigana, keep okurigana outside the ruby block
        if (word.length > kanji.length) {
          const okurigana = word.slice(kanji.length);
          htmlResult = htmlResult.replace(regex, `<ruby>${kanji}<rt>${furigana}</rt></ruby>${okurigana}`);
        } else {
          htmlResult = htmlResult.replace(regex, `<ruby>${kanji}<rt>${furigana}</rt></ruby>`);
        }
      }
    });

    setHtmlOutput(htmlResult);
  };

  const handleCopy = () => {
    if (!htmlOutput) return;
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'HTML Ruby tags copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={htmlOutput.length > 0}>
      <div className="space-y-6">
        
        {/* Input/Output panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Japanese Kanji Text</label>
            <Textarea
              placeholder="日本語の文章を入力してください。例：漢字は面白いです。"
              className="min-h-[180px] p-4 text-base rounded-2xl resize-y"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Annotated Ruby Preview</label>
              {htmlOutput && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
            <div className="min-h-[180px] rounded-2xl border bg-muted/20 p-6 font-normal text-lg break-words leading-loose">
              {htmlOutput ? (
                <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
              ) : (
                <span className="text-muted-foreground/60 italic text-base">Furigana readings will show here...</span>
              )}
            </div>
          </div>
        </div>

        {htmlOutput && (
          <div className="rounded-2xl border p-4 bg-muted/20 space-y-2">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase">HTML Ruby Tags Output</label>
            <pre className="text-xs font-mono break-all whitespace-pre-wrap">{htmlOutput}</pre>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={!input.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Generate Furigana
        </Button>
      </div>
    </ToolLayout>
  );
}
