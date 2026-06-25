import { useState } from 'react';
import { PDFDocument, type LoadOptions } from 'pdf-lib';
import { Unlock, Loader2, Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, uint8ToBlob } from '@/data/tools';
import { downloadBlob } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function UnlockPdf() {
  const tool = getToolById('unlock-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  };

  const unlockPdf = async () => {
    if (!file || !password) {
      toast({ title: 'Missing info', description: 'Please provide both a PDF and password.', variant: 'destructive' });
      return;
    }
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password } as LoadOptions & { password?: string });
      const unlockedBytes = await pdfDoc.save();
      const blob = uint8ToBlob(unlockedBytes, "application/pdf");
      setResult(blob);
      downloadBlob(blob, 'unlocked.pdf');
      toast({ title: 'Success!', description: 'PDF password removed successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Incorrect password or invalid PDF.', variant: 'destructive' });
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
          onFileRemoved={() => { setFile(null); setResult(null); setPassword(''); }}
          label="Upload Protected PDF"
        />

        {file && (
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <label className="text-sm font-medium">PDF Password</label>
            </div>
            <Input
              type="password"
              placeholder="Enter the PDF password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlockPdf()}
            />
            <p className="text-xs text-muted-foreground">
              Enter the current password to remove protection. This only works if you know the password.
            </p>
          </div>
        )}

        {file && (
          <Button onClick={unlockPdf} disabled={processing || !password} size="lg" className="w-full">
            {processing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Unlocking...</>
            ) : (
              <><Unlock className="w-4 h-4 mr-2" /> Remove Password</>
            )}
          </Button>
        )}

        {result && (
          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-3">
              Password removed successfully!
            </p>
            <Button onClick={() => downloadBlob(result, 'unlocked.pdf')}>
              <Download className="w-4 h-4 mr-2" /> Download Unlocked PDF
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
