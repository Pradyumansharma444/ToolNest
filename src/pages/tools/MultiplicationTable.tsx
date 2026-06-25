import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function MultiplicationTable() {
  const tool = getToolById('multiplication-table')!;
  const [number, setNumber] = useState(5);
  const [range, setRange] = useState(12);

  const tableData = useMemo(() => {
    const rows: { multiplier: number; product: number }[] = [];
    for (let i = 1; i <= range; i++) {
      rows.push({ multiplier: i, product: number * i });
    }
    return rows;
  }, [number, range]);

  const downloadTable = () => {
    const lines = [`Multiplication Table: ${number} × 1 to ${range}\n`, ...tableData.map(r => `${number} × ${r.multiplier} = ${r.product}`)];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multiplication-table-${number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number</label>
            <Input type="number" min={1} max={100} value={number} onChange={e => setNumber(Math.max(1, +e.target.value || 1))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Range (1 to N)</label>
            <Input type="number" min={1} max={50} value={range} onChange={e => setRange(Math.max(1, +e.target.value || 1))} />
          </div>
        </div>

        <div className="rounded-xl border-2 border-primary/10 overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 text-center">
            <p className="font-semibold text-lg">Multiplication Table: {number} × 1 to {range}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
            {tableData.map(row => (
              <div key={row.multiplier} className="rounded-lg border bg-background p-3 text-center hover:border-primary/50 transition-colors">
                <p className="text-sm text-muted-foreground">{number} × {row.multiplier}</p>
                <p className="text-2xl font-bold tabular-nums">{row.product}</p>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={downloadTable} className="w-full">
          <Download className="w-4 h-4 mr-1" />Download as Text
        </Button>
      </div>
    </ToolLayout>
  );
}
