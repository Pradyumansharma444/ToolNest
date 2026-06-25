import { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadBlob } from '@/lib/utils';
import { Download } from 'lucide-react';

interface VCardData {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  linkedin: string;
}

const ERROR_CORRECTION = ['L', 'M', 'Q', 'H'] as const;

export default function QrBusinessCard() {
  const [data, setData] = useState<VCardData>({
    firstName: '', lastName: '', title: '', company: '', phone: '', email: '', website: '', address: '', linkedin: '',
  });
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ecLevel, setEcLevel] = useState<QRCode.QRCodeErrorCorrectionLevel>('M');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);

  const vCardString = `BEGIN:VCARD
VERSION:3.0
N:${data.lastName};${data.firstName};;;
FN:${data.firstName} ${data.lastName}
TITLE:${data.title}
ORG:${data.company}
TEL;TYPE=CELL:${data.phone}
EMAIL:${data.email}
URL:${data.website}
ADR;TYPE=WORK:;;${data.address}
${data.linkedin ? `X-SOCIAL-LINK:${data.linkedin}` : ''}
END:VCARD`;

  const drawQrCode = useCallback(async () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    
    try {
      await QRCode.toCanvas(canvas, vCardString, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: fgColor,
          light: bgColor
        }
      });
    } catch (err) {
      console.error(err);
    }
  }, [vCardString, fgColor, bgColor, ecLevel]);

  const drawBusinessCard = useCallback(async () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600, h = 350;
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(2, 2);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, w * 0.55, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const name = `${data.firstName} ${data.lastName}`.trim() || 'Your Name';
    ctx.fillText(name, 30, 50);

    if (data.title) {
      ctx.font = '16px Inter, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(data.title, 30, 90);
    }

    if (data.company) {
      ctx.font = '14px Inter, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(data.company, 30, 115);
    }

    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    let infoY = 160;
    if (data.email) { ctx.fillText(`✉ ${data.email}`, 30, infoY); infoY += 22; }
    if (data.phone) { ctx.fillText(`📞 ${data.phone}`, 30, infoY); infoY += 22; }
    if (data.website) { ctx.fillText(`🌐 ${data.website}`, 30, infoY); infoY += 22; }

    // Draw QR on the right side
    try {
      const qrDataUrl = await QRCode.toDataURL(vCardString, {
        margin: 1,
        width: 130,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#ffffff',
          light: '#00000000' // transparent background for card
        }
      });
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, w - 165, 50, 130, 130);
      };
      img.src = qrDataUrl;
    } catch (err) {
      console.error(err);
    }
  }, [data, vCardString]);

  useEffect(() => { drawQrCode(); }, [drawQrCode]);
  useEffect(() => { drawBusinessCard(); }, [drawBusinessCard]);

  const handleDownloadQrPng = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'QRCode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadQrSvg = async () => {
    try {
      const svg = await QRCode.toString(vCardString, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: fgColor,
          light: bgColor
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      downloadBlob(blob, 'QRCode.svg');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCardPng = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'BusinessCard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const hasData = data.firstName || data.lastName || data.phone || data.email;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">QR Business Card</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input value={data.firstName} onChange={e => setData(p => ({ ...p, firstName: e.target.value }))} placeholder="John" /></div>
                <div><Label>Last Name</Label><Input value={data.lastName} onChange={e => setData(p => ({ ...p, lastName: e.target.value }))} placeholder="Doe" /></div>
                <div><Label>Job Title</Label><Input value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))} placeholder="Software Engineer" /></div>
                <div><Label>Company</Label><Input value={data.company} onChange={e => setData(p => ({ ...p, company: e.target.value }))} placeholder="Acme Inc" /></div>
                <div><Label>Phone</Label><Input value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555-1234" /></div>
                <div><Label>Email</Label><Input value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" /></div>
                <div><Label>Website</Label><Input value={data.website} onChange={e => setData(p => ({ ...p, website: e.target.value }))} placeholder="https://johndoe.com" /></div>
                <div><Label>LinkedIn</Label><Input value={data.linkedin} onChange={e => setData(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/johndoe" /></div>
              </div>
              <div><Label>Address</Label><Textarea value={data.address} onChange={e => setData(p => ({ ...p, address: e.target.value }))} placeholder="123 Street, City, ZIP" rows={2} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>QR Customization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Foreground Color</Label><div className="flex gap-2 items-center mt-1"><Input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={fgColor} onChange={e => setFgColor(e.target.value)} className="flex-1" /></div></div>
                <div><Label>Background Color</Label><div className="flex gap-2 items-center mt-1"><Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1" /></div></div>
              </div>
              <div><Label>Error Correction</Label>
                <Select value={ecLevel} onValueChange={(v: QRCode.QRCodeErrorCorrectionLevel) => setEcLevel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ERROR_CORRECTION.map(l => (
                      <SelectItem key={l} value={l}>{l} - {l === 'L' ? 'Low (7%)' : l === 'M' ? 'Medium (15%)' : l === 'Q' ? 'Quartile (25%)' : 'High (30%)'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadQrPng} variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />QR PNG</Button>
            <Button onClick={handleDownloadQrSvg} variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />QR SVG</Button>
            {hasData && <Button onClick={handleDownloadCardPng} size="sm"><Download className="w-4 h-4 mr-1" />Business Card PNG</Button>}
          </div>
        </div>

        <div className="space-y-6">
          {hasData && (
            <Card>
              <CardHeader><CardTitle>Business Card Preview</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <canvas ref={cardCanvasRef} className="rounded-xl shadow-lg" style={{ width: 600, height: 350 }} />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>QR Code Preview</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <canvas ref={qrCanvasRef} className="border rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

