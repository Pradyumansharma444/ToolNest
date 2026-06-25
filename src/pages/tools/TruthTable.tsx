import { useState, useMemo } from 'react';
import { Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type Operator = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

const OPERATORS: { value: Operator; label: string; desc: string }[] = [
  { value: 'AND', label: 'AND (∧)', desc: 'True if both are true' },
  { value: 'OR', label: 'OR (∨)', desc: 'True if at least one is true' },
  { value: 'NOT', label: 'NOT (¬)', desc: 'Inverts the input' },
  { value: 'XOR', label: 'XOR (⊕)', desc: 'True if inputs differ' },
  { value: 'NAND', label: 'NAND (↑)', desc: 'False only if both are true' },
  { value: 'NOR', label: 'NOR (↓)', desc: 'True only if both are false' },
];

function evaluate(a: boolean, b: boolean, op: Operator): boolean {
  switch (op) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'NOT': return !a;
    case 'XOR': return a !== b;
    case 'NAND': return !(a && b);
    case 'NOR': return !(a || b);
  }
}

export default function TruthTable() {
  const tool = getToolById('truth-table')!;
  const [variables, setVariables] = useState(2);
  const [operator, setOperator] = useState<Operator>('AND');

  const varNames = useMemo(() => {
    const names: string[] = [];
    for (let i = 0; i < variables; i++) names.push(String.fromCharCode(65 + i));
    return names;
  }, [variables]);

  const rows = useMemo(() => {
    const count = Math.pow(2, variables);
    const result: { inputs: boolean[]; output: boolean }[] = [];
    for (let i = 0; i < count; i++) {
      const inputs: boolean[] = [];
      for (let j = 0; j < variables; j++) {
        inputs.push(Boolean((i >> (variables - 1 - j)) & 1));
      }
      const output = evaluate(inputs[0], inputs[variables > 1 ? 1 : 0], operator);
      result.push({ inputs, output });
    }
    return result;
  }, [variables, operator]);

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Variables</label>
            <div className="flex gap-2">
              {[2, 3].map((n) => (
                <Button key={n} variant={variables === n ? 'default' : 'outline'} size="sm" onClick={() => setVariables(n)}>
                  {n} ({n === 2 ? 'A, B' : 'A, B, C'})
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Operator</label>
            <div className="flex flex-wrap gap-2">
              {OPERATORS.map((op) => (
                <Button key={op.value} variant={operator === op.value ? 'default' : 'outline'} size="sm" onClick={() => setOperator(op.value)}>
                  {op.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                {varNames.map((name) => (
                  <th key={name} className="px-4 py-2 text-center font-bold">{name}</th>
                ))}
                <th className="px-4 py-2 text-center font-bold text-primary">Output</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                  {row.inputs.map((val, j) => (
                    <td key={j} className="px-4 py-2 text-center font-mono">{val ? '1' : '0'}</td>
                  ))}
                  <td className={`px-4 py-2 text-center font-mono font-bold ${row.output ? 'text-emerald-600' : 'text-red-600'}`}>
                    {row.output ? '1' : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          <Table2 className="w-4 h-4 inline mr-2" />
          {OPERATORS.find(o => o.value === operator)?.desc} — {Math.pow(2, variables)} rows
        </div>
      </div>
    </ToolLayout>
  );
}
