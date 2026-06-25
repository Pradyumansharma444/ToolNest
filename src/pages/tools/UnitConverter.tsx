import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type Category = 'length' | 'mass' | 'temperature' | 'area' | 'volume' | 'speed';

interface UnitDef {
  value: number;
  label: string;
}

const UNITS: Record<Category, Record<string, UnitDef>> = {
  length: {
    m: { value: 1, label: 'Meters' },
    km: { value: 1000, label: 'Kilometers' },
    cm: { value: 0.01, label: 'Centimeters' },
    mm: { value: 0.001, label: 'Millimeters' },
    mi: { value: 1609.34, label: 'Miles' },
    yd: { value: 0.9144, label: 'Yards' },
    ft: { value: 0.3048, label: 'Feet' },
    in: { value: 0.0254, label: 'Inches' },
  },
  mass: {
    kg: { value: 1, label: 'Kilograms' },
    g: { value: 0.001, label: 'Grams' },
    mg: { value: 0.000001, label: 'Milligrams' },
    lb: { value: 0.453592, label: 'Pounds' },
    oz: { value: 0.0283495, label: 'Ounces' },
    st: { value: 6.35029, label: 'Stones' },
  },
  temperature: {
    c: { value: 1, label: 'Celsius' },
    f: { value: 1, label: 'Fahrenheit' },
    k: { value: 1, label: 'Kelvin' },
  },
  area: {
    sqm: { value: 1, label: 'Square Meters' },
    sqkm: { value: 1000000, label: 'Square Kilometers' },
    sqft: { value: 0.092903, label: 'Square Feet' },
    acre: { value: 4046.86, label: 'Acres' },
    ha: { value: 10000, label: 'Hectares' },
  },
  volume: {
    l: { value: 1, label: 'Liters' },
    ml: { value: 0.001, label: 'Milliliters' },
    gal: { value: 3.78541, label: 'Gallons (US)' },
    qt: { value: 0.946353, label: 'Quarts' },
    cup: { value: 0.236588, label: 'Cups' },
    floz: { value: 0.0295735, label: 'Fluid Ounces' },
  },
  speed: {
    mps: { value: 1, label: 'Meters/Second' },
    kph: { value: 0.277778, label: 'Km/Hour' },
    mph: { value: 0.44704, label: 'Miles/Hour' },
    knot: { value: 0.514444, label: 'Knots' },
  },
};

export default function UnitConverter() {
  const tool = getToolById('unit-converter')!;
  const [category, setCategory] = useState<Category>('length');
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');

  const units = UNITS[category];
  const unitKeys = Object.keys(units);

  const result = useMemo(() => {
    if (category === 'temperature') {
      const num = Number(value);
      if (isNaN(num)) return 0;
      // Convert to Celsius first
      let celsius: number;
      if (fromUnit === 'c') celsius = num;
      else if (fromUnit === 'f') celsius = (num - 32) * 5 / 9;
      else celsius = num - 273.15;

      // Convert from Celsius
      if (toUnit === 'c') return celsius;
      if (toUnit === 'f') return celsius * 9 / 5 + 32;
      return celsius + 273.15;
    }

    const fromFactor = units[fromUnit]?.value || 1;
    const toFactor = units[toUnit]?.value || 1;
    return (Number(value) * fromFactor) / toFactor;
  }, [value, fromUnit, toUnit, category, units]);

  const categories: { value: Category; label: string }[] = [
    { value: 'length', label: 'Length' },
    { value: 'mass', label: 'Mass' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'area', label: 'Area' },
    { value: 'volume', label: 'Volume' },
    { value: 'speed', label: 'Speed' },
  ];

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const keys = Object.keys(UNITS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        {/* Category */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <Button
              key={c.value}
              variant={category === c.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          {/* Value */}
          <div>
            <label className="text-sm font-medium">Value</label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="text-lg"
            />
          </div>

          {/* Units */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="text-sm font-medium">From</label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {unitKeys.map(u => <SelectItem key={u} value={u}>{units[u].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground mb-2" />
            <div>
              <label className="text-sm font-medium">To</label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {unitKeys.map(u => <SelectItem key={u} value={u}>{units[u].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result */}
          <div className="text-center py-4 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
            <p className="text-sm text-muted-foreground mt-1">{units[toUnit]?.label}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
