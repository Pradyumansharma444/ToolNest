import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function UrlParser() {
  const tool = getToolById('url-parser')!;
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<URL | null>(null);
  const [error, setError] = useState('');

  const parse = () => {
    try {
      setParsed(new URL(url));
      setError('');
    } catch { setError('Invalid URL'); setParsed(null); }
  };

  const queryParams = parsed ? Array.from(parsed.searchParams.entries()) : [];

  return (
    <ToolLayout tool={tool} resultVisible={!!parsed || !!error}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="https://example.com/path?query=value" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && parse()} />
          <Button onClick={parse}>Parse</Button>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {parsed && (
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <Row label="Protocol" value={parsed.protocol} />
            <Row label="Hostname" value={parsed.hostname} />
            <Row label="Port" value={parsed.port || '(default)'} />
            <Row label="Pathname" value={parsed.pathname} />
            <Row label="Hash" value={parsed.hash || '(none)'} />
            {queryParams.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Query Parameters:</span>
                <div className="mt-1 space-y-1">
                  {queryParams.map(([k, v], i) => (
                    <div key={i} className="text-sm flex gap-2"><span className="font-mono text-primary">{k}:</span><span className="font-mono">{v}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono">{value}</span></div>;
}
