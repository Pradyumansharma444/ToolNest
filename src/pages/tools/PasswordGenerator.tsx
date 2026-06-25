import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export default function PasswordGenerator() {
  const tool = getToolById('password-generator')!;
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let chars = '';
    if (uppercase) chars += CHARS.uppercase;
    if (lowercase) chars += CHARS.lowercase;
    if (numbers) chars += CHARS.numbers;
    if (symbols) chars += CHARS.symbols;
    if (!chars) { toast({ title: 'Select at least one character set', variant: 'destructive' }); return; }
    if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');
    let pwd = '';
    for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Password copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={password.length > 0}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Length: {length}</label>
          <input type="range" min={4} max={128} value={length} onChange={(e) => setLength(+e.target.value)} className="flex-1" />
        </div>
        {['uppercase', 'lowercase', 'numbers', 'symbols'].map((key) => {
          const checked = key === 'uppercase' ? uppercase : key === 'lowercase' ? lowercase : key === 'numbers' ? numbers : symbols;
          const toggle = () => {
            if (key === 'uppercase') setUppercase(!uppercase);
            else if (key === 'lowercase') setLowercase(!lowercase);
            else if (key === 'numbers') setNumbers(!numbers);
            else setSymbols(!symbols);
          };
          return (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={checked} onChange={toggle} className="rounded border-muted-foreground" />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          );
        })}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} className="rounded border-muted-foreground" />
          Exclude similar characters (il1Lo0O)
        </label>
        <Button onClick={generate}><RefreshCw className="w-4 h-4 mr-1" />Generate Password</Button>
        {password && (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-mono break-all">{password}</p>
              <Button size="sm" variant="ghost" onClick={copy}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
