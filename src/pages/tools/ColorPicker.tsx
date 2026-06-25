import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ColorPicker() {
  const tool = getToolById('color-picker')!;
  const { toast } = useToast();
  const [color, setColor] = useState('#6366f1');
  const [copied, setCopied] = useState('');

  const hex = color;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = `hsl(${Math.round(((r/255*0.3+g/255*0.59+b/255*0.11) || 0) * 240)}, ${Math.round((Math.max(r,g,b)-Math.min(r,g,b))/(Math.max(r,g,b)||1)*100)}%, ${Math.round((Math.max(r,g,b)/255)*50+25)}%)`;
  const cmyk = `cmyk(${(255-r)/2.55}%, ${(255-g)/2.55}%, ${(255-b)/2.55}%, ${(Math.max(r,g,b)/255*100-100)*-1}%)`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: `${label} copied!` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-24 h-24 rounded-xl cursor-pointer border" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pick a color above or enter a hex value:</p>
            <Input value={hex} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setColor(e.target.value.padEnd(7, '0').slice(0, 7))} className="w-32 font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'HEX', value: hex },
            { label: 'RGB', value: rgb },
            { label: 'HSL', value: hsl },
            { label: 'CMYK', value: cmyk },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6" onClick={() => copy(value, label)}>
                  {copied === label ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="font-mono text-sm mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border-2 p-6 text-center text-white font-bold" style={{ backgroundColor: hex }}>
          Preview Background
        </div>
      </div>
    </ToolLayout>
  );
}
