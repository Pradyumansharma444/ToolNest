import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, formatBytes } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function ResizeEpub() {
  const tool = getToolById('resize-epub')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const compress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const newZip = new JSZip();
      const entries = Object.entries(zip.files);
      for (const [path, entry] of entries) {
        if (entry.dir) { newZip.folder(path); continue; }
        const data = await entry.async('uint8array');
        newZip.file(path, data, { compression: 'DEFLATE', compressionOptions: { level: 9 } });
      }
      const compressed = await newZip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
      const url = URL.createObjectURL(compressed);
      const a = document.createElement('a'); a.href = url; a.download = `compressed_${file.name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Compressed! ${formatBytes(file.size)} → ${formatBytes(compressed.size)}` });
    } catch { toast({ title: 'Compression failed', variant: 'destructive' }); }
    setProcessing(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/epub+zip': ['.epub'] }} maxSize={100 * 1024 * 1024}
          onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && <Button onClick={compress} disabled={processing}><Download className="w-4 h-4 mr-1" />{processing ? 'Compressing...' : 'Compress EPUB'}</Button>}
      </div>
    </ToolLayout>
  );
}
