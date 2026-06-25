import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Sparkles } from 'lucide-react';

export default function StatisticsCalculator() {
  const tool = getToolById('statistics-calculator')!;

  const [input, setInput] = useState('');
  const [stats, setStats] = useState<{
    count: number;
    sum: number;
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    range: number;
    variance: number;
    stdDev: number;
    q1: number;
    q3: number;
    iqr: number;
    buckets: { label: string; count: number }[];
  } | null>(null);

  // Compute stats calculations
  const handleCalculate = () => {
    const nums = input
      .split(/[\s,]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (nums.length === 0) return;

    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Median
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

    // Mode
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    nums.forEach((val) => {
      freq[val] = (freq[val] || 0) + 1;
      if (freq[val] > maxFreq) maxFreq = freq[val];
    });
    const mode: number[] = [];
    if (maxFreq > 1) {
      Object.keys(freq).forEach((k) => {
        const keyVal = parseFloat(k);
        if (freq[keyVal] === maxFreq) mode.push(keyVal);
      });
    }

    const min = nums[0];
    const max = nums[count - 1];
    const range = max - min;

    // Variance & SD
    const meanDiffSum = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const variance = count > 1 ? meanDiffSum / (count - 1) : 0; // sample variance
    const stdDev = Math.sqrt(variance);

    // Quartiles
    const getMedianOfSub = (arr: number[]) => {
      const length = arr.length;
      if (length === 0) return 0;
      const mIdx = Math.floor(length / 2);
      return length % 2 !== 0 ? arr[mIdx] : (arr[mIdx - 1] + arr[mIdx]) / 2;
    };
    const q1 = getMedianOfSub(nums.slice(0, mid));
    const q3 = getMedianOfSub(nums.slice(count % 2 !== 0 ? mid + 1 : mid));
    const iqr = q3 - q1;

    // Histogram Buckets
    const bucketCount = 5;
    const interval = range / bucketCount || 1;
    const bucketsList = Array.from({ length: bucketCount }, (_, idx) => {
      const bMin = min + idx * interval;
      const bMax = bMin + interval;
      const label = `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`;
      const c = nums.filter((n) => n >= bMin && (idx === bucketCount - 1 ? n <= bMax : n < bMax)).length;
      return { label, count: c };
    });

    setStats({
      count,
      sum,
      mean,
      median,
      mode,
      min,
      max,
      range,
      variance,
      stdDev,
      q1,
      q3,
      iqr,
      buckets: bucketsList,
    });
  };

  return (
    <ToolLayout tool={tool} resultVisible={stats !== null}>
      <div className="space-y-6">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Dataset Inputs</label>
          <Textarea
            placeholder="Enter numbers separated by commas, spaces, or newlines..."
            className="min-h-[120px] p-4 text-base rounded-2xl resize-y"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Results grid */}
        {stats && (
          <div className="space-y-6 animate-fade-in">
            {/* Primary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/40 p-4 rounded-xl border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Sample Count (n)</div>
                <div className="text-xl font-extrabold">{stats.count}</div>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Mean (Average)</div>
                <div className="text-xl font-extrabold text-primary">{parseFloat(stats.mean.toFixed(3))}</div>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Median</div>
                <div className="text-xl font-extrabold">{parseFloat(stats.median.toFixed(3))}</div>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Std Deviation (s)</div>
                <div className="text-xl font-extrabold text-emerald-500">{parseFloat(stats.stdDev.toFixed(3))}</div>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="rounded-2xl border p-5 bg-card space-y-3">
              <h4 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2">Statistical Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b pb-1">
                    <span>Minimum / Maximum</span>
                    <span className="font-bold">{stats.min} / {stats.max}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Range</span>
                    <span className="font-bold">{stats.range}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Sample Variance</span>
                    <span className="font-bold">{parseFloat(stats.variance.toFixed(3))}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between border-b pb-1">
                    <span>Quartiles (Q₁ / Q₃)</span>
                    <span className="font-bold">{parseFloat(stats.q1.toFixed(3))} / {parseFloat(stats.q3.toFixed(3))}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Interquartile Range (IQR)</span>
                    <span className="font-bold">{parseFloat(stats.iqr.toFixed(3))}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Mode</span>
                    <span className="font-bold">{stats.mode.length > 0 ? stats.mode.join(', ') : 'No Mode'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Histogram frequency visualizer */}
            <div className="rounded-2xl border p-5 bg-card space-y-4">
              <h4 className="font-extrabold text-sm uppercase text-muted-foreground border-b pb-2">Frequency Distribution</h4>
              <div className="space-y-2">
                {stats.buckets.map((b, idx) => {
                  const percent = stats.count > 0 ? (b.count / stats.count) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <div className="w-24 text-right font-mono text-muted-foreground">{b.label}</div>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-full transition-all" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="w-8 font-bold font-mono">{b.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} disabled={!input.trim()} className="w-full font-bold gap-2 py-6 rounded-xl text-base">
          <Sparkles className="w-5 h-5" /> Calculate Statistics
        </Button>
      </div>
    </ToolLayout>
  );
}
