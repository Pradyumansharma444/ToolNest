import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

export default function EpubToPdf() {
  const tool = getToolById('epub-to-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const contentOpfFile = zip.file('META-INF/container.xml');
      if (!contentOpfFile) throw new Error('Invalid EPUB: missing container.xml');
      const containerXml = await contentOpfFile.async('text');
      const opfMatch = containerXml.match(/full-path="([^"]+)"/);
      const opfPath = opfMatch ? opfMatch[1] : 'OEBPS/content.opf';
      const opfDir = opfPath.split('/').slice(0, -1).join('/');

      const opfFile = zip.file(opfPath);
      if (!opfFile) throw new Error('Invalid EPUB: missing content.opf');
      const opfContent = await opfFile.async('text');

      const itemRegex = /<item\s+[^>]*href="([^"]+)"[^>]*media-type="application\/xhtml\+xml"/g;
      const xhtmlFiles: string[] = [];
      let match;
      while ((match = itemRegex.exec(opfContent)) !== null) {
        xhtmlFiles.push(match[1]);
      }

      if (xhtmlFiles.length === 0) {
        const allItems = zip.file(/\.xhtml$|\.html$/);
        xhtmlFiles.push(...allItems.map(f => f.name));
      }

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 50;
      const fontSize = 11;
      const lineHeight = 16;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const xhtmlFile of xhtmlFiles) {
        const fullPath = opfDir ? `${opfDir}/${xhtmlFile}` : xhtmlFile;
        const fileEntry = zip.file(fullPath) || zip.file(xhtmlFile);
        if (!fileEntry) continue;

        const html = await fileEntry.async('text');
        const textContent = html
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();

        const words = textContent.split(/\s+/);
        let line = '';

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > pageWidth - margin * 2) {
            if (y - lineHeight < margin) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawText(line, { x: margin, y: y - fontSize, size: fontSize, font });
            y -= lineHeight;
            line = word;
          } else {
            line = testLine;
          }
        }

        if (line) {
          if (y - lineHeight < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(line, { x: margin, y: y - fontSize, size: fontSize, font });
          y -= lineHeight * 2;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, file.name.replace(/\.epub$/i, '.pdf'));
      toast({ title: 'EPUB converted to PDF!' });
    } catch {
      toast({ title: 'Conversion failed', description: 'Failed to convert EPUB. The file may be invalid.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/epub+zip': ['.epub'] }} maxSize={100 * 1024 * 1024} onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && <Button onClick={convert} disabled={processing} className="w-full"><Download className="w-4 h-4 mr-1" />{processing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Converting...</> : 'Convert to PDF'}</Button>}
      </div>
    </ToolLayout>
  );
}
