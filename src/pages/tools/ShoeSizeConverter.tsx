import { useState, useMemo } from 'react';
import { Footprints } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import type { Tool } from '@/types';

interface SizeRow {
  us: string;
  uk: string;
  eu: string;
  jp: string; // cm
  cn: string; // Mondopoint
  kr: string; // mm
}

const MENS_SIZES: SizeRow[] = [
  { us: '6.0', uk: '5.5', eu: '39', jp: '24.0', cn: '240', kr: '240' },
  { us: '6.5', uk: '6.0', eu: '39.5', jp: '24.5', cn: '245', kr: '245' },
  { us: '7.0', uk: '6.5', eu: '40', jp: '25.0', cn: '250', kr: '250' },
  { us: '7.5', uk: '7.0', eu: '40.5', jp: '25.5', cn: '255', kr: '255' },
  { us: '8.0', uk: '7.5', eu: '41', jp: '26.0', cn: '260', kr: '260' },
  { us: '8.5', uk: '8.0', eu: '41.5', jp: '26.5', cn: '265', kr: '265' },
  { us: '9.0', uk: '8.5', eu: '42', jp: '27.0', cn: '270', kr: '270' },
  { us: '9.5', uk: '9.0', eu: '42.5', jp: '27.5', cn: '275', kr: '275' },
  { us: '10.0', uk: '9.5', eu: '43', jp: '28.0', cn: '280', kr: '280' },
  { us: '10.5', uk: '10.0', eu: '44', jp: '28.5', cn: '285', kr: '285' },
  { us: '11.0', uk: '10.5', eu: '44.5', jp: '29.0', cn: '290', kr: '290' },
  { us: '11.5', uk: '11.0', eu: '45', jp: '29.5', cn: '295', kr: '295' },
  { us: '12.0', uk: '11.5', eu: '45.5', jp: '30.0', cn: '300', kr: '300' },
  { us: '13.0', uk: '12.5', eu: '47.3', jp: '31.0', cn: '310', kr: '310' },
  { us: '14.0', uk: '13.5', eu: '48.5', jp: '32.0', cn: '320', kr: '320' },
];

const WOMENS_SIZES: SizeRow[] = [
  { us: '5.0', uk: '3.0', eu: '35.5', jp: '21.5', cn: '215', kr: '215' },
  { us: '5.5', uk: '3.5', eu: '36', jp: '22.0', cn: '220', kr: '220' },
  { us: '6.0', uk: '4.0', eu: '36.5', jp: '22.5', cn: '225', kr: '225' },
  { us: '6.5', uk: '4.5', eu: '37.3', jp: '23.0', cn: '230', kr: '230' },
  { us: '7.0', uk: '5.0', eu: '38', jp: '23.5', cn: '235', kr: '235' },
  { us: '7.5', uk: '5.5', eu: '38.5', jp: '24.0', cn: '240', kr: '240' },
  { us: '8.0', uk: '6.0', eu: '39', jp: '24.5', cn: '245', kr: '245' },
  { us: '8.5', uk: '6.5', eu: '39.5', jp: '25.0', cn: '250', kr: '250' },
  { us: '9.0', uk: '7.0', eu: '40', jp: '25.5', cn: '255', kr: '255' },
  { us: '9.5', uk: '7.5', eu: '40.5', jp: '26.0', cn: '260', kr: '260' },
  { us: '10.0', uk: '8.0', eu: '41', jp: '26.5', cn: '265', kr: '265' },
  { us: '10.5', uk: '8.5', eu: '42', jp: '27.0', cn: '270', kr: '270' },
  { us: '11.0', uk: '9.0', eu: '42.5', jp: '27.5', cn: '275', kr: '275' },
];

const KIDS_SIZES: SizeRow[] = [
  { us: '10C', uk: '9.5C', eu: '27', jp: '16.5', cn: '165', kr: '165' },
  { us: '11C', uk: '10.5C', eu: '28', jp: '17.0', cn: '170', kr: '170' },
  { us: '12C', uk: '11.5C', eu: '30', jp: '18.0', cn: '180', kr: '180' },
  { us: '13C', uk: '12.5C', eu: '31', jp: '19.0', cn: '190', kr: '190' },
  { us: '1Y', uk: '13.5C', eu: '32', jp: '20.0', cn: '200', kr: '200' },
  { us: '2Y', uk: '1.5Y', eu: '33.5', jp: '21.0', cn: '210', kr: '210' },
  { us: '3Y', uk: '2.5Y', eu: '35', jp: '22.0', cn: '220', kr: '220' },
  { us: '4Y', uk: '3.5Y', eu: '36', jp: '23.0', cn: '230', kr: '230' },
  { us: '5Y', uk: '4.5Y', eu: '37.5', jp: '23.5', cn: '235', kr: '235' },
];

