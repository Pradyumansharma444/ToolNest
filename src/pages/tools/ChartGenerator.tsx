import { useState, useMemo } from 'react';
import { BarChart3, LineChart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type ChartType = 'bar' | 'line';

function parseCsv(text: string): { label: string; value: number }[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      const parts = line.split(',');
      const label = parts[0]?.trim() || '';
      const value = parseFloat(parts[1]?.trim());
      return { label, value: isNaN(value) ? 0 : value };
    })
    .filter(d => d.label);
}

export default function ChartGenerator() {
  const tool = getToolById('chart-generator')!;
  const [csvData, setCsvData] = useState('Apples, 120\nBananas, 200\nOranges, 150\nGrapes, 90\nPears, 110');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const data = useMemo(() => parseCsv(csvData), [csvData]);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const chartWidth = 400;
  const chartHeight = 250;
  const padding = { top: 10, right: 10, bottom: 40, left: 50 };
  const plotW = chartWidth - padding.left - padding.right;

  const barGap = plotW / data.length;
  const barWidth = Math.max(4, barGap * 0.6);

  const labels = data.map(d => d.label);
  const maxLabelLen = Math.max(...labels.map(l => l.length));
  const bottomPad = Math.max(40, maxLabelLen * 7);

  const adjustedChartHeight = chartHeight + bottomPad - 40;
  const adjustedPlotH = adjustedChartHeight - padding.top - bottomPad;

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('bar')}>
            <BarChart3 className="w-4 h-4 mr-1" />Bar
          </Button>
          <Button variant={chartType === 'line' ? 'default' : 'outline'} size="sm" onClick={() => setChartType('line')}>
            <LineChart className="w-4 h-4 mr-1" />Line
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Data (label, value per line)</label>
            <Textarea value={csvData} onChange={(e) => setCsvData(e.target.value)}
              className="min-h-[200px] font-mono text-sm resize-y" />
          </div>

          <div className="rounded-xl border bg-card p-4">
            {data.length > 0 ? (
              <svg viewBox={`0 0 ${chartWidth} ${adjustedChartHeight + 10}`} className="w-full h-auto">
                {/* Y axis */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + adjustedPlotH} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                {/* X axis */}
                <line x1={padding.left} y1={padding.top + adjustedPlotH} x2={padding.left + plotW} y2={padding.top + adjustedPlotH} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

                {/* Y axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map(f => {
                  const y = padding.top + adjustedPlotH - f * adjustedPlotH;
                  return (
                    <g key={f}>
                      <text x={padding.left - 5} y={y + 4} textAnchor="end" className="text-[10px]" fill="currentColor" fillOpacity="0.5">
                        {Math.round(maxVal * f)}
                      </text>
                      <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                    </g>
                  );
                })}

                {chartType === 'bar' && data.map((d, i) => {
                  const barH = (d.value / maxVal) * adjustedPlotH;
                  const x = padding.left + i * barGap + (barGap - barWidth) / 2;
                  const y = padding.top + adjustedPlotH - barH;
                  return (
                    <g key={i}>
                      <rect x={x} y={y} width={barWidth} height={barH} fill="currentColor" className="text-primary" rx="2" />
                      <text x={padding.left + i * barGap + barGap / 2} y={padding.top + adjustedPlotH + 15} textAnchor="end" transform={`rotate(-45, ${padding.left + i * barGap + barGap / 2}, ${padding.top + adjustedPlotH + 15})`}
                        className="text-[10px]" fill="currentColor" fillOpacity="0.7">{d.label}</text>
                    </g>
                  );
                })}

                {chartType === 'line' && (
                  <>
                    <polyline
                      points={data.map((d, i) => {
                        const x = padding.left + (i / (data.length - 1 || 1)) * plotW;
                        const y = padding.top + adjustedPlotH - (d.value / maxVal) * adjustedPlotH;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"
                    />
                    {data.map((d, i) => {
                      const x = padding.left + (i / (data.length - 1 || 1)) * plotW;
                      const y = padding.top + adjustedPlotH - (d.value / maxVal) * adjustedPlotH;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="3" fill="currentColor" className="text-primary" />
                          <text x={x} y={padding.top + adjustedPlotH + 15} textAnchor="end" transform={`rotate(-45, ${x}, ${padding.top + adjustedPlotH + 15})`}
                            className="text-[10px]" fill="currentColor" fillOpacity="0.7">{d.label}</text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Enter data to see chart
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
