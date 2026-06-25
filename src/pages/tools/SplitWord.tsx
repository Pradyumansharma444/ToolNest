import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function SplitWord() {
  const tool = getToolById('split-word')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parts, setParts] = useState<string[]>([]);

  const split = async () => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('word/document.xml')?.async('text');
    if (!xml) { toast({ title: 'Could not read document', variant: 'destructive' }); return; }
    const m = xml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (!m) { toast({ title: 'No text found', variant: 'destructive' }); return; }
    const text = m.map((tag: string) => tag.replace(/<[^>]+>/g, '')).join(' ');
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunkSize = Math.ceil(sentences.length / 3);
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      chunks.push(sentences.slice(i, i + chunkSize).join(' '));
    }
    setParts(chunks);
    toast({ title: `Split into ${chunks.length} parts` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={parts.length > 0}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
          maxSize={50 * 1024 * 1024} onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => { setFile(null); setParts([]); }} selectedFile={file} />
        {file && <Button onClick={split}>Split Document</Button>}
        {parts.length > 0 && (
          <div className="space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="rounded-xl border bg-card p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Part {i + 1}</p>
                <p className="text-xs whitespace-pre-wrap">{p.slice(0, 300)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
