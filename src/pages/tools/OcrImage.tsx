import { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/tools/FileUpload';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Scan, Loader2, Download, FileText, Copy, Volume2, VolumeX,
  RotateCw, RotateCcw, Sliders, Search, Trash2, Languages,
  FileJson, Sparkles
} from 'lucide-react';

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish (Español)' },
  { code: 'fra', name: 'French (Français)' },
  { code: 'deu', name: 'German (Deutsch)' },
  { code: 'chi_sim', name: 'Chinese Simplified (简体中文)' },
  { code: 'chi_tra', name: 'Chinese Traditional (繁體中文)' },
  { code: 'jpn', name: 'Japanese (日本語)' },
  { code: 'hin', name: 'Hindi (हिन्दी)' },
  { code: 'ara', name: 'Arabic (العربية)' },
  { code: 'rus', name: 'Russian (Русский)' },
  { code: 'por', name: 'Portuguese (Português)' },
  { code: 'ita', name: 'Italian (Italiano)' },
];

export default function OcrImage() {
  const tool = getToolById('ocr-image')!;
  const { toast } = useToast();

  // Core States
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('eng');

  // Filter States
  const [brightness, setBrightness] = useState<number[]>([0]);
  const [contrast, setContrast] = useState<number[]>([0]);
  const [grayscale, setGrayscale] = useState(true);
  const [threshold, setThreshold] = useState<number[]>([128]);
  const [thresholdEnabled, setThresholdEnabled] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Search & Speech States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load Image Src into HTMLImageElement
  useEffect(() => {
    if (!imageSrc) {
      setImgElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgElement(img);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply filters on canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90 = rotation === 90 || rotation === 270;
    const width = isRotated90 ? imgElement.naturalHeight : imgElement.naturalWidth;
    const height = isRotated90 ? imgElement.naturalWidth : imgElement.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imgElement, -imgElement.naturalWidth / 2, -imgElement.naturalHeight / 2);
    ctx.restore();

    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Contrast factor calculation
      const cVal = contrast[0];
      const factor = (259 * (cVal + 255)) / (255 * (259 - cVal));
      const bVal = brightness[0];
      const tVal = threshold[0];

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply Brightness
        if (bVal !== 0) {
          r += bVal;
          g += bVal;
          b += bVal;
        }

        // Apply Contrast
        if (cVal !== 0) {
          r = factor * (r - 128) + 128;
          g = factor * (g - 128) + 128;
          b = factor * (b - 128) + 128;
        }

        // Apply Grayscale
        if (grayscale || thresholdEnabled) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray;
          g = gray;
          b = gray;
        }

        // Apply Threshold
        if (thresholdEnabled) {
          const v = r >= tVal ? 255 : 0;
          r = v;
          g = v;
          b = v;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.error('Canvas processing error:', e);
    }
  }, [imgElement, brightness, contrast, grayscale, threshold, thresholdEnabled, rotation]);

  // Clean up speech synthesis
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Generate Sample Image
  const generateSampleImage = (type: 'business-card' | 'receipt' | 'book') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (type === 'business-card') {
      canvas.width = 650;
      canvas.height = 380;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradient Accent Bar
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, 15);

      // Business card details
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Julian Vance', 50, 80);

      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('DIRECTOR OF DESIGN', 50, 110);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('Innovate Studios Inc.', 50, 135);

      // Line
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 170);
      ctx.lineTo(600, 170);
      ctx.stroke();

      // Contacts
      ctx.fillStyle = '#334155';
      ctx.font = '16px monospace';
      ctx.fillText('Direct: +1 (555) 304-2094', 50, 215);
      ctx.fillText('Email:  julian@innovatestudios.co', 50, 255);
      ctx.fillText('Office: 404 Broadway Ave, NY', 50, 295);
      ctx.fillText('Portal: www.innovatestudios.co', 50, 335);

    } else if (type === 'receipt') {
      canvas.width = 450;
      canvas.height = 650;
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(15, 15, 420, 620);
      ctx.setLineDash([]);

      ctx.fillStyle = '#1c1917';
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('NEXUS CLOUD SYSTEMS', 225, 60);
      ctx.font = '12px monospace';
      ctx.fillText('100 TECHNOPORT PARK, SAN JOSE, CA', 225, 85);
      ctx.fillText('TRANS NO: 99482810 / TERM: 04', 225, 105);
      ctx.fillText('==================================', 225, 130);

      ctx.textAlign = 'left';
      ctx.font = '14px monospace';
      let y = 165;
      const items = [
        { name: '1  Pro Subscription (Monthly)', price: '$49.00' },
        { name: '5  Extra Team Seats License', price: '$25.00' },
        { name: '1  Dedicated IPv6 Addon', price: '$10.00' },
        { name: '1  Advanced CDN Edge Router', price: '$15.50' },
      ];
      items.forEach(item => {
        ctx.fillText(item.name, 40, y);
        ctx.textAlign = 'right';
        ctx.fillText(item.price, 410, y);
        ctx.textAlign = 'left';
        y += 35;
      });

      ctx.textAlign = 'center';
      ctx.fillText('----------------------------------', 225, y);
      y += 30;

      ctx.textAlign = 'left';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('SUBTOTAL', 40, y);
      ctx.textAlign = 'right';
      ctx.fillText('$99.50', 410, y);
      ctx.textAlign = 'left';
      y += 35;

      ctx.font = '14px monospace';
      ctx.fillText('VAT TAX (8.25%)', 40, y);
      ctx.textAlign = 'right';
      ctx.fillText('$8.21', 410, y);
      ctx.textAlign = 'left';
      y += 40;

      ctx.font = 'bold 20px monospace';
      ctx.fillText('TOTAL PAID', 40, y);
      ctx.textAlign = 'right';
      ctx.fillText('$107.71', 410, y);
      ctx.textAlign = 'left';
      y += 50;

      ctx.textAlign = 'center';
      ctx.font = 'italic 12px monospace';
      ctx.fillText('THANK YOU FOR SUPPORTING TECH NEST', 225, y);
      ctx.fillText('SUPPORT: COMPLIANCE@NEXUS.IO', 225, y + 22);

    } else if (type === 'book') {
      canvas.width = 700;
      canvas.height = 420;
      ctx.fillStyle = '#faf6ef';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#2d271e';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('THE GOLD-BUG. PART I', 50, 70);

      ctx.font = 'italic 14px Georgia, serif';
      ctx.fillText('By Edgar Allan Poe', 50, 100);

      ctx.font = '16px Georgia, serif';
      const p1 = 'Many years ago, I contracted an intimacy with a Mr. William Legrand. He was of an ancient Huguenot family, and had once been wealthy; but a series of misfortunes had reduced him to want. To avoid the mortification consequent upon his disasters, he left New Orleans, the city of his forefathers, and took up his residence at Sullivan\'s Island, near Charleston, South Carolina.';
      const p2 = 'This Island is a very singular one. It consists of little else than the sea sand, and is about three miles long. Its breadth at no point exceeds a quarter of a mile. It is separated from the main land by a scarcely perceptible creek, oozing its way through a wilderness of reeds and slime, a favorite resort of the marsh-hen.';

      const wrap = (textStr: string, sx: number, sy: number, maxW: number, lh: number) => {
        const words = textStr.split(' ');
        let currentLine = '';
        let currentY = sy;
        for (let i = 0; i < words.length; i++) {
          const test = currentLine + words[i] + ' ';
          const metrics = ctx.measureText(test);
          if (metrics.width > maxW && i > 0) {
            ctx.fillText(currentLine, sx, currentY);
            currentLine = words[i] + ' ';
            currentY += lh;
          } else {
            currentLine = test;
          }
        }
        ctx.fillText(currentLine, sx, currentY);
        return currentY + lh;
      };

      const endY = wrap(p1, 50, 145, 600, 26);
      wrap(p2, 50, endY + 15, 600, 26);
    }

    return canvas.toDataURL('image/png');
  };

  const handleSelectSample = (type: 'business-card' | 'receipt' | 'book') => {
    const sampleUrl = generateSampleImage(type);
    setImageSrc(sampleUrl);

    const names = {
      'business-card': 'sample-business-card.png',
      'receipt': 'sample-receipt.png',
      'book': 'sample-book-passage.png',
    };

    const virtualFile = new File([], names[type], { type: 'image/png' });
    setFile(virtualFile);
    setText('');
    setProgress(0);
    setStatus('');
    toast({
      title: `${type.replace('-', ' ').toUpperCase()} sample loaded`,
      description: 'Image loaded in workspace. Adjust filters or click Extract Text.'
    });
  };

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(selected);
      setText('');
      setProgress(0);
      setStatus('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImageSrc(null);
    setImgElement(null);
    setText('');
    setProgress(0);
    setStatus('');
    setBrightness([0]);
    setContrast([0]);
    setGrayscale(true);
    setThreshold([128]);
    setThresholdEnabled(false);
    setRotation(0);
  };

  const resetFilters = () => {
    setBrightness([0]);
    setContrast([0]);
    setGrayscale(true);
    setThreshold([128]);
    setThresholdEnabled(false);
    setRotation(0);
    toast({ title: 'Filters Reset', description: 'All image filters restored to defaults.' });
  };

  const runOcr = async () => {
    if (!canvasRef.current) return;
    setProcessing(true);
    setProgress(0);
    setStatus('Initializing OCR engine...');

    try {
      const canvas = canvasRef.current;
      const result = await Tesseract.recognize(canvas, language, {
        logger: (m) => {
          // Format status messages for display
          const cleanStatus = m.status.replace(/_/g, ' ');
          const formatted = cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1);
          setStatus(formatted);

          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      setText(result.data.text || 'No text recognized in image.');
      toast({ title: 'OCR Complete', description: 'Extracted text loaded below.' });
    } catch (err) {
      console.error('OCR failed:', err);
      toast({ title: 'OCR Failed', description: 'An error occurred during text extraction.', variant: 'destructive' });
    } finally {
      setProcessing(false);
      setProgress(0);
      setStatus('');
    }
  };

  // Speak aloud using TTS
  const handleSpeak = () => {
    if (!text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      eng: 'en-US',
      spa: 'es-ES',
      fra: 'fr-FR',
      deu: 'de-DE',
      chi_sim: 'zh-CN',
      chi_tra: 'zh-TW',
      jpn: 'ja-JP',
      hin: 'hi-IN',
      ara: 'ar-SA',
      rus: 'ru-RU',
      por: 'pt-PT',
      ita: 'it-IT',
    };

    utterance.lang = langMap[language] || 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
  };

  const downloadAsFormat = (format: 'txt' | 'json' | 'html') => {
    if (!text) return;

    if (format === 'txt') {
      downloadFile(text, 'extracted-text.txt', 'text/plain');
    } else if (format === 'json') {
      const data = {
        extractedAt: new Date().toISOString(),
        language,
        stats: {
          characters: text.length,
          words: text.trim().split(/\s+/).filter(Boolean).length,
          lines: text.split('\n').length,
        },
        text,
      };
      downloadFile(JSON.stringify(data, null, 2), 'extracted-text.json', 'application/json');
    } else if (format === 'html') {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OCR Extracted Text</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 2.5rem; max-width: 800px; margin: 0 auto; color: #0f172a; background: #f8fafc; }
    .container { background: #ffffff; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    h1 { font-size: 1.75rem; margin-top: 0; color: #1e1b4b; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.75rem; }
    pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.95rem; line-height: 1.6; color: #334155; margin-top: 1.5rem; }
    .meta { font-size: 0.85rem; color: #64748b; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>OCR Extracted Text</h1>
    <div class="meta"><strong>Extracted on:</strong> ${new Date().toLocaleString()} &nbsp;|&nbsp; <strong>Source Language:</strong> ${language}</div>
    <pre>${text}</pre>
  </div>
</body>
</html>`;
      downloadFile(htmlContent, 'extracted-text.html', 'text/html');
    }
  };

  const getHighlightedText = (sourceText: string, query: string) => {
    if (!query) return sourceText;
    const parts = sourceText.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/60 text-yellow-950 dark:text-yellow-100 px-0.5 rounded-xs font-semibold border-b border-yellow-400 dark:border-yellow-600">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Metric Calculation
  const wordsCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const linesCount = text ? text.split('\n').length : 0;
  const charsCount = text ? text.length : 0;
  const readingTime = Math.max(1, Math.round(wordsCount / 200));
  const speakingTime = Math.max(1, Math.round(wordsCount / 130));
  const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size;

  return (
    <ToolLayout tool={tool} resultVisible={!!text}>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <strong className="font-semibold text-foreground">Interactive OCR Studio:</strong> Convert images to editable text instantly in the browser. 
            Adjust contrast and brightness values or enable binarization to optimize lower-quality text images for superior extraction results.
          </div>
        </div>

        {/* Setup Controls (Language & Preset Samples) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-primary/10 bg-card">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" /> OCR Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-0 pb-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-primary/10 bg-card">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Instant Practice Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 py-0 pb-4">
              <Button variant="outline" size="sm" onClick={() => handleSelectSample('business-card')} className="text-xs">
                Business Card
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSelectSample('receipt')} className="text-xs">
                Restaurant Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSelectSample('book')} className="text-xs">
                Classic Novel Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace (Uploader / Editor Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: Image upload and preprocessor */}
          <div className="lg:col-span-6 space-y-6">
            {!imageSrc ? (
              <FileUpload
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp'] }}
                onFilesSelected={handleFileSelected}
                selectedFile={file}
                onFileRemoved={handleRemoveFile}
                label="Upload Document Image"
                description="Drag & drop your text photo, or click to browse"
              />
            ) : (
              <Card className="border-primary/10 overflow-hidden bg-card">
                <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Image Workspace</CardTitle>
                    <CardDescription className="text-xs">Optimize visual qualities for high accuracy OCR</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  {/* Canvas Render with Checkerboard pattern container */}
                  <div className="relative overflow-hidden rounded-xl border bg-slate-900/5 dark:bg-slate-950/20 flex items-center justify-center p-4 min-h-[300px] border-dashed">
                    <canvas ref={canvasRef} className="max-w-full max-h-[320px] object-contain rounded-lg shadow-lg border border-border" />
                  </div>

                  {/* Preprocessing Sliders */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" /> Pre-processing Filters
                      </Label>
                      <Button variant="link" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs text-primary">
                        Reset Filters
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Brightness */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>Brightness</span>
                          <span className="font-mono text-muted-foreground">{brightness[0] > 0 ? `+${brightness[0]}` : brightness[0]}</span>
                        </div>
                        <Slider
                          min={-100}
                          max={100}
                          step={1}
                          value={brightness}
                          onValueChange={setBrightness}
                        />
                      </div>

                      {/* Contrast */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>Contrast</span>
                          <span className="font-mono text-muted-foreground">{contrast[0] > 0 ? `+${contrast[0]}` : contrast[0]}</span>
                        </div>
                        <Slider
                          min={-100}
                          max={100}
                          step={1}
                          value={contrast}
                          onValueChange={setContrast}
                        />
                      </div>

                      {/* Rotator */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs">Rotation Angle</span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                            title="Rotate 90 Left"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <span className="text-xs font-mono w-12 text-center">{rotation}°</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            title="Rotate 90 Right"
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Binarization / Threshold Switches */}
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="grayscale-switch" className="text-xs cursor-pointer">Force Grayscale</Label>
                          <Switch
                            id="grayscale-switch"
                            checked={grayscale || thresholdEnabled}
                            disabled={thresholdEnabled}
                            onCheckedChange={setGrayscale}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="threshold-switch" className="text-xs cursor-pointer">Binarize (B&W)</Label>
                          <Switch
                            id="threshold-switch"
                            checked={thresholdEnabled}
                            onCheckedChange={setThresholdEnabled}
                          />
                        </div>
                      </div>

                      {/* Binarize Slider */}
                      {thresholdEnabled && (
                        <div className="space-y-1.5 pt-2 animate-in slide-in-from-top-1 duration-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">B&W Cutoff Level</span>
                            <span className="font-mono text-muted-foreground">{threshold[0]}</span>
                          </div>
                          <Slider
                            min={0}
                            max={255}
                            step={1}
                            value={threshold}
                            onValueChange={setThreshold}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trigger Button */}
                  <Button onClick={runOcr} disabled={processing} className="w-full mt-4" size="lg">
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Extract Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right panel: Extracted results & processing state */}
          <div className="lg:col-span-6">
            {processing && (
              <Card className="border-primary/10 bg-card p-6 flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-semibold text-sm">Processing OCR</h3>
                  <p className="text-xs text-muted-foreground">{status || 'Extracting characters...'}</p>
                </div>
                <div className="w-full max-w-xs space-y-1.5">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground font-mono">{progress}% Completed</p>
                </div>
              </Card>
            )}

            {!processing && text && (
              <Card className="border-primary/10 overflow-hidden bg-card animate-in fade-in duration-300">
                <CardHeader className="py-4 border-b flex flex-row items-center justify-between gap-4 flex-wrap bg-muted/20">
                  <div>
                    <CardTitle className="text-sm font-semibold">Extracted Text</CardTitle>
                    <CardDescription className="text-xs">Edit, search, read aloud, or export results</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* TTS Action */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSpeak}
                      title={isSpeaking ? 'Mute' : 'Read Aloud'}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    {/* Copy Action */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyToClipboard}
                      title="Copy Text"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    {/* Downloads Menu */}
                    <Select onValueChange={(val) => downloadAsFormat(val as 'txt' | 'json' | 'html')}>
                      <SelectTrigger size="sm" className="h-8 gap-1 border-muted pr-2">
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">Download</span>
                      </SelectTrigger>
                      <SelectContent position="popper" align="end">
                        <SelectItem value="txt">
                          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Plain Text (.txt)</span>
                        </SelectItem>
                        <SelectItem value="json">
                          <span className="flex items-center gap-2"><FileJson className="w-3.5 h-3.5" /> JSON Structure (.json)</span>
                        </SelectItem>
                        <SelectItem value="html">
                          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Styled Webpage (.html)</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <Tabs defaultValue="editor" className="w-full">
                  <div className="px-4 border-b bg-muted/10">
                    <TabsList className="bg-transparent border-b-0 h-10 p-0 gap-4">
                      <TabsTrigger value="editor" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1">
                        Text Editor
                      </TabsTrigger>
                      <TabsTrigger value="search" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1">
                        Search & Highlights
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1">
                        Document Insights
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-4">
                    {/* Editor Tab */}
                    <TabsContent value="editor" className="mt-0 focus-visible:outline-none">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[280px] font-mono text-sm leading-relaxed focus-visible:ring-1 resize-y"
                        placeholder="OCR extracted text will display here..."
                      />
                    </TabsContent>

                    {/* Search & Highlights Tab */}
                    <TabsContent value="search" className="mt-0 space-y-4 focus-visible:outline-none">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Type keywords to search..."
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="border rounded-xl p-4 bg-muted/15 min-h-[220px] max-h-[350px] overflow-y-auto font-mono text-sm whitespace-pre-wrap leading-relaxed">
                        {getHighlightedText(text, searchQuery)}
                      </div>
                    </TabsContent>

                    {/* Analysis Insights Tab */}
                    <TabsContent value="analysis" className="mt-0 focus-visible:outline-none">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Characters</span>
                          <p className="text-xl font-bold font-mono text-foreground">{charsCount}</p>
                        </div>
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Words</span>
                          <p className="text-xl font-bold font-mono text-foreground">{wordsCount}</p>
                        </div>
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Paragraph Lines</span>
                          <p className="text-xl font-bold font-mono text-foreground">{linesCount}</p>
                        </div>
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Unique Words</span>
                          <p className="text-xl font-bold font-mono text-foreground">{uniqueWords}</p>
                        </div>
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Reading Duration</span>
                          <p className="text-xl font-bold text-foreground">~{readingTime} <span className="text-xs font-normal text-muted-foreground">min</span></p>
                        </div>
                        <div className="rounded-xl border p-3.5 bg-muted/10 space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Speaking Duration</span>
                          <p className="text-xl font-bold text-foreground">~{speakingTime} <span className="text-xs font-normal text-muted-foreground">min</span></p>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            )}

            {!processing && !text && (
              <div className="border border-dashed border-muted-foreground/20 rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[350px] bg-muted/5">
                <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-sm mb-1 text-foreground">Workspace Output</h3>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  Extracted text will render in this layout once you execute the OCR compiler on your workspace image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
