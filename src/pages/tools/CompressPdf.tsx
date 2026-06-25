import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Minimize2, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, formatBytes, uint8ToBlob, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function CompressPdf() {
  const tool = getToolById('compress-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number; compressedSize: number } | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  };

  const compressPdf = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Remove metadata for basic compression
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      const compressionLevel = quality <= 30 ? 0 : quality <= 60 ? 3 : 5;
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const compressedPdf = await PDFDocument.load(compressedBytes);
      const finalBytes = await compressedPdf.save({
        useObjectStreams: true,
        objectsPerTick: compressionLevel,
      });

      const blob = uint8ToBlob(finalBytes, 'application/pdf');
      setResult({
        blob,
        originalSize: file.size,
        compressedSize: blob.size,
      });
      downloadBlob(blob, 'compressed.pdf');
      toast({ title: 'Compression complete!', description: `Saved ${formatBytes(file.size - blob.size)}` });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to compress PDF. Try a different file.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const reduction = result ? Math.round((1 - result.compressedSize / result.originalSize) * 100) : 0;

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setResult(null); }}
          label="Upload PDF to Compress"
        />

        {file && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div>
              <label className="text-sm font-medium">Compression Quality: {quality}%</label>
              <Slider
                value={[quality]}
                onValueChange={(v) => setQuality(v[0])}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Original: {formatBytes(file.size)}</span>
            </div>
          </div>
        )}

        {file && (
          <Button
            onClick={compressPdf}
            disabled={processing}
            size="lg"
            className="w-full"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Compressing...</>
            ) : (
              <><Minimize2 className="w-4 h-4 mr-2" /> Compress PDF</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-semibold">Compression Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="font-semibold">{formatBytes(result.originalSize)}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Compressed</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatBytes(result.compressedSize)}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                <p className="text-xs text-blue-600 dark:text-blue-400">Saved</p>
                <p className="font-semibold text-blue-700 dark:text-blue-300">{reduction}%</p>
              </div>
            </div>
            <Button onClick={() => downloadBlob(result.blob, 'compressed.pdf')} className="w-full">
              <Download className="w-4 h-4 mr-2" /> Download Compressed PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
