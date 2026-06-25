import fs from 'fs';
import path from 'path';

const toolsDir = path.join(process.cwd(), 'src', 'pages', 'tools');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(toolsDir);

const toolsToCreate = [
  {
    name: 'CreateZip',
    content: `import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { Download, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CreateZip() {
  const tool = getToolById('create-zip')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createZip = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archive.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'ZIP created and downloaded!' });
    } catch (err) {
      toast({ title: 'Error creating ZIP', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }, [files, toast]);

  return (
    <ToolLayout tool={tool} resultVisible={files.length > 0}>
      <div className="space-y-4">
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="w-full">
          <Upload className="w-4 h-4 mr-2" /> Select Files
        </Button>
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{files.length} file(s) selected:</p>
            <div className="space-y-1">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-destructive"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <Button onClick={createZip} disabled={processing} className="w-full">
              <Download className="w-4 h-4 mr-2" /> {processing ? 'Creating...' : 'Create ZIP'}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'ExtractArchive',
    content: `import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ExtractArchive() {
  const tool = getToolById('extract-archive')!;
  const { toast } = useToast();
  const [entries, setEntries] = useState<{ name: string; blob: Blob }[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setEntries([]);
    try {
      const zip = await JSZip.loadAsync(file);
      const list: { name: string; blob: Blob }[] = [];
      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          list.push({ name: relativePath, blob: new Blob() });
        }
      });
      // Load blobs sequentially
      for (let i = 0; i < list.length; i++) {
        const entry = list[i];
        const content = await zip.file(entry.name)!.async('blob');
        list[i] = { ...entry, blob: content };
      }
      setEntries(list);
      toast({ title: \`Extracted \${list.length} file(s)\` });
    } catch (err) {
      toast({ title: 'Only ZIP format is supported client-side. RAR/7z/TAR/GZ require server processing.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }, [toast]);

  const download = (entry: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(entry.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={entries.length > 0}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>Only ZIP files can be extracted in the browser. RAR, 7z, TAR, and GZ formats require server-side processing.</p>
        </div>
        <input type="file" accept=".zip" onChange={handleFile} className="block w-full text-sm" />
        {processing && <p className="text-sm text-muted-foreground">Extracting...</p>}
        {entries.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Extracted files:</p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {entries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span className="truncate">{entry.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => download(entry)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'CompressFolder',
    content: `import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { Download, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CompressFolder() {
  const tool = getToolById('compress-folder')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const compress = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.webkitRelativePath || file.name, arrayBuffer);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'folder.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Folder compressed and downloaded!' });
    } catch (err) {
      toast({ title: 'Error compressing folder', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  }, [files, toast]);

  return (
    <ToolLayout tool={tool} resultVisible={files.length > 0}>
      <div className="space-y-4">
        <input ref={inputRef} type="file" webkitdirectory="" directory="" multiple className="hidden" onChange={handleSelect} />
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="w-full">
          <FolderUp className="w-4 h-4 mr-2" /> Select Folder
        </Button>
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{files.length} file(s) selected</p>
            <Button onClick={compress} disabled={processing} className="w-full">
              <Download className="w-4 h-4 mr-2" /> {processing ? 'Compressing...' : 'Compress to ZIP'}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'UnzipSpecific',
    content: `import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function UnzipSpecific() {
  const tool = getToolById('unzip-specific')!;
  const { toast } = useToast();
  const [entries, setEntries] = useState<{ name: string; blob: Blob; checked: boolean }[]>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const zip = await JSZip.loadAsync(file);
    const list: { name: string; blob: Blob; checked: boolean }[] = [];
    const promises: Promise<void>[] = [];
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        promises.push(
          zipEntry.async('blob').then((blob) => {
            list.push({ name: relativePath, blob, checked: false });
          })
        );
      }
    });
    await Promise.all(promises);
    setEntries(list);
    toast({ title: \`Loaded \${list.length} file(s)\` });
  }, [toast]);

  const toggle = (idx: number) => {
    setEntries(prev => prev.map((e, i) => (i === idx ? { ...e, checked: !e.checked } : e)));
  };

  const downloadSelected = useCallback(async () => {
    const selected = entries.filter(e => e.checked);
    if (selected.length === 0) {
      toast({ title: 'No files selected', variant: 'destructive' });
      return;
    }
    if (selected.length === 1) {
      const url = URL.createObjectURL(selected[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selected[0].name.split('/').pop() || 'file';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      for (const s of selected) {
        zip.file(s.name, s.blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected.zip';
      a.click();
      URL.revokeObjectURL(url);
    }
    toast({ title: \`Downloaded \${selected.length} file(s)\` });
  }, [entries, toast]);

  return (
    <ToolLayout tool={tool} resultVisible={entries.length > 0}>
      <div className="space-y-4">
        <input type="file" accept=".zip" onChange={handleFile} className="block w-full text-sm" />
        {entries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Select files to download:</p>
              <Button size="sm" onClick={downloadSelected}>Download Selected</Button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                  <Checkbox checked={entry.checked} onCheckedChange={() => toggle(i)} />
                  <span className="flex-1 truncate">{entry.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const url = URL.createObjectURL(entry.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = entry.name.split('/').pop() || 'file';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'WhatsMyIp',
    content: `import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function WhatsMyIp() {
  const tool = getToolById('whats-my-ip')!;
  const { toast } = useToast();
  const [data, setData] = useState<{ ip: string; city?: string; region?: string; country?: string; org?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(({ ip }) => {
        setData(prev => ({ ...prev, ip }));
        return fetch(\`https://ipapi.co/\${ip}/json/`);
      })
      .then(r => r.json())
      .then(info => {
        setData({
          ip: info.ip,
          city: info.city,
          region: info.region,
          country: info.country_name,
          org: info.org,
        });
        setLoading(false);
      })
      .catch(() => {
        setError('IP detection requires network access.');
        setLoading(false);
      });
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Detecting IP address...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold font-mono">{data?.ip}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">City</span><p className="font-medium">{data?.city || 'N/A'}</p地灵</div>
              <div><span className="text-muted-foreground">Region</span><p className="font-medium">{data?.region || 'N/A'}</p></div>
              <div><span className="text-muted-foreground">Country</span><p className="font-medium">{data?.country || 'N/A'}</p></div>
              <div><span className="text-muted-foreground">ISP</span><p className="font-medium">{data?.org || 'N/A'}</p></div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'UserAgentParser',
    content: `import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function UserAgentParser() {
  const tool = getToolById('user-agent-parser')!;
  const [ua, setUa] = useState('');
  const [info, setInfo] = useState({ os: '', browser: '', device: '' });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setUa(userAgent);
    const getOS = () => {
      if (userAgent.indexOf('Win') !== -1) return 'Windows';
      if (userAgent.indexOf('Mac') !== -1) return 'macOS';
      if (userAgent.indexOf('Linux') !== -1) return 'Linux';
      if (userAgent.indexOf('Android') !== -1) return 'Android';
      if (userAgent.indexOf('like Mac') !== -1) return 'iOS';
      return 'Unknown';
    };
    const getBrowser = () => {
      if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
      if (userAgent.indexOf('Safari') !== -1) return 'Safari';
      if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
      if (userAgent.indexOf('Edge') !== -1) return 'Edge';
      if (userAgent.indexOf('Opera') !== -1) return 'Opera';
      return 'Unknown';
    };
    const getDevice = () => {
      if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
      if (/iPad|Tablet/i.test(userAgent)) return 'Tablet';
      return 'Desktop';
    };
    setInfo({ os: getOS(), browser: getBrowser(), device: getDevice() });
  }, []);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">User-Agent String</p>
          <p className="font-mono text-sm break-all">{ua}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Operating System</p>
              <p className="font-semibold">{info.os}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Browser</p>
              <p className="font-semibold">{info.browser}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Device</p>
              <p className="font-semibold">{info.device}</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'InternetSpeedTest',
    content: `import { useState, useCallback, useRef } from 'react';
import { Gauge, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function InternetSpeedTest() {
  const tool = getToolById('internet-speed-test')!;
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [mbps, setMbps] = useState(0);
  const controller = useRef<AbortController | null>(null);

  const startTest = useCallback(async () => {
    setStatus('running');
    setMbps(0);
    controller.current = new AbortController();
    const startTime = performance.now();
    try {
      const response = await fetch('https://speed.hetzner.de/10MB.bin', { signal: controller.current.signal, cache: 'no-store' });
      const reader = response.body!.getReader();
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        const elapsed = (performance.now() - startTime) / 1000;
        const currentMbps = (total * 8) / (1024 * 1024 * elapsed);
        setMbps(currentMbps);
      }
      const elapsed = (performance.now() - startTime) / 1000;
      const finalMbps = (total * 8) / (1024 * 1024 * elapsed);
      setMbps(finalMbps);
      setStatus('done');
      toast({ title: \`Speed test complete: \${finalMbps.toFixed(2)} Mbps\` });
    } catch {
      // Fallback: generate a blob
      const blob = new Blob([new ArrayBuffer(5 * 1024 * 1024)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const startTime2 = performance.now();
      await new Promise<void>((resolve) => {
        a.download = 'test.bin';
        setTimeout(() => {
          const elapsed = (performance.now() - startTime2) / 1000;
          const final = (5 * 8) / elapsed;
          setMbps(final);
          setStatus('done');
          resolve();
        }, 2000);
      });
      URL.revokeObjectURL(url);
    }
  }, [toast]);

  const stopTest = () => {
    controller.current?.abort();
    setStatus('idle');
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center">
            <span className="text-2xl font-bold">{status === 'running' ? '...' : mbps.toFixed(1)}</span>
          </div>
          <p className="text-muted-foreground">Mbps</p>
        </div>
        <div className="flex justify-center gap-2">
          {status === 'running' ? (
            <Button onClick={stopTest} variant="destructive">Cancel</Button>
          ) : (
            <Button onClick={startTest}><Play className="w-4 h-4 mr-2" /> Start Test</Button>
          )}
          {status === 'done' && <Button variant="outline" onClick={() => { setStatus('idle'); setMbps(0); }}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>}
        </div>
      </div>
    </ToolLayout>
  );
}
`,
  },
  {
    name: 'UrlParser',
    content: `import { useState, useMemo } from 'react';
import { Link, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function UrlParser() {
  const tool = getToolById('url-parser')!;
  const { toast } = useToast();
  const [urlStr, setUrlStr] = useState('');
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!urlStr.trim()) return null;
    try {
      const u = new URL(urlStr.trim());
      const params: [string, string][] = [];
      u.searchParams.forEach((val, key) => params.push([key, val]));
      return {
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash,
        params,
      };
    } catch {
      return null;
    }
  }, [urlStr]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!parsed}>
      <div className="space-y-4">
        <Input placeholder="Paste URL here..." value={urlStr} onChange={(e) => setUrlStr(e.target.value)} />
        {parsed && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            {['protocol', 'host', 'hostname', 'port', 'pathname', 'hash'].map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{key}</label>
                <p className="font-mono text-sm">{parsed[key as keyof typeof parsed]}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copy(String(parsed[key as keyof typeof parsed]))}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
            {parsed.params.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Query Parameters</label>
                <table className="w-full text-sm mt-2">
                  <thead><tr className="text-left text-muted-foreground"><th className="py-1">Key</th><th className="py-1">Value</th></tr></thead>
                  <tbody>
                    {parsed.params.map(([k, v], i) => (
                      <tr key={i} className="border-t"><td className="py-1 font-mono text-xs">{k}</td><td className="py-1 font-mono text-xs">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
`,
  },
];

for (const t of toolsToCreate) {
  fs.writeFileSync(path.join(toolsDir, t.name + '.tsx'), t.content, 'utf8');
  console.log('Created', t.name + '.tsx');
}
console.log('Done creating batch 1');