export default function ShoeSizeConverter() {
  const tool = getToolById('shoe-size-converter') || {
    id: 'shoe-size-converter',
    name: 'Shoe Size Converter',
    description: 'Convert shoe sizes across US, UK, Europe, Japan, China, and South Korea systems.',
    metaTitle: 'International Shoe Size Converter | ToolNest',
    metaDescription: 'Convert shoe sizes for men, women, and kids. Supports standard US, UK, EU, JP (cm), CN (Mondopoint), and KR (mm) metrics.',
    category: 'calculator',
  };

  const [category, setCategory] = useState<'men' | 'women' | 'kids'>('men');
  const [selectedStandard, setSelectedStandard] = useState<'us' | 'uk' | 'eu' | 'jp' | 'cn' | 'kr'>('us');
  const [selectedValue, setSelectedValue] = useState('9.0');

  const activeDataset = useMemo(() => {
    if (category === 'men') return MENS_SIZES;
    if (category === 'women') return WOMENS_SIZES;
    return KIDS_SIZES;
  }, [category]);

  // Adjust defaults when category changes
  const handleCategoryChange = (cat: 'men' | 'women' | 'kids') => {
    setCategory(cat);
    if (cat === 'men') {
      setSelectedValue('9.0');
    } else if (cat === 'women') {
      setSelectedValue('7.0');
    } else {
      setSelectedValue('1Y');
    }
  };

  const activeRow = useMemo(() => {
    return activeDataset.find((row) => row[selectedStandard] === selectedValue) || activeDataset[0];
  }, [selectedValue, selectedStandard, activeDataset]);

  return (
    <ToolLayout tool={tool as Tool} resultVisible={true}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
          <h3 className="font-semibold text-base mb-2 font-medium">Size Selector</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground font-medium">Department</label>
              <div className="grid grid-cols-3 gap-1 bg-muted p-0.5 rounded-md border mt-1">
                {(['men', 'women', 'kids'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-1 text-[10px] font-bold rounded capitalize ${
                      category === cat ? 'bg-background text-foreground shadow' : 'text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground font-medium">Standard Type</label>
              <Select
                value={selectedStandard}
                onValueChange={(val: 'us' | 'uk' | 'eu' | 'jp' | 'cn' | 'kr') => {
                  setSelectedStandard(val);
                  // Grab value from first row of new standard
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
                  <SelectItem value="jp">Japan (JP) Size (cm)</SelectItem>
                  <SelectItem value="cn">China (CN) Size</SelectItem>
                  <SelectItem value="kr">Korea (KR) Size (mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground font-medium">Select Size</label>
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeDataset.map((row) => (
                    <SelectItem key={row[selectedStandard]} value={row[selectedStandard]}>
                      {row[selectedStandard]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Sizing Grid cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground">Equivalent Shoe Sizes</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'US Standard', key: 'us', extra: '' },
                { name: 'UK Standard', key: 'uk', extra: '' },
                { name: 'Europe (EU)', key: 'eu', extra: '' },
                { name: 'Japan (JP)', key: 'jp', extra: 'cm' },
                { name: 'China (CN)', key: 'cn', extra: 'Mondopoint' },
                { name: 'South Korea', key: 'kr', extra: 'mm' },
              ].map((std) => (
                <div
                  key={std.key}
                  className={`rounded-xl border bg-card p-4 text-center shadow-sm ${
                    std.key === selectedStandard ? 'border-primary ring-1 ring-primary/30' : ''
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {std.name}
                  </span>
                  <p className="text-2xl font-extrabold mt-1 text-foreground">
                    {activeRow[std.key as keyof SizeRow]}
                  </p>
                  {std.extra && <p className="text-[9px] text-muted-foreground mt-0.5">{std.extra}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Reference Table */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h4 className="font-semibold text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
              <Footprints className="w-4 h-4 text-primary" /> International Shoe Sizing Table
            </h4>
            <div className="max-h-60 overflow-y-auto pr-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b text-muted-foreground font-semibold">
                    <th className="py-2">US</th>
                    <th className="py-2">UK</th>
                    <th className="py-2">EU</th>
                    <th className="py-2">JP (cm)</th>
                    <th className="py-2">CN</th>
                    <th className="py-2">KR (mm)</th>
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
                        <td className="py-1.5">{row.us}</td>
                        <td className="py-1.5">{row.uk}</td>
                        <td className="py-1.5">{row.eu}</td>
                        <td className="py-1.5">{row.jp}</td>
                        <td className="py-1.5">{row.cn}</td>
                        <td className="py-1.5">{row.kr}</td>
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
