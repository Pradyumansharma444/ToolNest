import { useState, useMemo } from 'react';
import { UserPlus, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const FIELDS: { value: string; label: string; generator: () => string }[] = [
  { value: 'firstName', label: 'First Name', generator: () => ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah'][Math.floor(Math.random() * 10)] },
  { value: 'lastName', label: 'Last Name', generator: () => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][Math.floor(Math.random() * 10)] },
  { value: 'email', label: 'Email', generator: () => `user${Math.floor(Math.random() * 9999)}@example.com` },
  { value: 'phone', label: 'Phone', generator: () => `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` },
  { value: 'company', label: 'Company', generator: () => ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Soylent Corp'][Math.floor(Math.random() * 10)] },
  { value: 'address', label: 'Address', generator: () => `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Elm', 'Maple', 'Pine', 'Cedar', 'Washington', 'Park'][Math.floor(Math.random() * 8)]} St` },
  { value: 'city', label: 'City', generator: () => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'][Math.floor(Math.random() * 10)] },
  { value: 'country', label: 'Country', generator: () => ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'][Math.floor(Math.random() * 10)] },
  { value: 'jobTitle', label: 'Job Title', generator: () => ['Engineer', 'Designer', 'Manager', 'Developer', 'Analyst', 'Director', 'Coordinator', 'Specialist', 'Consultant', 'Administrator'][Math.floor(Math.random() * 10)] },
  { value: 'age', label: 'Age', generator: () => String(Math.floor(Math.random() * 50) + 18) },
  { value: 'uuid', label: 'UUID', generator: () => `${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}` },
];

export default function FakeData() {
  const tool = getToolById('fake-data')!;
  const { toast } = useToast();
  const [selectedFields, setSelectedFields] = useState<string[]>(['firstName', 'lastName', 'email']);
  const [rowCount, setRowCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const generateData = useMemo(() => {
    if (selectedFields.length === 0) return '';

    // Pseudo-random with seed
    let s = seed;
    const rand = () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };

    const fieldGenerators = FIELDS.filter(f => selectedFields.includes(f.value));

    if (outputFormat === 'csv') {
      const header = fieldGenerators.map(f => f.label).join(',');
      const rows = [];
      for (let i = 0; i < rowCount; i++) {
        // Reset seed per row for deterministic output
        s = seed + i * 1000;
        const row = fieldGenerators.map(() => {
          // Use the generator but with our seeded random
          const idx = Math.floor(rand() * 10);
          const generators: Record<string, (idx: number) => string> = {
            firstName: (i) => ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah'][i % 10],
            lastName: (i) => ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10],
            email: (i) => `user${i * 17}@example.com`,
            phone: (i) => `+1 (${(i * 13) % 900 + 100}) ${(i * 7) % 900 + 100}-${(i * 3) % 9000 + 1000}`,
            company: (i) => ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Soylent Corp'][i % 10],
            address: (i) => `${(i * 5) % 9999 + 1} ${['Main', 'Oak', 'Elm', 'Maple', 'Pine', 'Cedar', 'Washington', 'Park'][(i * 3) % 8]} St`,
            city: (i) => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'][i % 10],
            country: (i) => ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'][i % 10],
            jobTitle: (i) => ['Engineer', 'Designer', 'Manager', 'Developer', 'Analyst', 'Director', 'Coordinator', 'Specialist', 'Consultant', 'Administrator'][i % 10],
            age: (i) => String((i * 7) % 50 + 18),
            uuid: (i) => `id-${i}-${Math.random().toString(36).substring(2, 8)}`,
          };
          const val = generators[fieldGenerators[0]?.value || 'firstName']?.(idx) || '';
          return `"${val}"`;
        });
        rows.push(row.join(','));
      }
      return [header, ...rows].join('\n');
    } else {
      const result = [];
      for (let i = 0; i < rowCount; i++) {
        s = seed + i * 1000;
        const row: Record<string, string> = {};
        fieldGenerators.forEach(f => {
          row[f.label] = f.generator();
        });
        result.push(row);
      }
      return JSON.stringify(result, null, 2);
    }
  }, [selectedFields, rowCount, outputFormat, seed]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const downloadData = () => {
    const mimeType = outputFormat === 'csv' ? 'text/csv' : 'application/json';
    const filename = `fake-data.${outputFormat}`;
    downloadFile(generateData, filename, mimeType);
    toast({ title: 'Downloaded!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={generateData.length > 0}>
      <div className="space-y-6">
        {/* Fields */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Fields</label>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map(f => (
              <Button
                key={f.value}
                variant={selectedFields.includes(f.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleField(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Row count */}
        <div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Number of Rows: {rowCount}</span>
          </div>
          <Slider value={[rowCount]} onValueChange={(v) => setRowCount(v[0])} min={1} max={1000} step={1} className="mt-2" />
        </div>

        {/* Format */}
        <div className="flex gap-2">
          <Button variant={outputFormat === 'csv' ? 'default' : 'outline'} size="sm" onClick={() => setOutputFormat('csv')}>
            CSV
          </Button>
          <Button variant={outputFormat === 'json' ? 'default' : 'outline'} size="sm" onClick={() => setOutputFormat('json')}>
            JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSeed(Date.now())}>
            <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
          </Button>
        </div>

        {/* Output */}
        {selectedFields.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span className="font-medium">Generated Data</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadData}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono">{generateData}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
