import { useState, useMemo } from 'react';
import { RefreshCw, Copy, MessageSquare } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const TEMPLATES = [
  (k: string[]) => `Get ${k[0]} Today!`,
  (k: string[]) => `Your ${k[0]} Solution`,
  (k: string[]) => `${k[0]} Made Easy`,
  (k: string[]) => `The Future of ${k[0]}`,
  (k: string[]) => `Experience ${k[0]}`,
  (k: string[]) => `${k[0]} That Works`,
  (k: string[]) => `Next-Level ${k[0]}`,
  (k: string[]) => `Unlock ${k[0]}`,
  (k: string[]) => `Smart ${k[0]}, Simple ${k[1] || k[0]}`,
  (k: string[]) => `Transform Your ${k[0]}`,
  (k: string[]) => `${k[0]} Without Compromise`,
  (k: string[]) => `Think ${k[0]}. Think ${k[1] || 'Better'}.`,
  (k: string[]) => `Where ${k[0]} Meets ${k[1] || 'Innovation'}`,
  (k: string[]) => `Elevate Your ${k[0]}`,
  (k: string[]) => `Simply ${k[0]}`,
  (k: string[]) => `${k[0]} for Everyone`,
  (k: string[]) => `The ${k[0]} Difference`,
  (k: string[]) => `Go ${k[0]}`,
  (k: string[]) => `Real ${k[0]}, Real Results`,
  (k: string[]) => `Love Your ${k[0]}`,
];

export default function SloganGenerator() {
  const tool = getToolById('slogan-generator')!;
  const { toast } = useToast();
  const [kw1, setKw1] = useState('');
  const [kw2, setKw2] = useState('');
  const [seed, setSeed] = useState(0);

  const slogans = useMemo(() => {
    const keywords = [kw1.trim(), kw2.trim()].filter(Boolean);
    if (keywords.length === 0) return [];
    const shuffled = [...TEMPLATES]
      .map((t, i) => ({ t, r: Math.sin(seed * (i + 1) * 100) }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.t);
    return shuffled.slice(0, 12).map(t => t(keywords));
  }, [kw1, kw2, seed]);

  const copySlogan = (s: string) => {
    navigator.clipboard.writeText(s);
    toast({ description: `Copied "${s}" to clipboard.` });
  };

  return (
    <ToolLayout tool={tool}>
      <Card>
        <CardHeader><CardTitle>Generate Slogans</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Keyword 1</Label>
              <Input value={kw1} onChange={e => setKw1(e.target.value)} placeholder="e.g. coffee" />
            </div>
            <div>
              <Label>Keyword 2 (optional)</Label>
              <Input value={kw2} onChange={e => setKw2(e.target.value)} placeholder="e.g. comfort" />
            </div>
          </div>
          <Button onClick={() => setSeed(s => s + 1)} disabled={!kw1.trim()}>
            <RefreshCw className="w-4 h-4 mr-2" />Generate Slogans
          </Button>
        </CardContent>
      </Card>

      {slogans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slogans.map((s, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => copySlogan(s)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{s}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      <Copy className="w-3 h-3 mr-1" />Click to copy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
