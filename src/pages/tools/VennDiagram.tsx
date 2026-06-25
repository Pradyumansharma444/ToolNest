import { useState, useMemo, useRef, useCallback } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type Mode = 2 | 3;

export default function VennDiagram() {
  const tool = getToolById('venn-diagram')!;
  const [mode, setMode] = useState<Mode>(2);
  const [labels, setLabels] = useState(['Set A', 'Set B', 'Set C']);
  const [items, setItems] = useState<string[][]>([['A1', 'A2'], ['B1', 'B2', 'AB'], ['C1', 'C2', 'AC', 'BC', 'ABC']]);
  const svgRef = useRef<SVGSVGElement>(null);

  const updateLabel = (idx: number, val: string) => {
    const next = [...labels];
    next[idx] = val;
    setLabels(next);
  };

  const addItem = (setIdx: number) => {
    const name = `Item ${items[setIdx].length + 1}`;
    const next = [...items];
    next[setIdx] = [...next[setIdx], name];
    setItems(next);
  };

  const removeItem = (setIdx: number, itemIdx: number) => {
    const next = [...items];
    next[setIdx] = next[setIdx].filter((_, i) => i !== itemIdx);
    setItems(next);
  };

  const updateItem = (setIdx: number, itemIdx: number, val: string) => {
    const next = [...items];
    next[setIdx] = [...next[setIdx]];
    next[setIdx][itemIdx] = val;
    setItems(next);
  };

  const circles = useMemo(() => {
    const r = 80;
    if (mode === 2) {
      return [
        { cx: 130, cy: 120, r, fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6', label: { x: 80, y: 30 }, labelText: labels[0] },
        { cx: 230, cy: 120, r, fill: 'rgba(239,68,68,0.2)', stroke: '#ef4444', label: { x: 280, y: 30 }, labelText: labels[1] },
      ];
    }
    return [
      { cx: 180, cy: 90, r, fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6', label: { x: 180, y: 15 }, labelText: labels[0] },
      { cx: 110, cy: 165, r, fill: 'rgba(239,68,68,0.2)', stroke: '#ef4444', label: { x: 60, y: 210 }, labelText: labels[1] },
      { cx: 250, cy: 165, r, fill: 'rgba(34,197,94,0.2)', stroke: '#22c55e', label: { x: 300, y: 210 }, labelText: labels[2] },
    ];
  }, [mode, labels]);

  const downloadImage = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 260;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'venn-diagram.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="flex gap-2">
          <Badge variant={mode === 2 ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setMode(2)}>2 Circles</Badge>
          <Badge variant={mode === 3 ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setMode(3)}>3 Circles</Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          {labels.slice(0, mode).map((label, i) => (
            <div key={i} className="space-y-1">
              <Input value={label} onChange={e => updateLabel(i, e.target.value)} className="w-28 h-8 text-sm" placeholder={`Set ${String.fromCharCode(65 + i)}`} />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-h-[260px] flex items-center justify-center bg-muted/20 rounded-xl">
            <svg ref={svgRef} viewBox="0 0 420 260" className="w-full max-w-[420px] h-auto">
              {circles.map((c, i) => (
                <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} stroke={c.stroke} strokeWidth="2" />
              ))}
              {circles.map((c, i) => (
                <text key={i} x={c.label.x} y={c.label.y} textAnchor="middle" className="text-xs font-medium" fill={c.stroke}>{c.labelText}</text>
              ))}
            </svg>
          </div>

          <div className="space-y-4 w-full md:w-64">
            {items.slice(0, mode).map((setItems, setIdx) => (
              <div key={setIdx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{labels[setIdx]}</p>
                  <Button size="icon" variant="ghost" onClick={() => addItem(setIdx)}><Plus className="w-3 h-3" /></Button>
                </div>
                {setItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-1">
                    <Input value={item} onChange={e => updateItem(setIdx, itemIdx, e.target.value)} className="h-7 text-xs flex-1" />
                    <Button size="icon" variant="ghost" onClick={() => removeItem(setIdx, itemIdx)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={downloadImage}><Download className="w-4 h-4 mr-1" />Download as Image</Button>
      </div>
    </ToolLayout>
  );
}
