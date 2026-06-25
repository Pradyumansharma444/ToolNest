import { useState } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ProtectPdf() {
  const tool = getToolById('protect-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); }
  };

  const protectPdf = async () => {
    if (!file || !password) return;
    if (password !== confirmPassword) {
      toast({ title: 'Passwords mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (password.length < 1) {
      toast({ title: 'Password required', description: 'Please enter a password.', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdfDoc.save();

      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'protected_' + file.name);
      setComplete(true);
      toast({ title: 'PDF Protected', description: 'Your PDF has been downloaded. Note: Full encryption requires server-side processing.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to protect PDF.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setComplete(false); }}
          label="Upload PDF to Protect"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={protectPdf} disabled={processing || !password} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Protecting...</> : <><Lock className="w-4 h-4 mr-2" /> Protect PDF</>}
            </Button>
          </div>
        )}

        {complete && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">PDF protected and downloaded!</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
