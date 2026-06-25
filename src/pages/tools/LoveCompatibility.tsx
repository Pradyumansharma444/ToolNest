import { useState, useMemo } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function loveScore(name1: string, name2: string): number {
  const combined = (name1 + name2).toLowerCase().replace(/\s/g, '');
  if (!combined) return 0;
  const freq: Record<string, number> = {};
  for (const ch of combined) freq[ch] = (freq[ch] || 0) + 1;
  let score = 0;
  for (const ch of 'love') {
    if (freq[ch]) score += freq[ch] * 5;
  }
  for (const ch of 'true') {
    if (freq[ch]) score += freq[ch] * 3;
  }
  const unique = new Set(combined).size;
  score += unique * 2;
  return Math.min(100, Math.round(score));
}

function getMessage(score: number): string {
  if (score >= 90) return 'A perfect match! Destiny awaits! 💫';
  if (score >= 70) return 'Great chemistry! This could be something special! 💕';
  if (score >= 50) return 'Not bad! There is potential here! 🌸';
  if (score >= 30) return 'Mixed signals... maybe just friends? 🌊';
  return 'Hmm, the stars are uncertain. Try again later! 🌙';
}

function getEmoji(score: number): string {
  if (score >= 80) return '💞';
  if (score >= 60) return '💗';
  if (score >= 40) return '💛';
  if (score >= 20) return '💙';
  return '💜';
}

export default function LoveCompatibility() {
  const tool = getToolById('love-compatibility')!;
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [calculated, setCalculated] = useState(false);

  const score = useMemo(() => loveScore(name1, name2), [name1, name2]);
  const message = getMessage(score);
  const emoji = getEmoji(score);

  const handleCalculate = () => {
    if (name1.trim() && name2.trim()) setCalculated(true);
  };

  return (
    <ToolLayout tool={tool} resultVisible={calculated}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">First Name</label>
            <Input value={name1} onChange={(e) => { setName1(e.target.value); setCalculated(false); }} placeholder="Enter first name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Second Name</label>
            <Input value={name2} onChange={(e) => { setName2(e.target.value); setCalculated(false); }} placeholder="Enter second name" />
          </div>
          <Button onClick={handleCalculate} className="w-full gap-2" disabled={!name1.trim() || !name2.trim()}>
            <Heart className="w-4 h-4" /> Calculate Love
          </Button>
        </Card>

        {calculated && (
          <Card className="p-8 text-center space-y-4">
            <div className="text-6xl animate-bounce">{emoji}</div>
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              {score}%
            </div>
            <p className="text-lg font-medium">{message}</p>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> For entertainment purposes only
            </p>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
