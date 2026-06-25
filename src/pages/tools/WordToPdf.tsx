import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function WordToPdf() {
  const tool = getToolById('word-to-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const convertToPdf = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8');
      let plainText = '';
      try {
        plainText = textDecoder.decode(arrayBuffer);
      } catch {
        plainText = 'Could not decode document. Please convert to .txt first.';
      }

      const lines = plainText.split(/\r?\n/);
      const htmlContent = lines.map(line => {
        if (!line.trim()) return '<br>';
        return `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
      }).join('\n');

      const printHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${file.name}</title>
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;max-width:800px;margin:0 auto;padding:40px;}
p{margin:8px 0;}</style>
</head><body><h1>${file.name}</h1>${htmlContent}</body></html>`;

      const blob = new Blob([printHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = url;

      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(url);
              resolve();
            }, 1000);
          }, 500);
        };
      });

      setComplete(true);
      toast({ title: 'Success!', description: 'Document converted. Use Print dialog → Save as PDF.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert document.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'text/plain': ['.txt', '.doc', '.docx'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload Document"
          description="Drag & drop a text or document file"
        />
        {file && (
          <Button onClick={convertToPdf} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><FileText className="w-4 h-4 mr-2" /> Convert to PDF</>}
          </Button>
        )}
        {complete && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Conversion complete! Use your browser's Print dialog to save as PDF.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
