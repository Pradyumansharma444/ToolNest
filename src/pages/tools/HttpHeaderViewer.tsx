import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function HttpHeaderViewer() {
  const tool = getToolById('http-header-viewer')!;
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchHeaders = async () => {
    setLoading(true);
    try {
      const res = await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      const h: Record<string, string> = {};
      res.headers.forEach((v, k) => { h[k] = v; });
      setHeaders(h);
    } catch { setHeaders({ error: 'Could not fetch headers from origin' }); }
    setLoading(false);
  };

  useEffect(() => { fetchHeaders(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <ToolLayout tool={tool} resultVisible={Object.keys(headers).length > 0}>
      <div className="space-y-4">
        <Button onClick={fetchHeaders} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          {Object.entries(headers).map(([k, v]) => (
            <div key={k} className="grid grid-cols-2 gap-2 text-sm border-b last:border-0 py-1">
              <span className="text-muted-foreground font-mono text-xs">{k}</span>
              <span className="font-mono text-xs break-all">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
