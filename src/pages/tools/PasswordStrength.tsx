import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function calculateEntropy(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  return Math.log2(pool) * password.length;
}

const COMMON_PASSWORDS = new Set(['password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'letmein', 'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine', 'master', 'welcome', 'shadow', 'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang', 'password1', 'admin']);

export default function PasswordStrength() {
  const tool = getToolById('password-strength')!;
  const [password, setPassword] = useState('');

  const result = useMemo(() => {
    if (!password) return null;
    const entropy = calculateEntropy(password);
    const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const length = password.length;
    const types = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    let score = 0;
    if (length >= 8) score += 20;
    if (length >= 12) score += 10;
    if (length >= 16) score += 10;
    if (hasUpper) score += 10;
    if (hasLower) score += 10;
    if (hasNumber) score += 15;
    if (hasSymbol) score += 15;
    if (types >= 3) score += 10;
    if (isCommon) score = 0;

    let label = 'Very Weak';
    let color = 'bg-red-500';
    if (score >= 80) { label = 'Very Strong'; color = 'bg-green-500'; }
    else if (score >= 60) { label = 'Strong'; color = 'bg-emerald-400'; }
    else if (score >= 40) { label = 'Medium'; color = 'bg-yellow-400'; }
    else if (score >= 20) { label = 'Weak'; color = 'bg-orange-400'; }
    if (isCommon) label = 'Common Password';

    return { score, label, color, entropy: entropy.toFixed(1), isCommon, types, length };
  }, [password]);

  return (
    <ToolLayout tool={tool} resultVisible={password.length > 0}>
      <div className="space-y-4">
        <Input type="password" placeholder="Enter password to check..." value={password} onChange={(e) => setPassword(e.target.value)} className="text-lg" />
        {result && (
          <div className="space-y-4">
            <div className="h-3 rounded-full bg-muted overflow-hidden"><div className={`h-full transition-all ${result.color}`} style={{ width: `${result.score}%` }} /></div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <p className="text-2xl font-bold">{result.label}</p>
              <p className="text-sm text-muted-foreground">Score: {result.score}/100 | Entropy: {result.entropy} bits</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`rounded-lg p-2 text-center ${result.length >= 8 ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
                Length: {result.length} {result.length >= 8 ? '✓' : '✗'}
              </div>
              {['Upper', 'Lower', 'Number', 'Symbol'].map(type => {
                const has = type === 'Upper' ? /[A-Z]/.test(password) : type === 'Lower' ? /[a-z]/.test(password) : type === 'Number' ? /[0-9]/.test(password) : /[^a-zA-Z0-9]/.test(password);
                return (
                  <div key={type} className={`rounded-lg p-2 text-center ${has ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
                    {type}: {has ? '✓' : '✗'}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
