import { useState, useMemo } from 'react';
import { LetterText, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'alternating' | 'camel' | 'snake' | 'kebab';

const cases: { value: CaseType; label: string; description: string }[] = [
  { value: 'upper', label: 'UPPERCASE', description: 'ALL CAPS' },
  { value: 'lower', label: 'lowercase', description: 'all small' },
  { value: 'title', label: 'Title Case', description: 'First Letter Capitalized' },
  { value: 'sentence', label: 'Sentence case', description: 'First word capitalized' },
  { value: 'alternating', label: 'aLtErNaTiNg', description: 'Mixed case' },
  { value: 'camel', label: 'camelCase', description: 'camelCase' },
  { value: 'snake', label: 'snake_case', description: 'underscore_separated' },
  { value: 'kebab', label: 'kebab-case', description: 'dash-separated' },
];

export default function CaseConverter() {
  const tool = getToolById('case-converter')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [activeCase, setActiveCase] = useState<CaseType>('upper');
  const [copied, setCopied] = useState(false);

  const converted = useMemo(() => {
    if (!text) return '';
    switch (activeCase) {
      case 'upper': return text.toUpperCase();
      case 'lower': return text.toLowerCase();
      case 'title':
        return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      case 'sentence':
        return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      case 'alternating':
        return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      case 'camel':
        return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
      case 'snake':
        return text.replace(/\s+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      case 'kebab':
        return text.replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      default: return text;
    }
  }, [text, activeCase]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(converted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <Textarea
          placeholder="Type or paste text to convert..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] resize-y"
        />

        {/* Case Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cases.map(c => (
            <Button
              key={c.value}
              variant={activeCase === c.value ? 'default' : 'outline'}
              onClick={() => setActiveCase(c.value)}
              className="text-sm"
              size="sm"
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Result */}
        {text && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LetterText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Result</span>
              </div>
              <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm whitespace-pre-wrap break-all font-mono">{converted}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-muted-foreground text-xs">Characters</p>
                <p className="font-semibold">{converted.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-muted-foreground text-xs">Words</p>
                <p className="font-semibold">{converted.trim() ? converted.trim().split(/\s+/).length : 0}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-muted-foreground text-xs">Lines</p>
                <p className="font-semibold">{converted.split('\n').length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
