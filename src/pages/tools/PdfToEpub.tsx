import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import JSZip from 'jszip';

export default function PdfToEpub() {
  const tool = getToolById('pdf-to-epub')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string }; version: string }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as unknown as { version: string }).version || '5.6.205'}/build/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: buf }).promise as { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> };
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: { str: string }) => item.str).join(' ');
        pages.push(text);
      }

      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');

      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
      zip.file('META-INF/container.xml', containerXml);

      const title = file.name.replace(/\.pdf$/i, '');
      const chapters = pages.map((_text, i) => {
        return `    <item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`;
      }).join('\n');

      const spineItems = pages.map((_, i) => `    <itemref idref="chapter${i + 1}"/>`).join('\n');

      const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title.replace(/&/g, '&amp;')}</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${chapters}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;
      zip.file('OEBPS/content.opf', contentOpf);

      const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/></head>
  <docTitle><text>${title.replace(/&/g, '&amp;')}</text></docTitle>
  <navMap>
${pages.map((_, i) => `    <navPoint id="navPoint-${i + 1}"><navLabel><text>Page ${i + 1}</text></navLabel><content src="chapter${i + 1}.xhtml"/></navPoint>`).join('\n')}
  </navMap>
</ncx>`;
      zip.file('OEBPS/toc.ncx', tocNcx);

      pages.forEach((text, i) => {
        const paragraphs = text.split(/\n+/).filter(p => p.trim())
          .map(p => `      <p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
          .join('\n');
        const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>Page ${i + 1}</title></head>
  <body>
    <h2>Page ${i + 1}</h2>
${paragraphs}
  </body>
</html>`;
        zip.file(`OEBPS/chapter${i + 1}.xhtml`, xhtml);
      });

      const epubBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(epubBlob, file.name.replace(/\.pdf$/i, '.epub'));
      toast({ title: 'PDF converted to EPUB!', description: `Converted ${pdf.numPages} pages.` });
    } catch {
      toast({ title: 'Conversion failed', description: 'Failed to convert PDF to EPUB.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!file}>
      <div className="space-y-4">
        <FileUpload accept={{ 'application/pdf': ['.pdf'] }} maxSize={100 * 1024 * 1024} onFilesSelected={(f) => setFile(f[0])} onFileRemoved={() => setFile(null)} selectedFile={file} />
        {file && <Button onClick={convert} disabled={processing} className="w-full"><Download className="w-4 h-4 mr-1" />{processing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Converting...</> : 'Convert to EPUB'}</Button>}
      </div>
    </ToolLayout>
  );
}
