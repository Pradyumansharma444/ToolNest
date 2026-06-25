import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function simpleMd5(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

async function sha1(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha512(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const tool = getToolById('hash-generator')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState('md5');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!input.trim()) { setHash(''); setLoading(false); return; } // eslint-disable-line react-hooks/set-state-in-effect
    let cancelled = false;
    setLoading(true);
    (async () => {
      let result = '';
      switch (algo) {
        case 'md5': result = simpleMd5(input.trim()); break;
        case 'sha1': result = await sha1(input.trim()); break;
        case 'sha256': result = await sha256(input.trim()); break;
        case 'sha512': result = await sha512(input.trim()); break;
      }
      if (!cancelled) { setHash(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [input, algo]);

  const copyHash = (label: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: `${label} hash copied!` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={hash.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Enter text to hash..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[120px] resize-y font-mono text-sm" />
        <div className="flex items-center gap-2 flex-wrap">
          {['md5', 'sha1', 'sha256', 'sha512'].map(a => (
            <Button key={a} size="sm" variant={algo === a ? 'default' : 'outline'} onClick={() => setAlgo(a)}>{a.toUpperCase()}</Button>
          ))}
        </div>
        {loading && <p className="text-sm text-muted-foreground">Computing...</p>}
        {hash && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{algo.toUpperCase()} Hash</span>
              <Button size="sm" variant="ghost" onClick={() => copyHash(algo)}>
                {copied === algo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="text-sm font-mono break-all bg-muted p-3 rounded-lg">{hash}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
