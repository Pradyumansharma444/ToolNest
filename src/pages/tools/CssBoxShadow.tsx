import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CssBoxShadow() {
  const tool = getToolById('css-box-shadow')!;
  const { toast } = useToast();
  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#00000033');
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const shadowValue = `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
  const cssCode = `box-shadow: ${shadowValue};`;

  const copyResult = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const sliders = [
    { label: 'Offset X', value: offsetX, set: setOffsetX, min: -50, max: 50 },
    { label: 'Offset Y', value: offsetY, set: setOffsetY, min: -50, max: 50 },
    { label: 'Blur', value: blur, set: setBlur, min: 0, max: 100 },
    { label: 'Spread', value: spread, set: setSpread, min: -50, max: 50 },
  ];

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {sliders.map(s => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <Label>{s.label}</Label>
                  <span className="text-muted-foreground font-mono">{s.value}px</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={s.value} onChange={e => s.set(+e.target.value)} className="w-full" />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Label>Color</Label>
              <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-9 p-1" />
              <Input value={color} onChange={e => setColor(e.target.value)} className="flex-1 font-mono text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} className="rounded border-muted-foreground" />
              Inset
            </label>
          </div>

          <div className="flex items-center justify-center rounded-xl border bg-card p-8 min-h-[200px]">
            <div className="w-40 h-40 rounded-lg bg-primary/10" style={{ boxShadow: shadowValue }} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">CSS Code</span>
            <Button size="sm" variant="ghost" onClick={copyResult}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <pre className="text-sm font-mono bg-muted p-3 rounded-lg">{cssCode}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
