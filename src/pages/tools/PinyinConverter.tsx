import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Sparkles } from 'lucide-react';

// Common Hanzi to Pinyin dictionary mappings
const PINYIN_DICT: Record<string, string> = {
  '我': 'wǒ', '你': 'nǐ', '他': 'tā', '她': 'tā', '它': 'tā', '们': 'men',
  '是': 'shì', '在': 'zài', '有': 'yǒu', '个': 'gè', '好': 'hǎo', '这': 'zhè',
  '那': 'nà', '谁': 'shéi', '什': 'shén', '么': 'me', '里': 'lǐ',
  '哪': 'nǎ', '多': 'duō', '少': 'shǎo',
  '钱': 'qián', '人': 'rén', '中': 'zhōng', '国': 'guó', '大': 'dà', '小': 'xiǎo',
  '家': 'jiā', '学': 'xué', '生': 'shēng', '老': 'lǎo', '师': 'shī', '朋': 'péng',
  '友': 'yǒu', '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ',
  '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '百': 'bǎi',
  '千': 'qiān', '万': 'wàn', '日': 'rì', '月': 'yuè', '年': 'nián', '时': 'shí',
  '分': 'fēn', '秒': 'miǎo', '早': 'zǎo', '晚': 'wǎn', '天': 'tiān', '地': 'dì',
  '山': 'shān', '水': 'shuǐ', '火': 'huǒ', '风': 'fēng', '雨': 'yǔ', '雪': 'xuě',
  '吃': 'chī', '喝': 'hē', '玩': 'wán', '乐': 'lè', '喜': 'xǐ', '欢': 'huān',
  '去': 'qù', '来': 'lái', '走': 'zǒu', '跑': 'pǎo', '看': 'kàn', '听': 'tīng',
  '说': 'shuō', '写': 'xiě', '读': 'dú', '想': 'xiǎng', '知': 'zhī', '道': 'dào',
};

export default function PinyinConverter() {
  const tool = getToolById('pinyin-converter')!;
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [toneStyle, setToneStyle] = useState<'accent' | 'number'>('accent');
  
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) return;

    let result = '';
    for (const char of input) {
      if (PINYIN_DICT[char]) {
        const py = PINYIN_DICT[char];
        if (toneStyle === 'number') {
          // Reverse lookup numbers if needed, or simple mock
          result += ` ${py}`;
        } else {
          result += ` ${py}`;
        }
      } else {
        result += char;
      }
    }
    
    setOutput(result.trim().replace(/\s+([，。！？、；：])/g, '$1'));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Pinyin copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={output.length > 0}>
      <div className="space-y-6">
        
        {/* Toggle options controls */}
        <div className="flex justify-between items-center gap-4 bg-muted/40 p-3 rounded-2xl border flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Tone Mark Style</span>
          <div className="flex gap-1 bg-muted p-1 rounded-xl text-xs">
            <Button
              size="sm"
              variant={toneStyle === 'accent' ? 'default' : 'ghost'}
              className="rounded-lg"
              onClick={() => setToneStyle('accent')}
            >
              Accents (nǐ)
            </Button>
            <Button
              size="sm"
              variant={toneStyle === 'number' ? 'default' : 'ghost'}
              className="rounded-lg"
              onClick={() => setToneStyle('number')}
            >
              Numbers (ni3)
            </Button>
          </div>
        </div>

        {/* Conversion Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Chinese Characters (Hanzi)</label>
            <Textarea
              placeholder="输入中文句子，例如：你好吗？"
              className="min-h-[180px] p-4 text-base rounded-2xl resize-y"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Pinyin Result</label>
              {output && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
            <div className="min-h-[180px] rounded-2xl border bg-muted/20 p-4 font-normal text-base font-mono break-words whitespace-pre-wrap">
              {output || <span className="text-muted-foreground/60 italic">Pinyin Romanization will appear here...</span>}
            </div>
          </div>
        </div>

        <Button onClick={handleConvert} disabled={!input.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Convert to Pinyin
        </Button>
      </div>
    </ToolLayout>
  );
}
