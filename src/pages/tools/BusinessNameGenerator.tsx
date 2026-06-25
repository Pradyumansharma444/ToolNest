import { useState, useMemo } from 'react';
import { RefreshCw, Lightbulb, Copy } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const PREFIXES = [
  'Nova', 'Apex', 'Vibe', 'Pulse', 'Elevate', 'Bright', 'Core', 'Elite',
  'Prime', 'Forge', 'Spark', 'Vertex', 'Zen', 'Flux', 'Nexus', 'Terra',
];

const SUFFIXES = [
  'Hub', 'Lab', 'Studio', 'Works', 'Space', 'Co.', 'Collective', 'Group',
  'Solutions', 'Media', 'Ventures', 'Global', 'Digital', 'Creative', 'Dynamics', 'Tech',
];

const INDUSTRIES: Record<string, string[]> = {
  Technology: ['Tech', 'Digital', 'Byte', 'Code', 'Cyber', 'Data', 'Net', 'Logic', 'Sys'],
  Health: ['Health', 'Care', 'Well', 'Life', 'Med', 'Vita', 'Pure', 'Nova'],
  Finance: ['Capital', 'Wealth', 'Finance', 'Fund', 'Trust', 'Equity', 'Invest', 'Penny'],
  Education: ['Learn', 'Edu', 'Brain', 'Mind', 'Skill', 'Academy', 'Scholar', 'Wise'],
  Food: ['Food', 'Taste', 'Bite', 'Fresh', 'Fusion', 'Spice', 'Harvest', 'Bake'],
  Fashion: ['Style', 'Chic', 'Vogue', 'Thread', 'Fabric', 'Trend', 'Moda', 'Luxe'],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BusinessNameGenerator() {
  const tool = getToolById('business-name-generator')!;
  const { toast } = useToast();
  const [keywords, setKeywords] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [seed, setSeed] = useState(0);

  const names = useMemo(() => {
    const kw = keywords.split(',').map(k => k.trim()).filter(Boolean);
    const industryWords = INDUSTRIES[industry] || [];
    const allWords = [...kw, ...industryWords];

    const generated = new Set<string>();
    const shuffled = shuffle([...allWords]);
    const prefixes = shuffle(PREFIXES);
    const suffixes = shuffle(SUFFIXES);

    for (let i = 0; i < 20; i++) {
      if (generated.size >= 16) break;
      const word = shuffled[i % shuffled.length] || 'Brand';
      const prefix = prefixes[i % prefixes.length];
      const suffix = suffixes[(i + 3) % suffixes.length];

      const patterns = [
        `${prefix}${word}`,
        `${word}${suffix}`,
        `${prefix} ${word}`,
        `${word} ${suffix}`,
        `The ${word} ${suffix}`,
        `${prefix}${industryWords[i % industryWords.length] || 'Co'}`,
      ];
      const name = patterns[i % patterns.length];
      if (name) generated.add(name);
    }
    return Array.from(generated).slice(0, 16);
  }, [keywords, industry, seed]);

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast({ description: `Copied "${name}" to clipboard.` });
  };

  return (
    <ToolLayout tool={tool}>
      <Card>
        <CardHeader><CardTitle>Generate Business Names</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Keywords (comma separated)</Label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="tech, cloud, green" />
            </div>
            <div>
              <Label>Industry</Label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                {Object.keys(INDUSTRIES).map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={() => setSeed(s => s + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />Generate Names
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {names.map((name, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => copyName(name)}>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-5 h-5 mx-auto mb-2 text-amber-500" />
              <p className="font-semibold">{name}</p>
              <Badge variant="outline" className="mt-2 text-[10px]">
                <Copy className="w-3 h-3 mr-1" />Click to copy
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </ToolLayout>
  );
}
