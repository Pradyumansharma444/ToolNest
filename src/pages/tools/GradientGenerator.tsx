import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function GradientGenerator() {
  const tool = getToolById('gradient-generator')!;
  const { toast } = useToast();
  const [colors, setColors] = useState(['#6366f1', '#ec4899']);
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const updateColor = (i: number, c: string) => {
    const next = [...colors]; next[i] = c; setColors(next);
  };
  const addColor = () => setColors([...colors, '#000000']);
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));

  const cssGradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
  const cssCode = `background: ${cssGradient};`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'CSS copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="h-32 rounded-xl border" style={{ background: cssGradient }} />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Angle: {angle}°</label>
          <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="flex-1" />
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="color" value={c} onChange={(e) => updateColor(i, e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
              <Input value={c} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && e.target.value.length <= 7 && updateColor(i, e.target.value.padEnd(7, '0').slice(0, 7))} className="w-24 font-mono text-sm" />
              {colors.length > 2 && <Button size="sm" variant="ghost" onClick={() => removeColor(i)} className="text-destructive">×</Button>}
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addColor}>+ Add Stop</Button>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">CSS Code</span>
            <Button size="sm" variant="ghost" onClick={copyCSS}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
          </div>
          <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">{cssCode}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
