import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ContrastChecker() {
  const tool = getToolById('contrast-checker')!;
  const { toast } = useToast();
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const f = hexToRgb(fg), b = hexToRgb(bg);
    if (!f || !b) return null;
    const l1 = relativeLuminance(...f), l2 = relativeLuminance(...b);
    const ratio = contrastRatio(l1, l2);
    const aaLarge = ratio >= 3;
    const aaSmall = ratio >= 4.5;
    const aaaLarge = ratio >= 4.5;
    const aaaSmall = ratio >= 7;
    return { ratio: ratio.toFixed(2), aaLarge, aaSmall, aaaLarge, aaaSmall };
  }, [fg, bg]);

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Contrast Ratio: ${result.ratio}:1\nAA Large: ${result.aaLarge ? 'PASS' : 'FAIL'}\nAA Small: ${result.aaSmall ? 'PASS' : 'FAIL'}\nAAA Large: ${result.aaaLarge ? 'PASS' : 'FAIL'}\nAAA Small: ${result.aaaSmall ? 'PASS' : 'FAIL'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-muted-foreground block mb-1">Text Color</label><Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-12 p-1 cursor-pointer" /></div>
          <div><label className="text-sm text-muted-foreground block mb-1">Background Color</label><Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-12 p-1 cursor-pointer" /></div>
        </div>
        <div className="h-24 rounded-xl flex items-center justify-center font-bold text-2xl" style={{ color: fg, backgroundColor: bg }}>
          Preview Text
        </div>
        {result && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Contrast Ratio: {result.ratio}:1</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'WCAG AA (Large)', pass: result.aaLarge },
                { label: 'WCAG AA (Small)', pass: result.aaSmall },
                { label: 'WCAG AAA (Large)', pass: result.aaaLarge },
                { label: 'WCAG AAA (Small)', pass: result.aaaSmall },
              ].map(({ label, pass }) => (
                <div key={label} className={`rounded-lg p-2 text-center font-medium ${pass ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                  {label}: {pass ? 'PASS' : 'FAIL'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
