import { useState } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const CODE128_TABLE: Record<string, string> = {};
for (let i = 32; i <= 126; i++) {
  const ch = String.fromCharCode(i);
  const v = i - 32;
  CODE128_TABLE[ch] = v.toString(2).padStart(11, '0').replace(/0/g, ' ').replace(/1/g, '█');
}

function generateBarcode(text: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = text.length * 14 + 40;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  let x = 20;
  for (let i = 0; i < text.length; i++) {
    const pattern = CODE128_TABLE[text[i]];
    if (!pattern) continue;
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === '█') ctx.fillRect(x + j, 10, 1, 70);
    }
    x += 14;
  }
  ctx.font = '12px monospace';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, 95);
  return canvas.toDataURL('image/png');
}

export default function BarcodeGenerator() {
  const tool = getToolById('barcode-generator')!;
  const { toast } = useToast();
  const [text, setText] = useState('Hello123');
  const [dataUrl, setDataUrl] = useState('');

  const generate = () => {
    const url = generateBarcode(text);
    setDataUrl(url);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = dataUrl; a.download = 'barcode.png'; a.click();
    toast({ title: 'Barcode downloaded' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!dataUrl}>
      <div className="space-y-4">
        <Input placeholder="Enter text to encode" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()} />
        <Button onClick={generate}>Generate Barcode</Button>
        {dataUrl && (
          <div className="rounded-xl border bg-card p-4 text-center">
            <img src={dataUrl} alt="barcode" className="mx-auto max-w-full" />
            <Button size="sm" variant="outline" className="mt-2" onClick={download}><Download className="w-3 h-3 mr-1" /> Download</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
