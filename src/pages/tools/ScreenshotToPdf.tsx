import { useState } from 'react';
import { Upload, ArrowUp, ArrowDown, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { PDFDocument } from 'pdf-lib';
import type { Tool } from '@/types';

interface ImageFile {
  id: string;
  name: string;
  src: string; // dataUrl
  type: string; // image/png or image/jpeg
}

export default function ScreenshotToPdf() {
  const tool = getToolById('screenshot-to-pdf') || {
    id: 'screenshot-to-pdf',
    name: 'Screenshot to PDF Converter',
    description: 'Convert and merge multiple screenshots or images into a single multi-page PDF document.',
    metaTitle: 'Free Screenshot to PDF Converter - Merge Images | ToolNest',
    metaDescription: 'Batch upload screenshots or pictures. Reorder pages, adjust margins, and export directly as a PDF.',
    category: 'image',
  };

  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4'>('fit');
  const [margin, setMargin] = useState<'none' | 'small' | 'large'>('none');
  const [loading, setLoading] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const newImg: ImageFile = {
          id: crypto.randomUUID(),
          name: file.name,
          src,
          type: file.type,
        };
        setImages((prev) => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  // List movement controllers
  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  // Convert Base64 DataUrl to Uint8Array helper
  const dataUrlToBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1];
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();

      // Set margin constants in points (1 inch = 72 points)
      let m = 0;
      if (margin === 'small') m = 20;
      else if (margin === 'large') m = 40;

      for (const imgFile of images) {
        const imageBytes = dataUrlToBytes(imgFile.src);
        let embeddedImage;

        // Embed based on format
        if (imgFile.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          // Default to JPG for other types
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }

        // Get image dimensions
        const { width: imgW, height: imgH } = embeddedImage.scale(1);

        let pageW = imgW + m * 2;
        let pageH = imgH + m * 2;
        let drawW = imgW;
        let drawH = imgH;

        if (pageSize === 'a4') {
          // Standard A4 dimensions in points: 595.27 x 841.89
          pageW = 595.27;
          pageH = 841.89;

          const printableW = pageW - m * 2;
          const printableH = pageH - m * 2;

          // Scale image keeping aspect ratio
          const scale = Math.min(printableW / imgW, printableH / imgH);
          drawW = imgW * scale;
          drawH = imgH * scale;
        }

        const page = pdfDoc.addPage([pageW, pageH]);

        // Draw centered inside margins
        const xPos = (pageW - drawW) / 2;
        const yPos = (pageH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_images.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error generating PDF. Please ensure all uploaded files are valid PNG/JPG images.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool as Tool} resultVisible={images.length > 0}>
      <div className="space-y-6">
        {images.length === 0 ? (
          // Empty state upload area
          <div className="flex justify-center">
            <label className="flex flex-col items-center justify-center w-full max-w-xl h-64 border-2 border-dashed rounded-xl cursor-pointer bg-card hover:bg-muted/30 transition-colors border-muted-foreground/30">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                <Upload className="w-10 h-10 mb-3 animate-pulse" />
                <p className="text-sm font-semibold mb-1">Upload screenshots or photos</p>
                <p className="text-xs">PNG, JPG, JPEG or WebP (Multiple select allowed)</p>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Options Panel */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-2">Export Configuration</h3>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Page Formatting</label>
                <Select value={pageSize} onValueChange={(val: string) => setPageSize(val as 'fit' | 'a4')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit page to image size</SelectItem>
                    <SelectItem value="a4">Standard A4 Sheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Margins</label>
                <Select value={margin} onValueChange={(val: string) => setMargin(val as 'none' | 'small' | 'large')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No margins (Full Bleed)</SelectItem>
                    <SelectItem value="small">Small margins (20pt)</SelectItem>
                    <SelectItem value="large">Large margins (40pt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button onClick={generatePdf} disabled={loading} className="w-full gap-1.5">
                  <Download className="w-4 h-4" /> {loading ? 'Compiling PDF...' : 'Merge & Download PDF'}
                </Button>
                <Button variant="outline" onClick={clearAll} className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear All
                </Button>
              </div>
            </div>

            {/* List / Ordering Panel */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">
                  Arrange Pages ({images.length} Images loaded)
                </span>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  + Add More Images
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                </label>
              </div>

              {/* List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded border bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img src={img.src} alt="thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate max-w-[180px] sm:max-w-[300px]">{img.name}</p>
                        <span className="text-[10px] text-muted-foreground uppercase">Page {idx + 1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="h-7 w-7"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveDown(idx)}
                        disabled={idx === images.length - 1}
                        className="h-7 w-7"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(img.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
