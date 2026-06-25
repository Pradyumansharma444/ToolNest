import os, textwrap

OUT = 'src/pages/tools'
os.makedirs(OUT, exist_ok=True)

def write(name, code):
    with open(f'{OUT}/{name}.tsx', 'w', encoding='utf-8') as f:
        f.write(code.strip() + '\n')
    print(f'Created {name}.tsx')

# ── Archive ──
write('CreateZip', '''import { useState, useCallback, useRef } from 'react';
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
    if (e.target.files) setFiles(Array.from(e.target.files));
  };
  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const createZip = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const zip = new JSZip();
      for (const file of files) zip.file(file.name, await file.arrayBuffer());
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'archive.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'ZIP created and downloaded!' });
    } catch {
      toast({ title: 'Error creating ZIP', variant: 'destructive' });
    } finally { setProcessing(false); }
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
''')

write('ExtractArchive', '''import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ExtractArchive() {
  const tool = getToolById('extract-archive')!;
  const { toast } = useToast();
  const [entries, setEntries] = useState<{ name: string; blob: Blob }[]>([]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEntries([]);
    try {
      const zip = await JSZip.loadAsync(file);
      const list: { name: string; blob: Blob }[] = [];
      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          const blob = await zipEntry.async('blob');
          list.push({ name: relativePath, blob });
        }
      }
      setEntries(list);
      toast({ title: \`Extracted \${list.length} file(s)\` });
    } catch {
      toast({ title: 'Only ZIP format is supported client-side for extraction.', variant: 'destructive' });
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
''')

write('CompressFolder', '''import { useState, useCallback, useRef } from 'react';
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
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const compress = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const zip = new JSZip();
      for (const file of files) zip.file(file.webkitRelativePath || file.name, await file.arrayBuffer());
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'folder.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Folder compressed and downloaded!' });
    } catch {
      toast({ title: 'Error compressing folder', variant: 'destructive' });
    } finally { setProcessing(false); }
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
''')

write('UnzipSpecific', '''import { useState, useCallback } from 'react';
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

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    const list: { name: string; blob: Blob; checked: boolean }[] = [];
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        const blob = await zipEntry.async('blob');
        list.push({ name: relativePath, blob, checked: false });
      }
    }
    setEntries(list);
    toast({ title: \`Loaded \${list.length} file(s)\` });
  }, [toast]);

  const toggle = (idx: number) => {
    setEntries(prev => prev.map((e, i) => (i === idx ? { ...e, checked: !e.checked } : e)));
  };

  const downloadSelected = useCallback(async () => {
    const selected = entries.filter(e => e.checked);
    if (selected.length === 0) { toast({ title: 'No files selected', variant: 'destructive' }); return; }
    if (selected.length === 1) {
      const url = URL.createObjectURL(selected[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selected[0].name.split('/').pop() || 'file';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      for (const s of selected) zip.file(s.name, s.blob);
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
''')

print('Archive tools generated')
