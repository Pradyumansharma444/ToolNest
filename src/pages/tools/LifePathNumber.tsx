import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function reduceToSingleDigit(n: number): number {
  while (n >= 10 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

const interpretations: Record<number, { title: string; desc: string }> = {
  1: { title: 'The Leader', desc: 'Independent, creative, and ambitious. You are a natural-born leader with a drive to innovate and inspire others.' },
  2: { title: 'The Peacemaker', desc: 'Cooperative, diplomatic, and sensitive. You thrive in partnerships and bring harmony wherever you go.' },
  3: { title: 'The Creative', desc: 'Expressive, optimistic, and social. You have a gift for communication and artistic self-expression.' },
  4: { title: 'The Builder', desc: 'Practical, disciplined, and hardworking. You create solid foundations through dedication and order.' },
  5: { title: 'The Adventurer', desc: 'Freedom-loving, versatile, and curious. You crave new experiences and embrace change.' },
  6: { title: 'The Nurturer', desc: 'Responsible, caring, and compassionate. You are drawn to service and creating harmony.' },
  7: { title: 'The Seeker', desc: 'Analytical, introspective, and spiritual. You seek deeper truths and wisdom.' },
  8: { title: 'The Achiever', desc: 'Ambitious, efficient, and authoritative. You are driven to succeed and create abundance.' },
  9: { title: 'The Humanitarian', desc: 'Compassionate, generous, and visionary. You are here to serve humanity and make a difference.' },
  11: { title: 'The Intuitive (Master Number)', desc: 'Highly intuitive, enlightened, and inspirational. You have great spiritual insight and healing abilities.' },
  22: { title: 'The Master Builder (Master Number)', desc: 'Visionary yet practical. You can turn the grandest dreams into reality with discipline and insight.' },
  33: { title: 'The Master Teacher (Master Number)', desc: 'Compassionate, nurturing, and selfless. You embody unconditional love and spiritual guidance.' },
};

export default function LifePathNumber() {
  const tool = getToolById('life-path-number')!;
  const [birthdate, setBirthdate] = useState('');

  const lifePath = useMemo(() => {
    if (!birthdate) return null;
    const digits = birthdate.replace(/-/g, '').split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    return reduceToSingleDigit(sum);
  }, [birthdate]);

  const interpretation = lifePath !== null ? interpretations[lifePath] : null;

  return (
    <ToolLayout tool={tool} resultVisible={!!lifePath}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Birth Date</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button onClick={() => setBirthdate(birthdate)} className="w-full gap-2" disabled={!birthdate}>
            <Sparkles className="w-4 h-4" /> Calculate Life Path Number
          </Button>
        </Card>

        {lifePath !== null && interpretation && (
          <Card className="p-8 text-center space-y-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {lifePath}
            </div>
            <h3 className="text-xl font-semibold">{interpretation.title}</h3>
            <p className="text-muted-foreground">{interpretation.desc}</p>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
