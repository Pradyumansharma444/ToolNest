import { useState, useEffect, useMemo } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { downloadBlob, uint8ToBlob } from '@/lib/utils';
import { Plus, Trash2, FileDown, History, Save, RefreshCw } from 'lucide-react';
import { CurrencySelector } from '@/components/tools/CurrencySelector';
import { CURRENCIES } from '@/lib/currencies';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  from: { name: string; email: string; address: string; phone: string };
  to: { name: string; email: string; address: string };
  items: { id: string; description: string; quantity: number; rate: number }[];
  taxRate: number;
  discount: number;
  currency: string;
  notes: string;
  paymentTerms: string;
}

interface InvoiceSession {
  id: string;
  name: string;
  data: InvoiceData;
  logoDataUrl: string | null;
  updatedAt: number;
}

const defaultData: InvoiceData = {
  invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  from: { name: '', email: '', address: '', phone: '' },
  to: { name: '', email: '', address: '' },
  items: [],
  taxRate: 0,
  discount: 0,
  currency: 'USD',
  notes: '',
  paymentTerms: 'Payment due within 30 days',
};

function generateId() { return Math.random().toString(36).substring(2, 9); }

export default function InvoiceGenerator() {
  const tool = getToolById('invoice-generator')!;

  // Restore states from localStorage on init with fallback for legacy key
  const [data, setData] = useState<InvoiceData>(() => {
    try {
      const activeState = localStorage.getItem('invoice_generator_active_state');
      if (activeState) return JSON.parse(activeState).data ?? defaultData;

      const legacy = localStorage.getItem('invoice-generator-data');
      if (legacy) return { ...defaultData, ...JSON.parse(legacy) };
    } catch { /* ignore */ }
    return defaultData;
  });

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(() => {
    try {
      const activeState = localStorage.getItem('invoice_generator_active_state');
      if (activeState) return JSON.parse(activeState).logoDataUrl ?? null;
    } catch { /* ignore */ }
    return null;
  });

  const [sessions, setSessions] = useState<InvoiceSession[]>(() => {
    try {
      const saved = localStorage.getItem('invoice_generator_saved_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('invoice_generator_active_session_id') || null;
    } catch { return null; }
  });

  // Auto-save active workspace state
  useEffect(() => {
    const state = { data, logoDataUrl };
    localStorage.setItem('invoice_generator_active_state', JSON.stringify(state));
  }, [data, logoDataUrl]);

  // Sync saved sessions to localStorage
  useEffect(() => {
    localStorage.setItem('invoice_generator_saved_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('invoice_generator_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('invoice_generator_active_session_id');
    }
  }, [activeSessionId]);

  const currency = CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const grandTotal = subtotal + taxAmount - data.discount;

  const updateFrom = (field: string, value: string) => setData(prev => ({ ...prev, from: { ...prev.from, [field]: value } }));
  const updateTo = (field: string, value: string) => setData(prev => ({ ...prev, to: { ...prev.to, [field]: value } }));

  const addItem = () => setData(prev => ({ ...prev, items: [...prev.items, { id: generateId(), description: '', quantity: 1, rate: 0 }] }));
  const updateItem = (id: string, field: string, value: string | number) => {
    setData(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, [field]: field === 'quantity' || field === 'rate' ? Number(value) || 0 : value } : item) }));
  };
  const removeItem = (id: string) => setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownloadPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    let y = height - 50;

    let currentPage = page;

    const checkPageOverflow = (needed: number) => {
      if (y - needed < 50) {
        currentPage = pdfDoc.addPage([612, 792]);
        y = 792 - 50;
        currentPage.drawText('INVOICE (cont.)', { x: 50, y: y - 10, size: 9, font: helveticaBold, color: rgb(0.5, 0.5, 0.5) });
        y -= 20;
        currentPage.drawLine({ start: { x: 50, y }, end: { x: 612 - 50, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
        y -= 15;
      }
    };

    const drawAt = (text: string, size: number, x: number, yPos: number, opts?: { bold?: boolean; color?: ReturnType<typeof rgb> }) => {
      const font = opts?.bold ? helveticaBold : helvetica;
      currentPage.drawText(text, { x, y: yPos - size, size, font, color: opts?.color ?? rgb(0, 0, 0) });
    };

    const drawRight = (text: string, size: number, rightX: number, yPos: number, opts?: { bold?: boolean; color?: ReturnType<typeof rgb> }) => {
      const font = opts?.bold ? helveticaBold : helvetica;
      const textWidth = font.widthOfTextAtSize(text, size);
      currentPage.drawText(text, { x: rightX - textWidth, y: yPos - size, size, font, color: opts?.color ?? rgb(0, 0, 0) });
    };

    // Embed logo
    let logoHeightUsed = 0;
    if (logoDataUrl) {
      try {
        const base64Data = logoDataUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const isPng = logoDataUrl.includes('image/png');
        const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        
        const maxWidth = 150;
        const maxHeight = 60;
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const imgW = image.width * scale;
        const imgH = image.height * scale;
        
        currentPage.drawImage(image, {
          x: width - 50 - imgW,
          y: height - 50 - imgH,
          width: imgW,
          height: imgH
        });
        logoHeightUsed = imgH;
      } catch (err) {
        console.error('Failed to embed logo:', err);
      }
    }

    // Title & Invoice Details on the left (x = 50)
    let titleY = height - 50;
    currentPage.drawText('INVOICE', { x: 50, y: titleY - 28, size: 28, font: helveticaBold, color: rgb(0.15, 0.3, 0.7) });
    titleY -= 36;

    currentPage.drawText(`Invoice #: ${data.invoiceNumber}`, { x: 50, y: titleY - 10, size: 10, font: helvetica });
    titleY -= 14;
    currentPage.drawText(`Date: ${data.invoiceDate}`, { x: 50, y: titleY - 10, size: 10, font: helvetica });
    titleY -= 14;
    currentPage.drawText(`Due Date: ${data.dueDate}`, { x: 50, y: titleY - 10, size: 10, font: helvetica });
    titleY -= 14;

    // Line below headers
    y = Math.min(titleY, height - 50 - logoHeightUsed) - 20;
    currentPage.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;

    // From & Bill To side-by-side
    checkPageOverflow(100);
    const startY = y;
    let fromY = startY;
    let toY = startY;

    currentPage.drawText('From:', { x: 50, y: fromY - 12, size: 12, font: helveticaBold });
    fromY -= 16;
    if (data.from.name) { currentPage.drawText(data.from.name, { x: 50, y: fromY - 10, size: 10, font: helvetica }); fromY -= 14; }
    if (data.from.email) { currentPage.drawText(data.from.email, { x: 50, y: fromY - 10, size: 10, font: helvetica }); fromY -= 14; }
    if (data.from.phone) { currentPage.drawText(data.from.phone, { x: 50, y: fromY - 10, size: 10, font: helvetica }); fromY -= 14; }
    if (data.from.address) {
      const addrLines = data.from.address.split('\n');
      for (const line of addrLines) {
        if (line.trim()) {
          currentPage.drawText(line, { x: 50, y: fromY - 10, size: 10, font: helvetica });
          fromY -= 14;
        }
      }
    }

    currentPage.drawText('Bill To:', { x: 350, y: toY - 12, size: 12, font: helveticaBold });
    toY -= 16;
    if (data.to.name) { currentPage.drawText(data.to.name, { x: 350, y: toY - 10, size: 10, font: helvetica }); toY -= 14; }
    if (data.to.email) { currentPage.drawText(data.to.email, { x: 350, y: toY - 10, size: 10, font: helvetica }); toY -= 14; }
    if (data.to.address) {
      const addrLines = data.to.address.split('\n');
      for (const line of addrLines) {
        if (line.trim()) {
          currentPage.drawText(line, { x: 350, y: toY - 10, size: 10, font: helvetica });
          toY -= 14;
        }
      }
    }

    y = Math.min(fromY, toY) - 20;

    // Items table
    if (data.items.length) {
      checkPageOverflow(60);
      currentPage.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
      y -= 5;
      
      drawAt('Description', 10, 50, y, { bold: true });
      drawRight('Qty', 10, 380, y, { bold: true });
      drawRight('Rate', 10, 470, y, { bold: true });
      drawRight('Amount', 10, 562, y, { bold: true });
      
      y -= 15;
      currentPage.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
      y -= 15;

      for (const item of data.items) {
        if (!item.description) continue;
        
        checkPageOverflow(30);

        const descText = item.description;
        const descWidth = helvetica.widthOfTextAtSize(descText, 9);
        
        if (descWidth > 270) {
          const words = descText.split(' ');
          let currentLine = '';
          const lines: string[] = [];
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (helvetica.widthOfTextAtSize(testLine, 9) > 270) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          let itemY = y;
          for (let i = 0; i < lines.length; i++) {
            drawAt(lines[i], 9, 50, itemY);
            if (i < lines.length - 1) {
              itemY -= 12;
              checkPageOverflow(20);
            }
          }
          
          drawRight(String(item.quantity), 9, 380, y);
          drawRight(`${currency.symbol}${item.rate.toFixed(2)}`, 9, 470, y);
          drawRight(`${currency.symbol}${(item.quantity * item.rate).toFixed(2)}`, 9, 562, y);

          y = itemY - 14;
        } else {
          drawAt(descText, 9, 50, y);
          drawRight(String(item.quantity), 9, 380, y);
          drawRight(`${currency.symbol}${item.rate.toFixed(2)}`, 9, 470, y);
          drawRight(`${currency.symbol}${(item.quantity * item.rate).toFixed(2)}`, 9, 562, y);
          y -= 14;
        }
      }

      checkPageOverflow(80);
      currentPage.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 15;

      currentPage.drawText('Subtotal:', { x: 400, y: y - 10, size: 10, font: helvetica });
      drawRight(`${currency.symbol}${subtotal.toFixed(2)}`, 10, 562, y);
      y -= 14;

      currentPage.drawText(`Tax (${data.taxRate}%):`, { x: 400, y: y - 10, size: 10, font: helvetica });
      drawRight(`${currency.symbol}${taxAmount.toFixed(2)}`, 10, 562, y);
      y -= 14;

      if (data.discount > 0) {
        currentPage.drawText('Discount:', { x: 400, y: y - 10, size: 10, font: helvetica });
        drawRight(`-${currency.symbol}${data.discount.toFixed(2)}`, 10, 562, y);
        y -= 14;
      }

      y -= 5;
      currentPage.drawLine({ start: { x: 400, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 20;

      currentPage.drawText('Grand Total:', { x: 400, y: y - 12, size: 12, font: helveticaBold });
      drawRight(`${currency.symbol}${grandTotal.toFixed(2)}`, 12, 562, y, { bold: true });
      y -= 16;
    }

    if (data.notes) {
      checkPageOverflow(40);
      y -= 15;
      currentPage.drawText('Notes:', { x: 50, y: y - 11, size: 11, font: helveticaBold });
      y -= 15;
      const notesLines = data.notes.split('\n');
      for (const line of notesLines) {
        if (line.trim()) {
          checkPageOverflow(15);
          currentPage.drawText(line, { x: 50, y: y - 10, size: 10, font: helvetica });
          y -= 14;
        }
      }
    }

    if (data.paymentTerms) {
      checkPageOverflow(40);
      y -= 15;
      currentPage.drawText('Payment Terms:', { x: 50, y: y - 11, size: 11, font: helveticaBold });
      y -= 15;
      const termsLines = data.paymentTerms.split('\n');
      for (const line of termsLines) {
        if (line.trim()) {
          checkPageOverflow(15);
          currentPage.drawText(line, { x: 50, y: y - 10, size: 10, font: helvetica });
          y -= 14;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), `Invoice_${data.invoiceNumber}.pdf`);
  };

  const saveNewSession = () => {
    const defaultName = data.invoiceNumber.trim() || `Invoice ${new Date().toLocaleDateString()}`;
    const name = prompt('Enter a name for this invoice session:', defaultName);
    if (name === null) return;

    const id = generateId();
    const newSession: InvoiceSession = {
      id,
      name: name.trim() || defaultName,
      data,
      logoDataUrl,
      updatedAt: Date.now(),
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const updateActiveSession = () => {
    if (!activeSessionId) return;
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              name: data.invoiceNumber.trim() || s.name,
              data,
              logoDataUrl,
              updatedAt: Date.now(),
            }
          : s
      )
    );
  };

  const loadSession = (session: InvoiceSession) => {
    setData(session.data);
    setLogoDataUrl(session.logoDataUrl);
    setActiveSessionId(session.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved invoice session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    }
  };

  const clearAllSessions = () => {
    if (confirm('Are you sure you want to delete all saved invoice sessions?')) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  const resetWorkspace = () => {
    if (confirm('Reset workspace? This will clear current changes.')) {
      setData({
        ...defaultData,
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      });
      setLogoDataUrl(null);
      setActiveSessionId(null);
    }
  };

  const activeSessionName = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId)?.name || null;
  }, [activeSessionId, sessions]);

  return (
    <ToolLayout tool={tool} className="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Session Log & Invoice Summary/Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card: Download & Reset */}
          <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-md">
            <Button onClick={handleDownloadPdf} size="lg" className="w-full gap-2 shadow-sm font-semibold h-11">
              <FileDown className="w-5 h-5" /> Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={resetWorkspace} className="w-full h-10 px-3 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Workspace
            </Button>
          </div>

          {/* Session Log Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-primary" />
                Invoice Session Log
              </CardTitle>
              {sessions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllSessions} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Save actions */}
              <div className="space-y-2">
                {activeSessionId && activeSessionName ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-2">
                    <p className="text-muted-foreground">
                      Active: <span className="font-semibold text-foreground">{activeSessionName}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={updateActiveSession} size="sm" className="flex-1 text-xs h-8 gap-1">
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </Button>
                      <Button onClick={saveNewSession} variant="outline" size="sm" className="flex-1 text-xs h-8 gap-1">
                        <Plus className="w-3.5 h-3.5" /> Save As New
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={saveNewSession} className="w-full text-xs h-9 gap-1.5 shadow-sm">
                    <Save className="w-4 h-4" /> Save Current Invoice
                  </Button>
                )}
              </div>

              {/* Saved Sessions list */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                    No invoices saved yet. Save current invoice to switch between multiple templates.
                  </p>
                ) : (
                  sessions.map(s => {
                    const isActive = s.id === activeSessionId;
                    const itemsCount = s.data.items.length;
                    return (
                      <div
                        key={s.id}
                        onClick={() => loadSession(s)}
                        className={`group flex items-center justify-between border rounded-lg p-2.5 text-left cursor-pointer transition-all hover:shadow-sm ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <p className="font-semibold text-xs leading-none truncate text-foreground group-hover:text-primary transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                            <span>•</span>
                            <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => deleteSession(s.id, e)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Summary Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Summary & Totals</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">{currency.symbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({data.taxRate}%):</span>
                  <span className="font-medium text-foreground">{currency.symbol}{taxAmount.toFixed(2)}</span>
                </div>
                {data.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount:</span>
                    <span className="font-medium text-foreground">-{currency.symbol}{data.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base text-foreground pt-1">
                  <span>Grand Total:</span>
                  <span>{currency.symbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: The Invoice Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From Card */}
            <Card className="border border-border/80 shadow-md">
              <CardHeader><CardTitle>From (Your Company)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Company Name</Label><Input value={data.from.name} onChange={e => updateFrom('name', e.target.value)} placeholder="Your Company LLC" className="mt-1" /></div>
                <div><Label>Email</Label><Input value={data.from.email} onChange={e => updateFrom('email', e.target.value)} placeholder="billing@company.com" className="mt-1" /></div>
                <div><Label>Phone</Label><Input value={data.from.phone} onChange={e => updateFrom('phone', e.target.value)} placeholder="+1 555-0000" className="mt-1" /></div>
                <div><Label>Address</Label><Textarea value={data.from.address} onChange={e => updateFrom('address', e.target.value)} placeholder="Street, City, ZIP" rows={3} className="mt-1" /></div>
                <div>
                  <Label className="mb-2 block">Logo (PNG/JPEG)</Label>
                  {logoDataUrl ? (
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <img src={logoDataUrl} alt="Logo preview" className="w-12 h-12 object-contain rounded border bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">Logo uploaded</p>
                        <p className="text-[10px] text-muted-foreground truncate">Included in PDF</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setLogoDataUrl(null)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-xs cursor-pointer mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bill To Card */}
            <Card className="border border-border/80 shadow-md">
              <CardHeader><CardTitle>Bill To (Client)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Client Name</Label><Input value={data.to.name} onChange={e => updateTo('name', e.target.value)} placeholder="Client Company" className="mt-1" /></div>
                <div><Label>Email</Label><Input value={data.to.email} onChange={e => updateTo('email', e.target.value)} placeholder="client@example.com" className="mt-1" /></div>
                <div><Label>Address</Label><Textarea value={data.to.address} onChange={e => updateTo('address', e.target.value)} placeholder="Street, City, ZIP" rows={5} className="mt-1" /></div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Details Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><Label>Invoice #</Label><Input value={data.invoiceNumber} onChange={e => setData(prev => ({ ...prev, invoiceNumber: e.target.value }))} className="mt-1" /></div>
                <div><Label>Invoice Date</Label><Input type="date" value={data.invoiceDate} onChange={e => setData(prev => ({ ...prev, invoiceDate: e.target.value }))} className="mt-1 text-xs sm:text-sm" /></div>
                <div><Label>Due Date</Label><Input type="date" value={data.dueDate} onChange={e => setData(prev => ({ ...prev, dueDate: e.target.value }))} className="mt-1 text-xs sm:text-sm" /></div>
                <div>
                  <CurrencySelector
                    value={CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0]}
                    onChange={c => setData(prev => ({ ...prev, currency: c.code }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {data.items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5"><Label className="text-xs">Description</Label><Input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Service or product" className="mt-1 text-xs" /></div>
                  <div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" min={0} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="mt-1 text-xs" /></div>
                  <div className="col-span-2"><Label className="text-xs">Rate</Label><Input type="number" min={0} step={0.01} value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} className="mt-1 text-xs" /></div>
                  <div className="col-span-2"><Label className="text-xs">Amount</Label><div className="h-10 flex items-center text-xs font-semibold">{currency.symbol}{(item.quantity * item.rate).toFixed(2)}</div></div>
                  <div className="col-span-1"><Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button></div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="text-xs border-dashed hover:border-solid"><Plus className="w-4 h-4 mr-1" />Add Row</Button>
            </CardContent>
          </Card>

          {/* Tax & Discount Settings Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader><CardTitle>Tax & Discount Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tax Rate (%)</Label><Input type="number" min={0} max={100} step={0.1} value={data.taxRate} onChange={e => setData(prev => ({ ...prev, taxRate: Number(e.target.value) || 0 }))} className="mt-1" /></div>
                <div><Label>Discount ({currency.symbol})</Label><Input type="number" min={0} step={0.01} value={data.discount} onChange={e => setData(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))} className="mt-1" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms Card */}
          <Card className="border border-border/80 shadow-md">
            <CardHeader><CardTitle>Notes & Terms</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Notes</Label><Textarea value={data.notes} onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Additional notes for the client..." rows={3} className="mt-1" /></div>
              <div><Label>Payment Terms</Label><Textarea value={data.paymentTerms} onChange={e => setData(prev => ({ ...prev, paymentTerms: e.target.value }))} placeholder="Payment due within 30 days" rows={2} className="mt-1" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}
