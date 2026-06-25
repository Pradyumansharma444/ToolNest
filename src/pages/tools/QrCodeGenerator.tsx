import { useState, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function QrCodeGenerator() {
  const tool = getToolById('qr-code-generator')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size] = useState(300);

  const generateQr = useCallback(() => {
    if (!text.trim()) {
      setQrDataUrl(null);
      return;
    }

    QRCode.toDataURL(text.trim(), {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error(err);
      setQrDataUrl(null);
    });
  }, [text, fgColor, bgColor, size]);

  useEffect(() => {
    generateQr(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [generateQr]);

  const download = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
    toast({ title: 'QR code downloaded!' });
  }, [qrDataUrl, toast]);

  return (
    <ToolLayout tool={tool} resultVisible={!!qrDataUrl}>
      <div className="space-y-4">
        <Input placeholder="Enter text or URL..." value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex gap-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Foreground</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
          </div>
        </div>
        {qrDataUrl && (
          <div className="flex flex-col items-center gap-4">
            <img src={qrDataUrl} alt="QR Code" className="border rounded-xl bg-white" width={size} height={size} />
            <Button onClick={download}><Download className="w-4 h-4 mr-1" />Download PNG</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

