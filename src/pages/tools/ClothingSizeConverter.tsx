/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Shirt } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface SizeRow {
  label: string; // e.g. "Medium"
  us: string;
  uk: string;
  eu: string;
  asia: string;
  measureRange: string; // e.g. "38 - 40 in (96 - 101 cm)"
}

const MENS_SHIRTS: SizeRow[] = [
  { label: 'X-Small', us: '34', uk: '34', eu: '44', asia: 'S', measureRange: '32-34 in (81-86 cm)' },
  { label: 'Small', us: '36', uk: '36', eu: '46', asia: 'M', measureRange: '35-37 in (89-94 cm)' },
  { label: 'Medium', us: '38-40', uk: '38-40', eu: '48-50', asia: 'L', measureRange: '38-40 in (96-101 cm)' },
  { label: 'Large', us: '42', uk: '42', eu: '52', asia: 'XL', measureRange: '41-43 in (104-109 cm)' },
  { label: 'X-Large', us: '44', uk: '44', eu: '54', asia: 'XXL', measureRange: '44-46 in (112-117 cm)' },
  { label: 'XX-Large', us: '46', uk: '46', eu: '56', asia: '3XL', measureRange: '47-49 in (119-124 cm)' },
];

const WOMENS_DRESSES: SizeRow[] = [
  { label: 'XX-Small', us: '0', uk: '4', eu: '32', asia: 'XS', measureRange: 'Bust 30 in (76 cm)' },
  { label: 'X-Small', us: '2', uk: '6', eu: '34', asia: 'S', measureRange: 'Bust 31.5 in (80 cm)' },
  { label: 'Small', us: '4-6', uk: '8-10', eu: '36-38', asia: 'M', measureRange: 'Bust 33-34 in (84-88 cm)' },
  { label: 'Medium', us: '8-10', uk: '12-14', eu: '40-42', asia: 'L', measureRange: 'Bust 36-38 in (92-96 cm)' },
  { label: 'Large', us: '12-14', uk: '16-18', eu: '44-46', asia: 'XL', measureRange: 'Bust 40-42 in (100-104 cm)' },
  { label: 'X-Large', us: '16', uk: '20', eu: '48', asia: 'XXL', measureRange: 'Bust 44 in (110 cm)' },
];

const MENS_PANTS: SizeRow[] = [
  { label: 'Small', us: '28-30', uk: '28-30', eu: '44-46', asia: 'M', measureRange: 'Waist 28-30 in (71-76 cm)' },
  { label: 'Medium', us: '32-34', uk: '32-34', eu: '48-50', asia: 'L', measureRange: 'Waist 32-34 in (81-86 cm)' },
  { label: 'Large', us: '36-38', uk: '36-38', eu: '52-54', asia: 'XL', measureRange: 'Waist 36-38 in (91-96 cm)' },
  { label: 'X-Large', us: '40-42', uk: '40-42', eu: '56-58', asia: 'XXL', measureRange: 'Waist 40-42 in (101-106 cm)' },
];

