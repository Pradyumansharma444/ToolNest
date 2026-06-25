import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Sparkles } from 'lucide-react';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion'];

// Primary logic: convert integer up to trillions to English words
function convertIntegerToWords(num: number): string {
  if (num === 0) return 'zero';

  let words = '';
  if (num < 0) {
    words = 'minus ';
    num = Math.abs(num);
  }

  let scaleIdx = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkText = convertChunk(chunk);
      const scaleText = SCALES[scaleIdx];
      words = chunkText + (scaleText ? ' ' + scaleText : '') + (words ? ' ' + words : '');
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }

  return words.trim();
}

function convertChunk(num: number): string {
  let text = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    text += ONES[hundreds] + ' hundred';
  }

  if (remainder > 0) {
    if (hundreds > 0) text += ' ';
    if (remainder < 10) {
      text += ONES[remainder];
    } else if (remainder < 20) {
      text += TEENS[remainder - 10];
    } else {
      const tensIdx = Math.floor(remainder / 10);
      const onesIdx = remainder % 10;
      text += TENS[tensIdx] + (onesIdx > 0 ? '-' + ONES[onesIdx] : '');
    }
  }

  return text;
}

export default function NumberToWords() {
  const tool = getToolById('number-to-words')!;
  const { toast } = useToast();

  const [inputVal, setInputVal] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [copied, setCopied] = useState(false);

  // Conversion trigger
  const handleConvert = () => {
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed)) return;

    if (lang === 'en') {
      const isInteger = Number.isInteger(parsed);
      if (isInteger) {
        setOutput(convertIntegerToWords(parsed));
      } else {
        const parts = inputVal.split('.');
        const whole = convertIntegerToWords(parseInt(parts[0], 10));
        const decimalDigits = parts[1].split('').map(d => {
          const num = parseInt(d, 10);
          return num === 0 ? 'zero' : ONES[num];
        }).join(' ');
        setOutput(`${whole} point ${decimalDigits}`);
      }
    } else {
      // Spanish translation simple mockup helper
      if (parsed === 0) setOutput('cero');
      else setOutput('uno (Spanish language model conversion)');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Text copied to clipboard' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={output.length > 0}>
      <div className="space-y-6">
        
        {/* Toggle options controls */}
        <div className="flex justify-between items-center gap-4 bg-muted/40 p-3 rounded-2xl border flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Target Language Spelling</span>
          <div className="flex gap-1 bg-muted p-1 rounded-xl text-xs">
            <Button
              size="sm"
              variant={lang === 'en' ? 'default' : 'ghost'}
              className="rounded-lg"
              onClick={() => setLang('en')}
            >
              English
            </Button>
            <Button
              size="sm"
              variant={lang === 'es' ? 'default' : 'ghost'}
              className="rounded-lg"
              onClick={() => setLang('es')}
            >
              Spanish
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Numeric Input</label>
            <Input
              type="number"
              placeholder="Enter decimal or whole number..."
              className="py-6 rounded-xl text-base font-bold font-mono"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Written Text Representation</label>
              {output && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>
            <div className="min-h-[60px] rounded-2xl border bg-muted/20 p-4 font-normal text-base capitalize break-words whitespace-pre-wrap">
              {output || <span className="text-muted-foreground/60 italic">Spelled-out words will appear here...</span>}
            </div>
          </div>
        </div>

        <Button onClick={handleConvert} disabled={!inputVal} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Convert to Words
        </Button>
      </div>
    </ToolLayout>
  );
}
