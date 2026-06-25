import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PercentageCalculator() {
  const tool = getToolById('percentage-calculator')!;
  const [mode, setMode] = useState<'of' | 'increase' | 'decrease' | 'what'>('of');

  // Mode: X% of Y
  const [pctOf, setPctOf] = useState(20);
  const [ofValue, setOfValue] = useState(100);

  // Mode: X increased/decreased by Y%
  const [baseValue, setBaseValue] = useState(100);
  const [changePct, setChangePct] = useState(20);

  // Mode: X is what % of Y
  const [partValue, setPartValue] = useState(25);
  const [wholeValue, setWholeValue] = useState(100);

  const resultOf = (pctOf / 100) * ofValue;
  const increaseResult = baseValue * (1 + changePct / 100);
  const decreaseResult = baseValue * (1 - changePct / 100);
  const whatPct = wholeValue !== 0 ? (partValue / wholeValue) * 100 : 0;

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="of">% of</TabsTrigger>
            <TabsTrigger value="increase">Increase</TabsTrigger>
            <TabsTrigger value="decrease">Decrease</TabsTrigger>
            <TabsTrigger value="what">What %</TabsTrigger>
          </TabsList>

          <TabsContent value="of" className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Percentage</label>
                  <Input type="number" value={pctOf} onChange={(e) => setPctOf(Number(e.target.value))} />
                </div>
                <span className="text-lg text-muted-foreground pb-2">% of</span>
                <div>
                  <label className="text-sm font-medium">Value</label>
                  <Input type="number" value={ofValue} onChange={(e) => setOfValue(Number(e.target.value))} />
                </div>
              </div>
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{resultOf.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{pctOf}% of {ofValue}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="increase" className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Base Value</label>
                  <Input type="number" value={baseValue} onChange={(e) => setBaseValue(Number(e.target.value))} />
                </div>
                <span className="text-lg text-muted-foreground pb-2">+</span>
                <div>
                  <label className="text-sm font-medium">%</label>
                  <Input type="number" value={changePct} onChange={(e) => setChangePct(Number(e.target.value))} />
                </div>
              </div>
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{increaseResult.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Increase of {changePct}%</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decrease" className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Base Value</label>
                  <Input type="number" value={baseValue} onChange={(e) => setBaseValue(Number(e.target.value))} />
                </div>
                <span className="text-lg text-muted-foreground pb-2">-</span>
                <div>
                  <label className="text-sm font-medium">%</label>
                  <Input type="number" value={changePct} onChange={(e) => setChangePct(Number(e.target.value))} />
                </div>
              </div>
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{decreaseResult.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Decrease of {changePct}%</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="what" className="space-y-4">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Part</label>
                  <Input type="number" value={partValue} onChange={(e) => setPartValue(Number(e.target.value))} />
                </div>
                <span className="text-lg text-muted-foreground pb-2">is what % of</span>
                <div>
                  <label className="text-sm font-medium">Whole</label>
                  <Input type="number" value={wholeValue} onChange={(e) => setWholeValue(Number(e.target.value))} />
                </div>
              </div>
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{whatPct.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground">{partValue} is {whatPct.toFixed(2)}% of {wholeValue}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
