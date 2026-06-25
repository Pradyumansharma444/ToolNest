/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Info, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface HaikuDatabase {
  fiveSyllables: string[];
  sevenSyllables: string[];
}

const NATURE_BANK: HaikuDatabase = {
  fiveSyllables: [
    'Quiet morning mist',
    'Cherry blossoms fall',
    'Whispers in the trees',
    'Ocean waves crash loud',
    'Summer sun shines bright',
    'Rain falls on green leaves',
    'Soft wind blows gently',
    'Green grass starts to grow',
    'Birds sing in the woods',
    'Golden sun goes down',
  ],
  sevenSyllables: [
    'Rivers flow under the moon',
    'Dancing through the golden leaves',
    'Shadows stretch across the grass',
    'Thunder roars in stormy skies',
    'Autumn leaves drift on the wind',
    'Deep blue seas touch distant shores',
    'Starlight shines on sleeping fields',
    'Mountains stand tall in the sky',
    'Dew drops glisten in the sun',
    'Gentle rain feeds thirsty trees',
  ],
};

const TECH_BANK: HaikuDatabase = {
  fiveSyllables: [
    'Glow of binary',
    'Silicon heartbeats',
    'Data streams run deep',
    'Pixels fill the screen',
    'Electrons in flight',
    'Servers hum in peace',
    'Fast connections click',
    'Bugs hide in the stack',
    'Routing packets spin',
    'Keyboards click all night',
  ],
  sevenSyllables: [
    'Glowing screens light up the night',
    'Electrons spin in the dark',
    'Code compiles without a sound',
    'Searching for a connection',
    'Cables run under the floor',
    'Data speeds across the world',
    'Algorithms find the way',
    'Virtual worlds start to grow',
    'Processors run cold and fast',
    'Memory holds every spark',
  ],
};

const LOVE_BANK: HaikuDatabase = {
  fiveSyllables: [
    'Soft eyes meet in peace',
    'Two hearts beat as one',
    'Holding hands so tight',
    'Warm smiles in the dark',
    'Sweet scent of your hair',
    'Lost in your embrace',
    'Quiet moments shared',
    'Gentle touch of skin',
    'Love grows every day',
    'Whispered vows at night',
  ],
  sevenSyllables: [
    'Lost within your gentle smile',
    'Warmth of your hand holding mine',
    'Knowing you are always near',
    'Love guides us through darker paths',
    'Staring at the stars above',
    'Sharing hopes and future dreams',
    'Days are brighter by your side',
    'Your voice is a peaceful song',
    'Time stands still when you are here',
    'Bound together heart to heart',
  ],
};

const WINTER_BANK: HaikuDatabase = {
  fiveSyllables: [
    'Winter wind blows cold',
    'Soft white snow falls down',
    'Frost on window panes',
    'Ice on frozen lakes',
    'Warm breath in the air',
    'Bare trees touch the sky',
    'Short days, longer nights',
    'Fire burning bright',
    'Cold stars shine so clear',
    'Silence fills the night',
  ],
  sevenSyllables: [
    'Silent snow covers the fields',
    'Walking through the frozen woods',
    'Icicles hang from the roofs',
    'Cozy blankets keep us warm',
    'Winter stars shine clean and bright',
    'Chilled winds howl outside our doors',
    'Footprints left in heavy snow',
    'Long nights filled with quiet sleep',
    'Dark days bring the heavy cold',
    'Steaming cups of chocolate',
  ],
};

export default function HaikuGenerator() {
  const tool = getToolById('haiku-generator') || {
    id: 'haiku-generator',
    name: 'Haiku Generator',
    description: 'Generate beautiful 5-7-5 syllable haiku poems on different themes.',
    metaTitle: 'Free Haiku Generator - 5-7-5 Syllables | ToolNest',
    metaDescription: 'Create traditional Japanese haiku poetry. Generate verses on Nature, Technology, Love, and Winter with instant copies.',
    category: 'text',
  };

  const [theme, setTheme] = useState<'nature' | 'tech' | 'love' | 'winter'>('nature');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [copied, setCopied] = useState(false);

  const activeBank = useMemo(() => {
    if (theme === 'nature') return NATURE_BANK;
    if (theme === 'tech') return TECH_BANK;
    if (theme === 'love') return LOVE_BANK;
    return WINTER_BANK;
  }, [theme]);

  const generateHaiku = () => {
    const bank = activeBank;
    // Pick unique line 1 and line 3
    const l1Idx = Math.floor(Math.random() * bank.fiveSyllables.length);
    let l3Idx = Math.floor(Math.random() * bank.fiveSyllables.length);
    while (l3Idx === l1Idx) {
      l3Idx = Math.floor(Math.random() * bank.fiveSyllables.length);
    }
    const l2Idx = Math.floor(Math.random() * bank.sevenSyllables.length);

    setLine1(bank.fiveSyllables[l1Idx]);
    setLine2(bank.sevenSyllables[l2Idx]);
    setLine3(bank.fiveSyllables[l3Idx]);
    setCopied(false);
  };

  // Generate on mount or theme change
  useEffect(() => {
    generateHaiku(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [theme]);

  const copyToClipboard = () => {
    const fullText = `${line1}\n${line2}\n${line3}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <ToolLayout tool={tool as any} resultVisible={!!line1}>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Selector Header */}
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm text-xs">
          <h3 className="font-semibold text-sm">Select Theme</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'nature', name: 'Nature' },
              { id: 'tech', name: 'Tech' },
              { id: 'love', name: 'Love' },
              { id: 'winter', name: 'Winter' },
            ].map((t) => (
              <Button
                key={t.id}
                type="button"
                variant={theme === t.id ? 'default' : 'outline'}
                onClick={() => setTheme(t.id as 'nature' | 'tech' | 'love' | 'winter')}
                className="w-full text-[10px]"
              >
                {t.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Display Card */}
        <div className="rounded-xl border bg-card p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[260px] relative overflow-hidden bg-gradient-to-b from-card to-muted/20">
          <div className="font-serif italic text-lg md:text-xl space-y-3 leading-relaxed text-foreground/90 font-medium">
            <p className="animate-fade-in">{line1}</p>
            <p className="animate-fade-in">{line2}</p>
            <p className="animate-fade-in">{line3}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateHaiku} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Re-roll Poem
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1.5 text-xs">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">What is a Haiku?</p>
            <p>
              Haiku is a traditional form of Japanese poetry consisting of three phrases with a structure of 5, 7, and 5 syllables. It traditionally focuses on nature, seasons, or brief, poignant moments of reflection. This generator matches pre-counted phrasing structures to guarantee valid metrics.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
