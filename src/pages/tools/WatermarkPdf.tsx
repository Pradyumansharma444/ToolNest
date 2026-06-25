import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Droplets, Loader2, Download, Type, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function WatermarkPdf() {
  const tool = getToolById('watermark-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  };

  const addWatermark = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      pages.forEach(page => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        // Center position with rotation
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity / 100,
          rotate: degrees(rotation),
        });
      });

      const watermarkedBytes = await pdfDoc.save();
      const blob = uint8ToBlob(watermarkedBytes, "application/pdf");
      setResult(blob);
      downloadBlob(blob, 'watermarked.pdf');
      toast({ title: 'Success!', description: 'Watermark added to all pages.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add watermark.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setResult(null); }}
          label="Upload PDF"
        />

        {file && (
          <Tabs defaultValue="text" className="rounded-xl border bg-card p-5">
            <TabsList className="mb-4">
              <TabsTrigger value="text">
                <Type className="w-4 h-4 mr-1" /> Text
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Image className="w-4 h-4 mr-1" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Watermark Text</label>
                <Input
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Opacity: {opacity}%</label>
                <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} min={5} max={100} step={5} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Font Size: {fontSize}px</label>
                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={12} max={120} step={4} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Rotation: {rotation}°</label>
                <Slider value={[rotation]} onValueChange={(v) => setRotation(v[0])} min={0} max={360} step={15} className="mt-2" />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {file && (
          <Button onClick={addWatermark} disabled={processing || !watermarkText} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...</>
            ) : (
              <><Droplets className="w-4 h-4 mr-2" /> Add Watermark</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Watermark applied successfully!
            </p>
            <Button onClick={() => downloadBlob(result, 'watermarked.pdf')}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
