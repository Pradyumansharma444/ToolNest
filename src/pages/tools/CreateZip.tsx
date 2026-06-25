import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function CreateZip() {
  const tool = getToolById('create-zip')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);

  const createZip = async () => {
    if (files.length === 0) return;
    setCreating(true);
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'archive.zip'; a.click();
    URL.revokeObjectURL(url);
    setCreating(false);
    toast({ title: `Created ${files.length}-file archive` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-4">
        <FileUpload accept={{ '*/*': [] }} multiple maxSize={500 * 1024 * 1024}
          onFilesSelected={(f) => setFiles(prev => [...prev, ...f])}
          selectedFile={null} onFileRemoved={() => {}} />
        {files.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">{files.length} file(s) selected</p>
            {files.map((f, i) => (
              <div key={i} className="flex justify-between items-center py-1 text-sm">
                <span>{f.name}</span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-destructive text-xs">Remove</button>
              </div>
            ))}
          </div>
        )}
        <Button onClick={createZip} disabled={files.length === 0 || creating}>
          {creating ? 'Creating...' : 'Create ZIP'}
        </Button>
      </div>
    </ToolLayout>
  );
}
