import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

export default function BcryptGenerator() {
  const tool = getToolById('bcrypt-generator')!;
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hash, setHash] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const generateHash = () => {
    if (!password) { toast({ title: 'Enter a password', variant: 'destructive' }); return; }
    const salt = bcrypt.genSaltSync(saltRounds);
    const h = bcrypt.hashSync(password, salt);
    setHash(h);
    setVerifyResult(null);
    toast({ title: 'Hash generated!' });
  };

  const verifyHash = () => {
    if (!verifyPassword || !hash) return;
    setVerifyResult(bcrypt.compareSync(verifyPassword, hash));
  };

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Hash copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={hash.length > 0}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Input type="password" placeholder="Enter password to hash..." value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Salt Rounds: {saltRounds}</label>
            <input type="range" min={4} max={15} value={saltRounds} onChange={(e) => setSaltRounds(+e.target.value)} className="flex-1" />
          </div>
          <Button onClick={generateHash}>Generate Bcrypt Hash</Button>
        </div>
        {hash && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Bcrypt Hash</span>
              <Button size="sm" variant="ghost" onClick={copyHash}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
            <pre className="text-sm font-mono break-all bg-muted p-3 rounded-lg">{hash}</pre>
          </div>
        )}
        {hash && (
          <div className="space-y-2">
            <h3 className="font-medium">Verify Password</h3>
            <div className="flex gap-2">
              <Input type="password" placeholder="Enter password to verify..." value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} />
              <Button variant="outline" onClick={verifyHash}>Verify</Button>
            </div>
            {verifyResult !== null && (
              <div className={`rounded-lg p-3 text-sm font-medium ${verifyResult ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
                {verifyResult ? 'Password matches hash ✓' : 'Password does not match hash ✗'}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
