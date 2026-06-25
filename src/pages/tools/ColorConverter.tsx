import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255, k = Math.min(c, m, y);
  return [
    Math.round(((c - k) / (1 - k)) * 100) || 0,
    Math.round(((m - k) / (1 - k)) * 100) || 0,
    Math.round(((y - k) / (1 - k)) * 100) || 0,
    Math.round(k * 100),
  ];
}

export default function ColorConverter() {
  const tool = getToolById('color-converter')!;
  const { toast } = useToast();
  const [hex, setHex] = useState('#6366f1');
  const [copied, setCopied] = useState('');

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(...rgb) : null;
  const cmyk = rgb ? rgbToCmyk(...rgb) : null;

  const formats = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : 'Invalid' },
    { label: 'HSL', value: hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : 'Invalid' },
    { label: 'CMYK', value: cmyk ? `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` : 'Invalid' },
  ];

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: `${label} copied!` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer border" />
          <Input value={hex} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setHex(e.target.value.padEnd(7, '0').slice(0, 7))} className="w-32 font-mono" placeholder="#000000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {formats.map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6" onClick={() => copy(value, label)}>
                  {copied === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="font-mono text-sm mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
