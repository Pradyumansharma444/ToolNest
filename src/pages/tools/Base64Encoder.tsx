import { useState, useMemo } from 'react';
import { Copy, Check, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, fileToArrayBuffer } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export default function Base64Encoder() {
  const tool = getToolById('base64-encoder')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      if (mode === 'encode') {
        return btoa(unescape(encodeURIComponent(input)));
      } else {
        return decodeURIComponent(escape(atob(input)));
      }
    } catch {
      return mode === 'encode' ? 'Encoding failed' : 'Invalid Base64 string';
    }
  }, [input, mode]);

  const isError = result === 'Encoding failed' || result === 'Invalid Base64 string';

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await fileToArrayBuffer(file);
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    setInput(btoa(binary));
    toast({ title: 'File encoded to Base64' });
  }, [toast]);

  const copyResult = () => {
    if (!isError) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'encode' ? 'default' : 'outline'} onClick={() => setMode('encode')}>Encode</Button>
          <Button size="sm" variant={mode === 'decode' ? 'default' : 'outline'} onClick={() => setMode('decode')}>Decode</Button>
          {mode === 'encode' && (
            <label className="cursor-pointer">
              <Button size="sm" variant="outline" asChild>
                <span><Upload className="w-4 h-4 mr-1" />Upload File</span>
              </Button>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          )}
        </div>
        <Textarea
          placeholder={mode === 'encode' ? 'Enter text or upload a file...' : 'Paste Base64 string...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[150px] resize-y font-mono text-sm"
        />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={isError ? 'text-destructive font-medium' : 'font-medium'}>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
              {!isError && (
                <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              )}
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className={`text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono ${isError ? 'text-destructive' : ''}`}>{result}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
