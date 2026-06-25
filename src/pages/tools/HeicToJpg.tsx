import { useState } from 'react';
import { Upload, FileImage, Download, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import heic2any from 'heic2any';

interface ConversionItem {
  id: string;
  name: string;
  size: number;
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  resultUrl?: string;
  error?: string;
}

export default function HeicToJpg() {
  const tool = getToolById('heic-to-jpg') || {
    id: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    description: 'Convert iPhone HEIC/HEIF photos to standard JPG format in your browser.',
    metaTitle: 'Free HEIC to JPG Photo Converter | ToolNest',
    metaDescription: 'Convert HEIC images to JPG or JPEG client-side. Supports batch uploads and custom compression quality settings.',
    category: 'image',
  };

  const [files, setFiles] = useState<ConversionItem[]>([]);
  const [quality, setQuality] = useState<number>(0.85);
  const [convertingAll, setConvertingAll] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    const newItems: ConversionItem[] = uploadedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      file,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newItems]);
  };

  const convertSingle = async (item: ConversionItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: 'converting', error: undefined } : f))
    );

    try {
      const conversionResult = await heic2any({
        blob: item.file,
        toType: 'image/jpeg',
        quality: quality,
      });

      const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      const resultUrl = URL.createObjectURL(blob);

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'completed', resultUrl } : f))
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'failed', error: errorMessage } : f))
      );
    }
  };

  const convertAll = async () => {
    if (files.length === 0) return;
    setConvertingAll(true);

    const pending = files.filter((f) => f.status === 'pending' || f.status === 'failed');
    for (const item of pending) {
      await convertSingle(item);
    }

    setConvertingAll(false);
  };

  const downloadResult = (item: ConversionItem) => {
    if (!item.resultUrl) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;
    // Replace original extension with .jpg
    const newName = item.name.replace(/\.[^/.]+$/, '') + '.jpg';
    link.download = newName;
    link.click();
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    setFiles([]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasPending = files.some((f) => f.status === 'pending' || f.status === 'failed');

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={files.length > 0}>
      <div className="space-y-6">
        {files.length === 0 ? (
          // Empty State Upload
          <div className="flex justify-center">
            <label className="flex flex-col items-center justify-center w-full max-w-xl h-64 border-2 border-dashed rounded-xl cursor-pointer bg-card hover:bg-muted/30 transition-colors border-muted-foreground/30">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                <Upload className="w-10 h-10 mb-3" />
                <p className="text-sm font-semibold mb-1">Upload HEIC images</p>
                <p className="text-xs">Select one or more .heic / .heif files</p>
              </div>
              <input type="file" multiple accept=".heic,.heif" className="hidden" onChange={handleFiles} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Options Panel */}
            <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit shadow-sm text-sm">
              <h3 className="font-semibold text-base mb-2">Options</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>JPG Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={[quality]}
                  onValueChange={(val) => setQuality(val[0])}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button onClick={convertAll} disabled={convertingAll || !hasPending} className="w-full gap-1.5">
                  <RefreshCw className={`w-4 h-4 ${convertingAll ? 'animate-spin' : ''}`} />
                  {convertingAll ? 'Converting...' : 'Convert All Pending'}
                </Button>
                <Button variant="outline" onClick={clearAll} className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear All
                </Button>
              </div>
            </div>

            {/* Processing Batch List */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">
                  Batch Conversion Queue ({files.length} Photos)
                </span>
                <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                  + Add More Photos
                  <input type="file" multiple accept=".heic,.heif" className="hidden" onChange={handleFiles} />
                </label>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileImage className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate max-w-[200px] sm:max-w-[320px]">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatBytes(item.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status indicator */}
                      {item.status === 'converting' && (
                        <span className="text-blue-500 animate-pulse font-semibold">Converting...</span>
                      )}
                      {item.status === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Ready
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="flex items-center gap-1 text-red-500 font-semibold" title={item.error}>
                          <AlertCircle className="w-4 h-4" /> Failed
                        </span>
                      )}

                      {/* Actions */}
                      {item.status === 'completed' && item.resultUrl && (
                        <Button size="icon" variant="ghost" onClick={() => downloadResult(item)} className="h-7 w-7 text-primary">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {item.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => convertSingle(item)} className="h-7 text-[10px]">
                          Convert
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(item.id)}
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
