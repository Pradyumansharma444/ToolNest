import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function generateHarmony(base: string, rules: string): string[] {
  const toRgb = (h: string) => { const r = parseInt(h.slice(1, 3), 16); const g = parseInt(h.slice(3, 5), 16); const b = parseInt(h.slice(5, 7), 16); return [r, g, b]; };
  const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const [r, g, b] = toRgb(base);
  const colors = [base];
  if (rules === 'complementary') colors.push(toHex(255 - r, 255 - g, 255 - b));
  else if (rules === 'analogous') { colors.push(toHex(r + 30, g + 10, b - 20), toHex(r - 20, g + 10, b + 30)); }
  else if (rules === 'triad') { colors.push(toHex(b, r, g), toHex(g, b, r)); }
  else { colors.push(toHex(g, b, r), toHex(r + 50, g - 30, b + 10), toHex(r - 40, g + 40, b - 20)); }
  return colors;
}

export default function PaletteGenerator() {
  const tool = getToolById('palette-generator')!;
  const { toast } = useToast();
  const [base, setBase] = useState('#6366f1');
  const [rules, setRules] = useState('complementary');
  const [copied, setCopied] = useState(false);

  const palette = generateHarmony(base, rules);

  const copyPalette = () => {
    navigator.clipboard.writeText(palette.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Palette copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border" />
          <div className="flex gap-2 flex-wrap">
            {['complementary', 'analogous', 'triad', 'tetradic'].map(r => (
              <Button key={r} size="sm" variant={rules === r ? 'default' : 'outline'} onClick={() => setRules(r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {palette.map((c, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <div className="h-20" style={{ backgroundColor: c }} />
              <div className="p-2 text-center">
                <p className="text-xs font-mono">{c}</p>
                <Button size="sm" variant="ghost" className="h-6" onClick={() => { navigator.clipboard.writeText(c); toast({ title: 'Copied!' }); }}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={copyPalette}>{copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}Copy All</Button>
      </div>
    </ToolLayout>
  );
}
