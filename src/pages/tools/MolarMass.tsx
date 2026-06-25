import { useState, useMemo } from 'react';
import { FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const ELEMENTS: Record<string, { name: string; mass: number }> = {
  H: { name: 'Hydrogen', mass: 1.008 },
  He: { name: 'Helium', mass: 4.003 },
  Li: { name: 'Lithium', mass: 6.941 },
  Be: { name: 'Beryllium', mass: 9.012 },
  B: { name: 'Boron', mass: 10.811 },
  C: { name: 'Carbon', mass: 12.011 },
  N: { name: 'Nitrogen', mass: 14.007 },
  O: { name: 'Oxygen', mass: 15.999 },
  F: { name: 'Fluorine', mass: 18.998 },
  Ne: { name: 'Neon', mass: 20.180 },
  Na: { name: 'Sodium', mass: 22.990 },
  Mg: { name: 'Magnesium', mass: 24.305 },
  Al: { name: 'Aluminium', mass: 26.982 },
  Si: { name: 'Silicon', mass: 28.086 },
  P: { name: 'Phosphorus', mass: 30.974 },
  S: { name: 'Sulfur', mass: 32.065 },
  Cl: { name: 'Chlorine', mass: 35.453 },
  Ar: { name: 'Argon', mass: 39.948 },
  K: { name: 'Potassium', mass: 39.098 },
  Ca: { name: 'Calcium', mass: 40.078 },
  Fe: { name: 'Iron', mass: 55.845 },
  Cu: { name: 'Copper', mass: 63.546 },
  Zn: { name: 'Zinc', mass: 65.380 },
  Br: { name: 'Bromine', mass: 79.904 },
  Ag: { name: 'Silver', mass: 107.868 },
  I: { name: 'Iodine', mass: 126.904 },
  Au: { name: 'Gold', mass: 196.967 },
  Hg: { name: 'Mercury', mass: 200.590 },
  Pb: { name: 'Lead', mass: 207.200 },
};

function parseFormula(formula: string): { element: string; count: number }[] | null {
  const elements: { element: string; count: number }[] = [];
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const el = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    if (!ELEMENTS[el]) return null;
    const existing = elements.find(e => e.element === el);
    if (existing) existing.count += count;
    else elements.push({ element: el, count });
  }
  return elements.length > 0 ? elements : null;
}

interface Result {
  elements: { element: string; count: number }[];
  totalMass: number;
}

export default function MolarMass() {
  const tool = getToolById('molar-mass')!;
  const [formula, setFormula] = useState('');

  const result = useMemo<Result | null>(() => {
    if (!formula.trim()) return null;
    const elements = parseFormula(formula.trim());
    if (!elements) return null;
    const totalMass = elements.reduce((sum, el) => sum + ELEMENTS[el.element].mass * el.count, 0);
    return { elements, totalMass };
  }, [formula]);

  const parsed = parseFormula(formula.trim());

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Chemical Formula</label>
            <Input type="text" value={formula} onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., H2O, NaCl, C6H12O6, H2SO4" className="font-mono text-lg" />
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6 text-center">
              <FlaskConical className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-4xl font-bold">{result.totalMass.toFixed(4)}</p>
              <p className="text-sm text-muted-foreground mt-1">g/mol</p>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-2 text-left">Element</th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-right">Atomic Mass</th>
                    <th className="px-4 py-2 text-right">Count</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.elements.map((el) => (
                    <tr key={el.element} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2">{ELEMENTS[el.element].name}</td>
                      <td className="px-4 py-2 font-bold">{el.element}</td>
                      <td className="px-4 py-2 text-right font-mono">{ELEMENTS[el.element].mass.toFixed(3)}</td>
                      <td className="px-4 py-2 text-right">{el.count}</td>
                      <td className="px-4 py-2 text-right font-mono">{(ELEMENTS[el.element].mass * el.count).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-bold">
                    <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2 text-right">{result.totalMass.toFixed(4)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {!result && formula.trim() && parsed === null && <p className="text-destructive text-sm">Unknown element in formula. Supported: common elements.</p>}
      </div>
    </ToolLayout>
  );
}
