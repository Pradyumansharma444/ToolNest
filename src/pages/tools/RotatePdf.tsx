import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { RotateCw, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function RotatePdf() {
  const tool = getToolById('rotate-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  };

  const rotatePdf = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const rotatedBytes = await pdfDoc.save();
      const blob = uint8ToBlob(rotatedBytes, "application/pdf");
      setResult(blob);
      downloadBlob(blob, 'rotated.pdf');
      toast({ title: 'Success!', description: `PDF rotated ${rotation} degrees.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to rotate PDF.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const rotations: { value: 90 | 180 | 270; label: string }[] = [
    { value: 90, label: '90° Clockwise' },
    { value: 180, label: '180°' },
    { value: 270, label: '90° Counter-clockwise' },
  ];

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setResult(null); }}
          label="Upload PDF to Rotate"
        />

        {file && (
          <div className="rounded-xl border bg-card p-5">
            <label className="text-sm font-medium mb-3 block">Rotation</label>
            <div className="flex gap-2 flex-wrap">
              {rotations.map(r => (
                <Button
                  key={r.value}
                  variant={rotation === r.value ? 'default' : 'outline'}
                  onClick={() => setRotation(r.value)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {file && (
          <Button onClick={rotatePdf} disabled={processing} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rotating...</>
            ) : (
              <><RotateCw className="w-4 h-4 mr-2" /> Rotate PDF</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              PDF rotated {rotation} degrees successfully!
            </p>
            <Button onClick={() => downloadBlob(result, 'rotated.pdf')}>
              <Download className="w-4 h-4 mr-2" /> Download Rotated PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
