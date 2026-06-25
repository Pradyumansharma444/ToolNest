import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CssBorderRadius() {
  const tool = getToolById('css-border-radius')!;
  const { toast } = useToast();
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [copied, setCopied] = useState(false);

  const cssCode = `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;

  const copyResult = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const sliders = [
    { label: 'Top-Left', value: tl, set: setTl },
    { label: 'Top-Right', value: tr, set: setTr },
    { label: 'Bottom-Right', value: br, set: setBr },
    { label: 'Bottom-Left', value: bl, set: setBl },
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
                <input type="range" min={0} max={100} value={s.value} onChange={e => s.set(+e.target.value)} className="w-full" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center rounded-xl border bg-card p-8 min-h-[200px]">
            <div
              className="w-40 h-40 bg-gradient-to-br from-primary to-primary/60"
              style={{ borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` }}
            />
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
