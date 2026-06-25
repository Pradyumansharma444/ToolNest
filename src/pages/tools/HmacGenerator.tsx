import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function HmacGenerator() {
  const tool = getToolById('hmac-generator')!;
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [key, setKey] = useState('secret');
  const [algo, setAlgo] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!text) { toast({ title: 'Enter text', variant: 'destructive' }); return; }
    try {
      const enc = new TextEncoder();
      const keyBuf = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', keyBuf, enc.encode(text));
      const hmac = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
      setResult(hmac);
    } catch { toast({ title: 'HMAC generation failed', variant: 'destructive' }); }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter message..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] resize-y font-mono text-sm" />
        <Input placeholder="Secret key" value={key} onChange={(e) => setKey(e.target.value)} className="font-mono" />
        <div className="flex items-center gap-2">
          <Select value={algo} onValueChange={(v) => setAlgo(v as 'SHA-256' | 'SHA-512')}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SHA-256">SHA-256</SelectItem>
              <SelectItem value="SHA-512">SHA-512</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate}>Generate HMAC</Button>
        </div>
        {result && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">HMAC-{algo}</span>
              <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm font-mono break-all bg-muted p-3 rounded-lg">{result}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
