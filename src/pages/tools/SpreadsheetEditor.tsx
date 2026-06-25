import { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';

const INITIAL_ROWS = 5;
const INITIAL_COLS = 5;

export default function SpreadsheetEditor() {
  const tool = getToolById('spreadsheet-editor')!;
  const [data, setData] = useState<string[][]>(() =>
    Array.from({ length: INITIAL_ROWS }, () => Array(INITIAL_COLS).fill(''))
  );

  const updateCell = (row: number, col: number, value: string) => {
    setData(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  const addRow = () => setData(prev => [...prev, Array(prev[0].length).fill('')]);
  const addColumn = () => setData(prev => prev.map(r => [...r, '']));
  const removeRow = (idx: number) => setData(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  const removeColumn = (idx: number) => setData(prev => prev[0].length > 1 ? prev.map(r => r.filter((_, i) => i !== idx)) : prev);

  const exportCsv = () => {
    const csv = data.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(csv, 'spreadsheet.csv', 'text/csv');
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add Row</Button>
          <Button size="sm" variant="outline" onClick={addColumn}><Plus className="w-4 h-4 mr-1" />Add Column</Button>
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
        </div>

        <div className="rounded-xl border bg-card overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="w-8 border-r" />
                {data[0].map((_, ci) => (
                  <th key={ci} className="px-2 py-1 text-xs text-muted-foreground font-medium border-r relative group">
                    {String.fromCharCode(65 + ci)}
                    <button className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={() => removeColumn(ci)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} className="border-t hover:bg-muted/10 group">
                  <td className="border-r text-xs text-muted-foreground text-center px-1 relative">
                    {ri + 1}
                    <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={() => removeRow(ri)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-r p-0">
                      <input
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full bg-transparent px-2 py-1 outline-none focus:bg-accent/50 min-w-[80px]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
