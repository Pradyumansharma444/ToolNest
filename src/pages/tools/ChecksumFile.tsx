import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';

export default function ChecksumFile() {
  const tool = getToolById('checksum-file')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [checksums, setChecksums] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState('');

  const calculate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      const sha1Hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', buf))).map(b => b.toString(16).padStart(2, '0')).join('');
      const sha256Hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf))).map(b => b.toString(16).padStart(2, '0')).join('');
      const sha512Hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-512', buf))).map(b => b.toString(16).padStart(2, '0')).join('');
      setChecksums({ 'SHA-1': sha1Hash, 'SHA-256': sha256Hash, 'SHA-512': sha512Hash });
    } catch { toast({ title: 'Checksum calculation failed', variant: 'destructive' }); }
    setProcessing(false);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: `${label} copied!` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={Object.keys(checksums).length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ '*/*': [] }} maxSize={1024 * 1024 * 1024}
          onFilesSelected={(f) => { setFile(f[0]); setChecksums({}); }}
          onFileRemoved={() => { setFile(null); setChecksums({}); }}
          selectedFile={file} label="Upload a file" description="Any file up to 1GB" />
        {file && <Button onClick={calculate} disabled={processing}>{processing ? 'Calculating...' : 'Calculate Checksums'}</Button>}
        {Object.entries(checksums).map(([algo, hash]) => (
          <div key={algo} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{algo}</span>
              <Button size="sm" variant="ghost" onClick={() => copy(hash, algo)}>{copied === algo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm font-mono break-all bg-muted p-2 rounded-lg">{hash}</pre>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
