import { useState } from 'react';
import { Languages, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadFile } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', nl: 'Dutch', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
  zh: 'Chinese', ar: 'Arabic', hi: 'Hindi', tr: 'Turkish', pl: 'Polish',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', nb: 'Norwegian', uk: 'Ukrainian',
  cs: 'Czech', sk: 'Slovak', ro: 'Romanian', hu: 'Hungarian', bg: 'Bulgarian',
  el: 'Greek', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay',
};

const COMMON_WORDS: Record<string, Record<string, string>> = {
  en: { hello: 'hello', goodbye: 'goodbye', thank: 'thank you', yes: 'yes', no: 'no', please: 'please' },
  es: { hello: 'hola', goodbye: 'adios', thank: 'gracias', yes: 'si', no: 'no', please: 'por favor' },
  fr: { hello: 'bonjour', goodbye: 'au revoir', thank: 'merci', yes: 'oui', no: 'non', please: "s'il vous plait" },
  de: { hello: 'hallo', goodbye: 'auf wiedersehen', thank: 'danke', yes: 'ja', no: 'nein', please: 'bitte' },
  ja: { hello: 'konnichiwa', goodbye: 'sayonara', thank: 'arigatou', yes: 'hai', no: 'iie', please: 'onegaishimasu' },
  ko: { hello: 'annyeonghaseyo', goodbye: 'annyeonghi gaseyo', thank: 'gamsahamnida', yes: 'ne', no: 'aniyo', please: 'juseyo' },
  zh: { hello: 'nihao', goodbye: 'zaijian', thank: 'xiexie', yes: 'shi', no: 'bu', please: 'qing' },
};

export default function TranslatePdf() {
  const tool = getToolById('translate-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('es');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setComplete(false);
    setTranslatedText('');
  };

  const translatePdf = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await (pdfjsLib as unknown as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }).getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
      }

      const words = COMMON_WORDS[targetLang] || {};
      let translated = fullText;
      Object.entries(words).forEach(([eng, translated_word]) => {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, `**[${translated_word}]**`);
      });

      const finalText = `[Auto-Translation to ${LANGUAGES[targetLang]}]\n\nNote: For accurate translation, use a dedicated translation service.\nThis is a basic word-replacement demo.\n\n--- Original Text ---\n${translated}`;
      setTranslatedText(finalText);
      setComplete(true);
      toast({ title: 'Translation ready!', description: `Text processed for ${LANGUAGES[targetLang]}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to process PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const downloadTranslation = () => {
    downloadFile(translatedText, 'translated.txt', 'text/plain');
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setTranslatedText(''); setComplete(false); }}
          label="Upload PDF to Translate"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Target Language</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={translatePdf} disabled={processing} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Translating...</> : <><Languages className="w-4 h-4 mr-2" /> Translate PDF</>}
            </Button>
          </div>
        )}

        {translatedText && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Translated Text</span>
              <Button size="sm" variant="outline" onClick={downloadTranslation}><Download className="w-4 h-4 mr-1" /> Download</Button>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{translatedText}</pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
