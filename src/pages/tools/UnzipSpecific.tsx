import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function UnzipSpecific() {
  const tool = getToolById('unzip-specific')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<{ name: string; selected: boolean }[]>([]);

  const load = async () => {
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    const names: string[] = [];
    zip.forEach((name) => names.push(name));
    setEntries(names.map(n => ({ name: n, selected: true })));
    toast({ title: `Found ${names.length} files` });
  };

  const toggle = (i: number) => setEntries(prev => prev.map((e, j) => j === i ? { ...e, selected: !e.selected } : e));

  const downloadSelected = async () => {
    if (!file) return;
    const zip = await JSZip.loadAsync(file);
    const selected = entries.filter(e => e.selected);
    const outZip = new JSZip();
    for (const s of selected) {
      const blob = await zip.file(s.name)!.async('blob');
      outZip.file(s.name, blob);
    }
    const blob = await outZip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'selected-files.zip'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Downloaded ${selected.length} files` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={entries.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/zip': ['.zip'] }} maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => { setFile(null); setEntries([]); }} selectedFile={file} />
        {file && <Button onClick={load}>Load Archive</Button>}
        {entries.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Select Files</span>
              <Button size="sm" onClick={downloadSelected}><Download className="w-3 h-3 mr-1" /> Download Selected</Button>
            </div>
            {entries.map((e, i) => (
              <label key={i} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                <input type="checkbox" checked={e.selected} onChange={() => toggle(i)} className="rounded" />
                {e.name}
              </label>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