export default function ClothingSizeConverter() {
  const tool = getToolById('clothing-size-converter') || {
    id: 'clothing-size-converter',
    name: 'Clothing Size Converter',
    description: 'Convert garment sizes between US, UK, European, and Asian size standards.',
    metaTitle: 'International Clothing Size Converter | ToolNest',
    metaDescription: 'Convert sizes for shirts, dresses, and trousers across US, UK, EU, and Asia measurements.',
    category: 'calculator',
  };

  const [garment, setGarment] = useState<'men-shirts' | 'women-dresses' | 'men-pants'>('men-shirts');
  const [selectedStandard, setSelectedStandard] = useState<'us' | 'uk' | 'eu' | 'asia'>('us');
  const [selectedValue, setSelectedValue] = useState('38-40');

  const activeDataset = useMemo(() => {
    if (garment === 'men-shirts') return MENS_SHIRTS;
    if (garment === 'women-dresses') return WOMENS_DRESSES;
    return MENS_PANTS;
  }, [garment]);

  const handleGarmentChange = (g: 'men-shirts' | 'women-dresses' | 'men-pants') => {
    setGarment(g);
    if (g === 'men-shirts') {
      setSelectedValue('38-40');
    } else if (g === 'women-dresses') {
      setSelectedValue('8-10');
    } else {
      setSelectedValue('32-34');
    }
  };

  const activeRow = useMemo(() => {
    return activeDataset.find((row) => row[selectedStandard] === selectedValue) || activeDataset[0];
  }, [selectedValue, selectedStandard, activeDataset]);

  return (
    <ToolLayout tool={tool as any} resultVisible={true}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
          <h3 className="font-semibold text-base mb-2 font-medium">Garment Selector</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Garment Type</label>
              <Select value={garment} onValueChange={(val) => handleGarmentChange(val as 'men-shirts' | 'women-dresses' | 'men-pants')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men-shirts">Men's Shirts & Tops</SelectItem>
                  <SelectItem value="women-dresses">Women's Dresses & Tops</SelectItem>
                  <SelectItem value="men-pants">Men's Pants / Trousers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Standard Type</label>
              <Select
                value={selectedStandard}
                onValueChange={(val: 'us' | 'uk' | 'eu' | 'asia') => {
                  setSelectedStandard(val);
                  setSelectedValue(activeDataset[0][val as keyof SizeRow]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">US Size</SelectItem>
                  <SelectItem value="uk">UK Size</SelectItem>
                  <SelectItem value="eu">Europe (EU) Size</SelectItem>
                  <SelectItem value="asia">Asia Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Select Size</label>
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeDataset.map((row) => (
                    <SelectItem key={row[selectedStandard]} value={row[selectedStandard]}>
                      {row[selectedStandard]} ({row.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Equivalent Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground">Equivalent Garment Sizes</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'United States (US)', key: 'us' },
                { name: 'United Kingdom (UK)', key: 'uk' },
                { name: 'Europe (EU)', key: 'eu' },
                { name: 'Asia / International', key: 'asia' },
              ].map((std) => (
                <div
                  key={std.key}
                  className={`rounded-xl border bg-card p-4 flex justify-between items-center shadow-sm ${
                    std.key === selectedStandard ? 'border-primary ring-1 ring-primary/30' : ''
                  }`}
                >
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {std.name}
                    </span>
                    <p className="text-xl font-extrabold mt-1 text-foreground">
                      {activeRow[std.key as keyof SizeRow]}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted border">
                    {activeRow.label}
                  </span>
                </div>
              ))}
            </div>
            {activeRow.measureRange && (
              <div className="rounded-xl border bg-card p-4 text-center text-xs font-medium text-muted-foreground">
                Typical Body Measurement Range: <span className="font-semibold text-foreground">{activeRow.measureRange}</span>
              </div>
            )}
          </div>

          {/* Reference Table */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h4 className="font-semibold text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <Shirt className="w-4 h-4 text-primary" /> Garment Sizing Reference Chart
            </h4>
            <div className="max-h-60 overflow-y-auto pr-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b text-muted-foreground font-semibold">
                    <th className="py-2">Fit Label</th>
                    <th className="py-2">US</th>
                    <th className="py-2">UK</th>
                    <th className="py-2">EU</th>
                    <th className="py-2">Asia</th>
                    <th className="py-2">Measurements</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeDataset.map((row, idx) => {
                    const isSelected = row[selectedStandard] === selectedValue;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-muted/30 ${
                          isSelected ? 'bg-primary/5 font-semibold text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <td className="py-2 font-medium text-foreground">{row.label}</td>
                        <td className="py-2">{row.us}</td>
                        <td className="py-2">{row.uk}</td>
                        <td className="py-2">{row.eu}</td>
                        <td className="py-2">{row.asia}</td>
                        <td className="py-2 text-[10px]">{row.measureRange}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
