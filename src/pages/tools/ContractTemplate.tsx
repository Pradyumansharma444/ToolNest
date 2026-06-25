import { useState, useMemo } from 'react';
import { FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContractTemplate() {
  const tool = getToolById('contract-template')!;
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [scope, setScope] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  const preview = useMemo(() => {
    return `FREELANCE SERVICES AGREEMENT

Date: ${date || '[Date]'}

Between:
${party1 || '[Party 1 Name]'} ("Client")

And:
${party2 || '[Party 2 Name]'} ("Contractor")

1. SCOPE OF WORK
${scope || '[Describe the services to be provided]'}

2. PAYMENT TERMS
${paymentTerms || '[Describe payment terms, rate, schedule]'}

3. ADDITIONAL TERMS
${additionalTerms || '[Any additional terms]'}

4. GENERAL PROVISIONS
This agreement shall be governed by applicable laws.
Both parties agree to the terms and conditions stated above.

_________________________          _________________________
Signature (Client)                 Signature (Contractor)
${party1 || '[Client Name]'}                ${party2 || '[Contractor Name]'}`;
  }, [party1, party2, date, scope, paymentTerms, additionalTerms]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client Name</Label>
              <Input value={party1} onChange={e => setParty1(e.target.value)} placeholder="Acme Corp." />
            </div>
            <div>
              <Label>Contractor / Freelancer Name</Label>
              <Input value={party2} onChange={e => setParty2(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Scope of Work</Label>
              <Textarea value={scope} onChange={e => setScope(e.target.value)} placeholder="Describe the services to be provided..." rows={3} />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="$5,000 flat fee, 50% upfront, 50% upon completion" rows={2} />
            </div>
            <div>
              <Label>Additional Terms</Label>
              <Textarea value={additionalTerms} onChange={e => setAdditionalTerms(e.target.value)} placeholder="Confidentiality, deadlines, revisions..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contract Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {preview}
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
