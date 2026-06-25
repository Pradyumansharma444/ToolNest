import { useState, useMemo } from 'react';
import { FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { getStoredCurrency, setStoredCurrency, formatCurrencyFixed, type Currency } from '@/lib/currencies';

export default function SalarySlip() {
  const tool = getToolById('salary-slip')!;
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setStoredCurrency(c);
  };

  const sym = currency.symbol;

  const [employeeName, setEmployeeName] = useState('');
  const [designation, setDesignation] = useState('');
  const [basicPay, setBasicPay] = useState('');
  const [hra, setHra] = useState('');
  const [da, setDa] = useState('');
  const [otherAllowances, setOtherAllowances] = useState('');
  const [tax, setTax] = useState('');
  const [insurance, setInsurance] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');

  const earnings = useMemo(() => {
    const bp = parseFloat(basicPay) || 0;
    const h = parseFloat(hra) || 0;
    const d = parseFloat(da) || 0;
    const oa = parseFloat(otherAllowances) || 0;
    return { basicPay: bp, hra: h, da: d, otherAllowances: oa, total: bp + h + d + oa };
  }, [basicPay, hra, da, otherAllowances]);

  const deductions = useMemo(() => {
    const t = parseFloat(tax) || 0;
    const ins = parseFloat(insurance) || 0;
    const od = parseFloat(otherDeductions) || 0;
    return { tax: t, insurance: ins, otherDeductions: od, total: t + ins + od };
  }, [tax, insurance, otherDeductions]);

  const netPay = earnings.total - deductions.total;

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Employee Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-xl border mb-2">
              <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Name</Label>
                <Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Software Engineer" />
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold">Earnings</Label>
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Basic Pay ({sym})</Label>
                    <Input type="number" value={basicPay} onChange={e => setBasicPay(e.target.value)} placeholder="5000" />
                  </div>
                  <div>
                    <Label>HRA ({sym})</Label>
                    <Input type="number" value={hra} onChange={e => setHra(e.target.value)} placeholder="2000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>DA ({sym})</Label>
                    <Input type="number" value={da} onChange={e => setDa(e.target.value)} placeholder="500" />
                  </div>
                  <div>
                    <Label>Other Allowances ({sym})</Label>
                    <Input type="number" value={otherAllowances} onChange={e => setOtherAllowances(e.target.value)} placeholder="300" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold">Deductions</Label>
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tax ({sym})</Label>
                    <Input type="number" value={tax} onChange={e => setTax(e.target.value)} placeholder="800" />
                  </div>
                  <div>
                    <Label>Insurance ({sym})</Label>
                    <Input type="number" value={insurance} onChange={e => setInsurance(e.target.value)} placeholder="150" />
                  </div>
                </div>
                <div>
                  <Label>Other Deductions ({sym})</Label>
                  <Input type="number" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} placeholder="50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Salary Slip Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-sm space-y-3">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold">SALARY SLIP</h2>
                <p className="text-xs text-gray-500">Monthly Payslip</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong>Employee:</strong> {employeeName || '—'}</div>
                <div><strong>Designation:</strong> {designation || '—'}</div>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Earnings</th>
                    <th className="text-right py-1">Amount ({sym})</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.basicPay > 0 && <tr><td className="py-0.5">Basic Pay</td><td className="text-right">{earnings.basicPay.toFixed(2)}</td></tr>}
                  {earnings.hra > 0 && <tr><td className="py-0.5">HRA</td><td className="text-right">{earnings.hra.toFixed(2)}</td></tr>}
                  {earnings.da > 0 && <tr><td className="py-0.5">DA</td><td className="text-right">{earnings.da.toFixed(2)}</td></tr>}
                  {earnings.otherAllowances > 0 && <tr><td className="py-0.5">Other Allowances</td><td className="text-right">{earnings.otherAllowances.toFixed(2)}</td></tr>}
                  <tr className="border-t font-bold"><td className="py-1">Total Earnings</td><td className="text-right">{earnings.total.toFixed(2)}</td></tr>
                </tbody>
              </table>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Deductions</th>
                    <th className="text-right py-1">Amount ({sym})</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.tax > 0 && <tr><td className="py-0.5">Tax</td><td className="text-right">{deductions.tax.toFixed(2)}</td></tr>}
                  {deductions.insurance > 0 && <tr><td className="py-0.5">Insurance</td><td className="text-right">{deductions.insurance.toFixed(2)}</td></tr>}
                  {deductions.otherDeductions > 0 && <tr><td className="py-0.5">Other Deductions</td><td className="text-right">{deductions.otherDeductions.toFixed(2)}</td></tr>}
                  <tr className="border-t font-bold"><td className="py-1">Total Deductions</td><td className="text-right">{deductions.total.toFixed(2)}</td></tr>
                </tbody>
              </table>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Net Pay</span>
                <span>{formatCurrencyFixed(netPay, currency, 2)}</span>
              </div>
              {netPay < 0 && <p className="text-xs text-red-500">Deductions exceed earnings!</p>}
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
