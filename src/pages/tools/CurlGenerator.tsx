import { useState } from 'react';
import { Copy, Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

interface Header {
  key: string;
  value: string;
}

export default function CurlGenerator() {
  const tool = getToolById('curl-generator')!;
  const { toast } = useToast();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState('');
  const [auth, setAuth] = useState('none');
  const [authToken, setAuthToken] = useState('');
  const [copied, setCopied] = useState(false);

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: keyof Header, val: string) => {
    const h = [...headers];
    h[i][field] = val;
    setHeaders(h);
  };

  const curlCommand = () => {
    let cmd = `curl -X ${method}`;
    if (url) cmd += ` '${url}'`;
    if (auth === 'bearer' && authToken) cmd += ` -H 'Authorization: Bearer ${authToken}'`;
    if (auth === 'basic' && authToken) {
      const encoded = btoa(authToken);
      cmd += ` -H 'Authorization: Basic ${encoded}'`;
    }
    headers.forEach(h => { if (h.key && h.value) cmd += ` -H '${h.key}: ${h.value}'`; });
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && body) cmd += ` -d '${body}'`;
    return cmd;
  };

  const copyResult = () => {
    navigator.clipboard.writeText(curlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1 min-w-[250px]">
            <label className="text-sm text-muted-foreground">URL</label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Auth</label>
            <Select value={auth} onValueChange={setAuth}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {auth !== 'none' && (
            <div className="flex-1 space-y-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground">Token / credentials</label>
              <Input value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder={auth === 'basic' ? 'user:password' : 'token'} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Headers</span>
            <Button size="sm" variant="outline" onClick={addHeader}><Plus className="w-3 h-3 mr-1" />Add</Button>
          </div>
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header name" className="flex-1" />
              <Input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value" className="flex-1" />
              <Button size="sm" variant="ghost" onClick={() => removeHeader(i)}><X className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>

        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Body</label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder='{"key": "value"}' className="min-h-[100px] font-mono text-sm" />
          </div>
        )}

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">cURL Command</span>
            <Button size="sm" variant="ghost" onClick={copyResult}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <pre className="text-sm font-mono whitespace-pre-wrap break-all bg-muted p-3 rounded-lg">{curlCommand() || 'Enter a URL to generate the command'}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
