import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function ExtractArchive() {
  const tool = getToolById('extract-archive')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<{ name: string; size: number }[]>([]);
  const [extracting, setExtracting] = useState(false);

  const extract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const items: { name: string; size: number }[] = [];
      zip.forEach((name, entry) => items.push({ name, size: (entry as import('jszip').JSZipObject & { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0 }));
      setEntries(items);
      toast({ title: `Found ${items.length} files` });
    } catch {
      toast({ title: 'Failed to extract. Only ZIP format supported client-side.', variant: 'destructive' });
    }
    setExtracting(false);
  };

  const downloadFile = async (name: string) => {
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    const blob = await zip.file(name)!.async('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={entries.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/zip': ['.zip'], 'application/x-rar-compressed': ['.rar'], 'application/x-7z-compressed': ['.7z'], 'application/gzip': ['.tar.gz', '.gz'], 'application/x-tar': ['.tar'] }}
          maxSize={500 * 1024 * 1024} onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => { setFile(null); setEntries([]); }} selectedFile={file} />
        <p className="text-xs text-muted-foreground">Only ZIP format is supported for client-side extraction. RAR/7z/TAR/GZ require server-side processing.</p>
        {file && <Button onClick={extract} disabled={extracting}>{extracting ? 'Extracting...' : 'Extract'}</Button>}
        {entries.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-medium mb-2">Archive Contents ({entries.length} files)</h3>
            {entries.map((e, i) => (
              <div key={i} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                <span className="truncate">{e.name}</span>
                <Button size="sm" variant="ghost" onClick={() => downloadFile(e.name)}><Download className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
