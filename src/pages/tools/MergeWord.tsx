import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function MergeWord() {
  const tool = getToolById('merge-word')!;
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [merged, setMerged] = useState(false);

  const merge = async () => {
    if (files.length < 2) { toast({ title: 'Select at least 2 DOCX files', variant: 'destructive' }); return; }
    const mergedText: string[] = [];
    for (const f of files) {
      const buf = await f.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      const xml = await zip.file('word/document.xml')?.async('text');
      if (xml) {
        const m = xml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (m) mergedText.push(m.map((tag: string) => tag.replace(/<[^>]+>/g, '')).join(' '));
      }
    }
    const outZip = new JSZip();
    outZip.file('merged.txt', mergedText.join('\n\n--- Page Break ---\n\n'));
    const blob = await outZip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'merged-text.txt'; a.click();
    URL.revokeObjectURL(url);
    setMerged(true);
    toast({ title: 'Documents merged (text extracted)' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={merged}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} multiple maxSize={50 * 1024 * 1024}
          onFilesSelected={(f) => setFiles(prev => [...prev, ...f])} selectedFile={null} onFileRemoved={() => {}} />
        {files.length > 0 && <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>}
        <Button onClick={merge}>Merge Documents</Button>
      </div>
    </ToolLayout>
  );
}
