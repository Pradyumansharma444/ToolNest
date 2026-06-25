import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function RentReceipt() {
  const tool = getToolById('rent-receipt')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [tenantName, setTenantName] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth().toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptNo, setReceiptNo] = useState(() => `RCPT-${Date.now().toString(36).toUpperCase()}`);

  const monthName = MONTHS[parseInt(month)] || '';

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Receipt Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl border mb-2">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </div>
            <div>
              <Label>Receipt Number</Label>
              <Input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} />
            </div>
            <div>
              <Label>Tenant Name</Label>
              <Input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <Label>Landlord Name</Label>
              <Input value={landlordName} onChange={e => setLandlordName(e.target.value)} placeholder="Jane Properties LLC" />
            </div>
            <div>
              <Label>Property Address</Label>
              <Input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="123 Main St, Apt 4B" />
            </div>
            <div>
              <Label>Rent Amount ({sym})</Label>
              <Input type="number" value={rentAmount} onChange={e => setRentAmount(e.target.value)} placeholder="1500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receipt Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-sm space-y-3">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold">RENT RECEIPT</h2>
                <p className="text-xs text-gray-500">Receipt #: {receiptNo}</p>
              </div>
              <div className="space-y-2 text-xs">
                <p><strong>Tenant:</strong> {tenantName || '—'}</p>
                <p><strong>Landlord:</strong> {landlordName || '—'}</p>
                <p><strong>Property:</strong> {propertyAddress || '—'}</p>
                <p><strong>Month:</strong> {monthName}</p>
                <p><strong>Payment Date:</strong> {paymentDate}</p>
                <div className="border-t pt-2 mt-2 text-center">
                  <p className="text-lg font-bold">{formatCurrencyFixed(parseFloat(rentAmount || '0'), currency, 2)}</p>
                  <p className="text-xs text-gray-500">Rent Amount</p>
                </div>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between text-xs">
                <div>
                  <p>Landlord Signature</p>
                  <div className="h-8 border-b w-32 mt-1" />
                </div>
                <div className="text-right">
                  <p>Tenant Signature</p>
                  <div className="h-8 border-b w-32 mt-1 ml-auto" />
                </div>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">This is a computer-generated receipt.</p>
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
