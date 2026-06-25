import { useState, useCallback } from 'react';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const AFFIRMATIONS = [
  'I am capable of achieving great things.',
  'I choose to focus on what I can control.',
  'Every day brings new opportunities for growth.',
  'I am worthy of love, respect, and happiness.',
  'My potential is limitless.',
  'I trust myself to make the right decisions.',
  'I am grateful for all that I have.',
  'Challenges help me grow stronger.',
  'I radiate confidence and positivity.',
  'I am enough, exactly as I am.',
  'Today I will embrace new possibilities.',
  'I am the architect of my own life.',
  'Peace begins with me.',
  'I am resilient and can overcome anything.',
  'My mind is calm and my heart is open.',
  'I attract abundance and success.',
  'I forgive myself and others freely.',
  'I am proud of how far I have come.',
  'I am surrounded by love and support.',
  'Every breath I take fills me with peace.',
  'I deserve all the good things life offers.',
  'I am in charge of my own happiness.',
  'My voice matters and I speak with confidence.',
  'I am constantly growing and evolving.',
  'I choose joy in every moment.',
  'I am strong, capable, and determined.',
  'Good things come to me with ease.',
  'I honor my body and treat it with care.',
  'I am open to new experiences and learning.',
  'My future is bright and full of promise.',
];

export default function AffirmationGenerator() {
  const tool = getToolById('affirmation-generator')!;
  const { toast } = useToast();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const [copied, setCopied] = useState(false);

  const current = AFFIRMATIONS[index];

  const newAffirmation = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * AFFIRMATIONS.length);
    } while (next === index && AFFIRMATIONS.length > 1);
    setIndex(next);
    setCopied(false);
  }, [index]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(current);
      setCopied(true);
      toast({ description: 'Affirmation copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ description: 'Failed to copy', variant: 'destructive' });
    }
  }, [current, toast]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Card className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <blockquote className="text-2xl md:text-3xl font-serif font-medium leading-relaxed text-foreground/90 italic">
              &ldquo;{current}&rdquo;
            </blockquote>
            <div className="flex gap-2">
              <Button onClick={newAffirmation} className="gap-2">
                <RefreshCw className="w-4 h-4" /> New Affirmation
              </Button>
              <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {AFFIRMATIONS.length} affirmations &middot; Click for daily inspiration
            </p>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
}
