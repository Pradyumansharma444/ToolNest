import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export default function CompressFolder() {
  const tool = getToolById('compress-folder')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [tree, setTree] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const f = Array.from(e.target.files);
      setFiles(f);
      setTree(f.map(ff => ff.webkitRelativePath || ff.name));
    }
  };

  const compress = async () => {
    if (files.length === 0) return;
    setCreating(true);
    const zip = new JSZip();
    for (const f of files) zip.file(f.webkitRelativePath || f.name, f);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'folder.zip'; a.click();
    URL.revokeObjectURL(url);
    setCreating(false);
    toast({ title: 'Folder compressed and downloaded' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={files.length > 0}>
      <div className="space-y-4">
        <input type="file" {...({ webkitdirectory: '', directory: '', multiple: true } as React.InputHTMLAttributes<HTMLInputElement>)} onChange={handleFolderSelect} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
        {tree.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="font-medium mb-2">Folder Structure ({files.length} files)</p>
            {tree.map((p, i) => <p key={i} className="text-xs text-muted-foreground truncate">{p}</p>)}
          </div>
        )}
        <Button onClick={compress} disabled={files.length === 0 || creating}>
          {creating ? 'Compressing...' : 'Compress Folder to ZIP'}
        </Button>
      </div>
    </ToolLayout>
  );
}
