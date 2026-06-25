import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-teal-400', 'bg-orange-400'];

export default function FlexboxPlayground() {
  const tool = getToolById('flexbox-playground')!;
  const { toast } = useToast();
  const [direction, setDirection] = useState('row');
  const [justify, setJustify] = useState('flex-start');
  const [align, setAlign] = useState('stretch');
  const [wrap, setWrap] = useState('nowrap');
  const [gap, setGap] = useState(8);
  const [count, setCount] = useState(4);
  const [copied, setCopied] = useState(false);

  const cssCode = useMemo(() => {
    return [
      `display: flex;`,
      `flex-direction: ${direction};`,
      `justify-content: ${justify};`,
      `align-items: ${align};`,
      `flex-wrap: ${wrap};`,
      `gap: ${gap}px;`,
    ].join('\n');
  }, [direction, justify, align, wrap, gap]);

  const copyResult = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>flex-direction</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="row">row</SelectItem>
                <SelectItem value="row-reverse">row-reverse</SelectItem>
                <SelectItem value="column">column</SelectItem>
                <SelectItem value="column-reverse">column-reverse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>justify-content</Label>
            <Select value={justify} onValueChange={setJustify}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flex-start">flex-start</SelectItem>
                <SelectItem value="center">center</SelectItem>
                <SelectItem value="flex-end">flex-end</SelectItem>
                <SelectItem value="space-between">space-between</SelectItem>
                <SelectItem value="space-around">space-around</SelectItem>
                <SelectItem value="space-evenly">space-evenly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>align-items</Label>
            <Select value={align} onValueChange={setAlign}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stretch">stretch</SelectItem>
                <SelectItem value="flex-start">flex-start</SelectItem>
                <SelectItem value="center">center</SelectItem>
                <SelectItem value="flex-end">flex-end</SelectItem>
                <SelectItem value="baseline">baseline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>flex-wrap</Label>
            <Select value={wrap} onValueChange={setWrap}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nowrap">nowrap</SelectItem>
                <SelectItem value="wrap">wrap</SelectItem>
                <SelectItem value="wrap-reverse">wrap-reverse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <Label>gap</Label>
              <span className="text-muted-foreground font-mono">{gap}px</span>
            </div>
            <input type="range" min={0} max={40} value={gap} onChange={e => setGap(+e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1">
            <Label>items ({count})</Label>
            <input type="range" min={1} max={8} value={count} onChange={e => setCount(+e.target.value)} className="w-full" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 min-h-[200px]" style={{ display: 'flex', flexDirection: direction as React.CSSProperties['flexDirection'], justifyContent: justify as React.CSSProperties['justifyContent'], alignItems: align as React.CSSProperties['alignItems'], flexWrap: wrap as React.CSSProperties['flexWrap'], gap }}>
          {items.map(i => (
            <div key={i} className={`${COLORS[i % COLORS.length]} rounded-lg flex items-center justify-center text-white font-bold text-lg min-w-[60px] min-h-[60px]`}>
              {i + 1}
            </div>
          ))}
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
