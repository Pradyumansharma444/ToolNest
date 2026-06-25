import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function HtmlToPdf() {
  const tool = getToolById('html-to-pdf')!;
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState('');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'html' | 'url'>('html');
  const [processing, setProcessing] = useState(false);

  const convertToPdf = async () => {
    const content = mode === 'url' ? url : htmlContent;
    if (!content.trim()) {
      toast({ title: 'Input required', description: mode === 'url' ? 'Enter a URL' : 'Enter HTML content', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      let finalHtml = htmlContent;
      if (mode === 'url') {
        finalHtml = `<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6;}img{max-width:100%;height:auto;}</style></head><body>
          <h1>Web Page Content</h1><p>Source: ${url}</p><p>Note: For security, direct URL fetching is restricted. Paste the HTML content directly for best results.</p>
        </body></html>`;
      }

      const printHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>@page{margin:1in;}body{font-family:Arial,sans-serif;line-height:1.6;}img{max-width:100%;}</style>
        </head><body>${finalHtml}</body></html>`;

      const blob = new Blob([printHtml], { type: 'text/html' });
      const url2 = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = url2;

      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url2); resolve(); }, 1000);
          }, 500);
        };
      });
      toast({ title: 'Success!', description: 'Use the Print dialog → Save as PDF.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to convert.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant={mode === 'html' ? 'default' : 'outline'} size="sm" onClick={() => setMode('html')}>HTML Code</Button>
          <Button variant={mode === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setMode('url')}>URL</Button>
        </div>

        {mode === 'html' ? (
          <textarea
            className="w-full h-64 p-4 rounded-xl border bg-card font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Paste your HTML code here..."
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
          />
        ) : (
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
          />
        )}

        <Button onClick={convertToPdf} disabled={processing} size="lg" className="w-full">
          {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><Globe className="w-4 h-4 mr-2" /> Convert to PDF</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
