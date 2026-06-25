import { useState, useMemo } from 'react';
import { Plus, Trash2, FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

function genId() { return Math.random().toString(36).substring(2, 9); }

interface ServiceRow {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

export default function ProposalGenerator() {
  const tool = getToolById('proposal-generator')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [services, setServices] = useState<ServiceRow[]>([
    { id: genId(), description: '', hours: 1, rate: 0 },
  ]);

  const total = useMemo(
    () => services.reduce((sum, s) => sum + s.hours * s.rate, 0),
    [services]
  );

  const updateService = (id: string, field: keyof ServiceRow, value: string | number) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addService = () => {
    setServices(prev => [...prev, { id: genId(), description: '', hours: 1, rate: 0 }]);
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Proposal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl border mb-2">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </div>
            <div>
              <Label>Client Name</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Corp." />
            </div>
            <div>
              <Label>Project Title</Label>
              <Input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Website Redesign" />
            </div>
            <div>
              <Label className="mb-2 block">Services</Label>
              {services.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 mb-2 items-end">
                  <div className="col-span-5">
                    <Label className="text-xs">Description</Label>
                    <Input value={s.description} onChange={e => updateService(s.id, 'description', e.target.value)} placeholder="Service name" />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Hours</Label>
                    <Input type="number" min={0} step={0.5} value={s.hours} onChange={e => updateService(s.id, 'hours', Number(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Rate ({sym})</Label>
                    <Input type="number" min={0} step={1} value={s.rate} onChange={e => updateService(s.id, 'rate', Number(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <div className="text-sm font-medium">{sym}{(s.hours * s.rate).toFixed(0)}</div>
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    {services.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeService(s.id)}><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addService} className="mt-1">
                <Plus className="w-4 h-4 mr-1" />Add Service
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Proposal Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-sm space-y-4">
              {projectTitle && <h2 className="text-xl font-bold">{projectTitle}</h2>}
              {clientName && <p className="text-gray-600"><strong>Client:</strong> {clientName}</p>}
              {services.some(s => s.description) && (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1">Service</th>
                      <th className="py-1">Hours</th>
                      <th className="py-1">Rate</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.filter(s => s.description).map(s => (
                      <tr key={s.id} className="border-b">
                        <td className="py-1">{s.description}</td>
                        <td className="py-1">{s.hours}</td>
                        <td className="py-1">{formatCurrencyFixed(s.rate, currency, 2)}</td>
                        <td className="py-1 text-right">{formatCurrencyFixed(s.hours * s.rate, currency, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrencyFixed(total, currency, 2)}</span>
              </div>
            </div>
            <Button className="mt-4" disabled>
              <FileDown className="w-4 h-4 mr-2" />Download PDF (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
