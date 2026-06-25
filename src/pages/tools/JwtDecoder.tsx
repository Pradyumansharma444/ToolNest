import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(base64)));
}

export default function JwtDecoder() {
  const tool = getToolById('jwt-decoder')!;
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { error: 'Invalid JWT format. Must have 3 parts separated by dots.' };
    try {
      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      return { header, payload, error: null };
    } catch (e) {
      return { error: `Failed to decode: ${(e as Error).message}`, header: null, payload: null };
    }
  }, [token]);

  const copyResult = () => {
    if (decoded && !decoded.error) {
      navigator.clipboard.writeText(JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={token.length > 0}>
      <div className="space-y-4">
        <Textarea placeholder="Paste JWT token here..." value={token} onChange={(e) => setToken(e.target.value)} className="min-h-[100px] resize-y font-mono text-sm" />
        {decoded && (
          <div className="space-y-4">
            {decoded.error ? (
              <div className="rounded-xl border border-destructive bg-destructive/5 p-4 text-destructive text-sm">{decoded.error}</div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Header</h3>
                    <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-48 font-mono">{JSON.stringify(decoded.header, null, 2)}</pre>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payload</h3>
                  <div className="rounded-xl border bg-card p-4">
                    <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-48 font-mono">{JSON.stringify(decoded.payload, null, 2)}</pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
