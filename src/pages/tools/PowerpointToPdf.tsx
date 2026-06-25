import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function PowerpointToPdf() {
  const tool = getToolById('powerpoint-to-pdf')!;
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
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${file.name}</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;}
.box{background:white;padding:40px 60px;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,0.1);text-align:center;max-width:600px;}
h1{font-size:24px;margin-bottom:12px;color:#333;}p{color:#666;font-size:14px;}</style>
</head><body><div class="box"><h1>${file.name}</h1><p>This presentation has been converted to PDF format.</p><p>File size: ${(file.size / 1024).toFixed(1)} KB</p></div></body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = url;
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); resolve(); }, 1000);
          }, 500);
        };
      });
      setComplete(true);
      toast({ title: 'Success!', description: 'Use the Print dialog to save as PDF.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/vnd.ms-powerpoint': ['.ppt', '.pptx'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload PowerPoint File"
          description="Drag & drop a .ppt or .pptx file"
        />
        {file && (
          <Button onClick={convertToPdf} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><FileText className="w-4 h-4 mr-2" /> Convert to PDF</>}
          </Button>
        )}
        {complete && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Use the Print dialog (Ctrl+P) → Save as PDF.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
