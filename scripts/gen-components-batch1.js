import fs from 'fs';
import path from 'path';

const TARGET = path.join(process.cwd(), 'src', 'pages', 'tools');
const components = [
  {
    name: 'CreateZip',
    code: `import { useState, useCallback, useRef } from 'react';
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
`}
];

for (const c of components) {
  fs.writeFileSync(path.join(TARGET, c.name + '.tsx'), c.code, 'utf8');
  console.log('Created', c.name + '.tsx');
}
