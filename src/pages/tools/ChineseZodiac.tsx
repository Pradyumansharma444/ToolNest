import { useState, useMemo } from 'react';
import { Heart, Search, BookOpen, Star, Info, Compass } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ZodiacData {
  name: string;
  emoji: string;
  pinyin: string;
  strengths: string;
  weaknesses: string;
  luckyNumbers: string;
  luckyColors: string;
  luckyDirections: string;
  bestMatches: string[];
  worstMatches: string[];
  description: string;
}

const ZODIAC_DATA: Record<string, ZodiacData> = {
  Rat: {
    name: 'Rat',
    emoji: '🐀',
    pinyin: 'Shǔ',
    strengths: 'Quick-witted, resourceful, versatile, kind, smart.',
    weaknesses: 'Timid, unstable, stubborn, picky, lack of persistence.',
    luckyNumbers: '2, 3',
    luckyColors: 'Blue, Golden, Green',
    luckyDirections: 'Southeast, Northeast',
    bestMatches: ['Ox', 'Dragon', 'Monkey'],
    worstMatches: ['Horse', 'Rooster'],
    description: 'People born in the Year of the Rat are quick-witted, clever, charming, sharp and funny. They have excellent taste, are resourcefulness and usually generous with their loved ones.',
  },
  Ox: {
    name: 'Ox',
    emoji: '🐂',
    pinyin: 'Niú',
    strengths: 'Diligent, dependable, strong, determined, honest.',
    weaknesses: 'Stubborn, conservative, poor communicator, silent.',
    luckyNumbers: '1, 9',
    luckyColors: 'Blue, Yellow, Green',
    luckyDirections: 'South, North',
    bestMatches: ['Rat', 'Snake', 'Rooster'],
    worstMatches: ['Goat', 'Horse', 'Dog'],
    description: 'Oxes are known for diligence, dependability, strength and determination. Having an honest nature, Oxes are strongly patriotic, have ideals and ambitions for life, and attach importance to family and work.',
  },
  Tiger: {
    name: 'Tiger',
    emoji: '🐅',
    pinyin: 'Hǔ',
    strengths: 'Brave, confident, competitive, charming, unpredictable.',
    weaknesses: 'Irritable, over-indulgent, boastful, authority-resistant.',
    luckyNumbers: '1, 3, 4',
    luckyColors: 'Blue, Grey, Orange',
    luckyDirections: 'East, South, Southeast',
    bestMatches: ['Dragon', 'Horse', 'Pig'],
    worstMatches: ['Monkey', 'Snake'],
    description: 'Tigers are courageous and active people who love a good challenge and adventure in life. They are extremely charming, commanding, and natural-born leaders who express themselves boldly.',
  },
  Rabbit: {
    name: 'Rabbit',
    emoji: '🐇',
    pinyin: 'Tù',
    strengths: 'Gentle, elegant, alert, quick, kind, responsible.',
    weaknesses: 'Hesitant, conservative, timid, melancholic.',
    luckyNumbers: '3, 4, 6',
    luckyColors: 'Red, Pink, Purple, Blue',
    luckyDirections: 'East, Southeast, South',
    bestMatches: ['Goat', 'Dog', 'Pig'],
    worstMatches: ['Rooster', 'Dragon'],
    description: 'Rabbits tend to be gentle, quiet, elegant, and alert; quick, kind, patient, and very responsible. They are generally loyal and affectionate to their families and partners.',
  },
  Dragon: {
    name: 'Dragon',
    emoji: '🐉',
    pinyin: 'Lóng',
    strengths: 'Confident, intelligent, enthusiastic, powerful, ambitious.',
    weaknesses: 'Conceited, impatient, hot-tempered, critical.',
    luckyNumbers: '1, 6, 7',
    luckyColors: 'Gold, Silver, Hoary (Greyish white)',
    luckyDirections: 'East, North, South',
    bestMatches: ['Rooster', 'Monkey', 'Rat'],
    worstMatches: ['Dog', 'Rabbit'],
    description: 'The Dragon is the most powerful and auspicious sign in the Chinese Zodiac. Dragons are enthusiastic, confident, and gifted with innate courage, tenacity, and intelligence.',
  },
  Snake: {
    name: 'Snake',
    emoji: '🐍',
    pinyin: 'Shé',
    strengths: 'Wise, enigmatic, intelligent, graceful, creative.',
    weaknesses: 'Skeptical, jealous, possessive, cold-hearted.',
    luckyNumbers: '2, 8, 9',
    luckyColors: 'Black, Red, Yellow',
    luckyDirections: 'Northeast, Southwest, South',
    bestMatches: ['Ox', 'Rooster', 'Dragon'],
    worstMatches: ['Tiger', 'Pig'],
    description: 'In Chinese culture, the Snake is the most enigmatic animal. Snake people are regarded as the most intuitive, wise, and deep thinkers. They act according to their own judgment.',
  },
  Horse: {
    name: 'Horse',
    emoji: '🐎',
    pinyin: 'Mǎ',
    strengths: 'Energetic, warm-hearted, easygoing, optimistic, athletic.',
    weaknesses: 'Impulsive, self-centered, stubborn, chatterbox.',
    luckyNumbers: '2, 3, 7',
    luckyColors: 'Yellow, Green',
    luckyDirections: 'East, West, Southwest',
    bestMatches: ['Goat', 'Tiger', 'Dog'],
    worstMatches: ['Rat', 'Ox', 'Rooster'],
    description: 'Horses are extremely animated, active and energetic. They love to be in a crowd, are quick-witted, and love freedom. They sometimes lack patience and persistence.',
  },
  Goat: {
    name: 'Goat',
    emoji: '🐐',
    pinyin: 'Yáng',
    strengths: 'Calm, gentle, sympathetic, creative, elegant, amicable.',
    weaknesses: 'Shy, pessimistic, moody, weak-willed, indecisive.',
    luckyNumbers: '2, 7',
    luckyColors: 'Green, Red, Purple',
    luckyDirections: 'North, Southwest',
    bestMatches: ['Rabbit', 'Horse', 'Pig'],
    worstMatches: ['Ox', 'Dog'],
    description: 'Goats (or Sheep/Ram) are generally gentle, mild-mannered, stable, sympathetic, and creative. They have a strong sense of art, aesthetics, and fashion, preferring peaceful environments.',
  },
  Monkey: {
    name: 'Monkey',
    emoji: '🐒',
    pinyin: 'Hóu',
    strengths: 'Sharp, smart, curious, mischievous, clever, versatile.',
    weaknesses: 'Arrogant, egotistical, opportunistic, restless.',
    luckyNumbers: '4, 9',
    luckyColors: 'White, Blue, Gold',
    luckyDirections: 'North, Northwest, West',
    bestMatches: ['Rat', 'Dragon', 'Snake'],
    worstMatches: ['Tiger', 'Pig'],
    description: 'Monkeys have magnetic personalities and are quick-witted, smart, and mischievous. They are fast learners, highly curious, and possess an excellent sense of humor.',
  },
  Rooster: {
    name: 'Rooster',
    emoji: '🐓',
    pinyin: 'Jī',
    strengths: 'Observant, hardworking, courageous, talented, loyal.',
    weaknesses: 'Arrogant, self-aggrandizing, impatient, sensitive.',
    luckyNumbers: '5, 7, 8',
    luckyColors: 'Gold, Brown, Yellow',
    luckyDirections: 'South, Southeast',
    bestMatches: ['Ox', 'Dragon', 'Snake'],
    worstMatches: ['Rat', 'Rabbit', 'Dog'],
    description: 'Roosters are very observant, hardworking, resourceful, courageous and talented. They are extremely confident, outspoken, and proud, with deep loyalty to friends.',
  },
  Dog: {
    name: 'Dog',
    emoji: '🐕',
    pinyin: 'Gǒu',
    strengths: 'Loyal, honest, amiable, kind, cautious, sincere.',
    weaknesses: 'Stubborn, pessimistic, cold, anxious, critical.',
    luckyNumbers: '3, 4, 9',
    luckyColors: 'Red, Green, Purple',
    luckyDirections: 'East, Southeast, South',
    bestMatches: ['Rabbit', 'Tiger', 'Horse'],
    worstMatches: ['Dragon', 'Goat', 'Rooster'],
    description: 'Dogs are loyal, honest, and kind. They are cautious, reliable, and have a deep sense of justice. They can be slightly pessimistic and critical of their environment.',
  },
  Pig: {
    name: 'Pig',
    emoji: '🐖',
    pinyin: 'Zhū',
    strengths: 'Compassionate, generous, diligent, realistic, calm.',
    weaknesses: 'Gullible, lazy, naive, short-tempered.',
    luckyNumbers: '2, 5, 8',
    luckyColors: 'Yellow, Grey, Brown, Gold',
    luckyDirections: 'Southeast, Northeast',
    bestMatches: ['Tiger', 'Rabbit', 'Goat'],
    worstMatches: ['Snake', 'Monkey'],
    description: 'Pigs are diligent, compassionate, and generous. Once they set a goal, they devote all their energy to achieving it. They have great patience and realistic planning skills.',
  },
};

const ELEMENTS = ['Metal', 'Water', 'Wood', 'Fire', 'Earth'];
const POLARITY = ['Yang', 'Yin'];
const ZODIAC_ORDER = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];

export default function ChineseZodiac() {
  const tool = getToolById('chinese-zodiac')!;

  const [activeTab, setActiveTab] = useState<'calc' | 'compat' | 'wiki'>('calc');

  // Calculator states
  const [birthYear, setBirthYear] = useState('2000');
  
  // Compatibility states
  const [year1, setYear1] = useState('1998');
  const [year2, setYear2] = useState('2000');

  // Encyclopedia states
  const [selectedWikiAnimal, setSelectedWikiAnimal] = useState<string>('Dragon');

  // helper: calculate zodiac info from year
  const getZodiacInfo = (yearNum: number) => {
    // Zodiac animal calculation (Year % 12)
    // 1996 % 12 = 4 (Rat), Monkey is 0 index
    const animalIndex = yearNum % 12;
    const animalName = ZODIAC_ORDER[animalIndex]!;
    const animal = ZODIAC_DATA[animalName]!;

    // Element calculation
    // Years ending in 0-1 (Metal), 2-3 (Water), 4-5 (Wood), 6-7 (Fire), 8-9 (Earth)
    const lastDigit = yearNum % 10;
    let element = '';
    if (lastDigit === 0 || lastDigit === 1) element = ELEMENTS[0]!;
    else if (lastDigit === 2 || lastDigit === 3) element = ELEMENTS[1]!;
    else if (lastDigit === 4 || lastDigit === 5) element = ELEMENTS[2]!;
    else if (lastDigit === 6 || lastDigit === 7) element = ELEMENTS[3]!;
    else element = ELEMENTS[4]!;

    // Polarity: Yang for even, Yin for odd
    const polarity = POLARITY[lastDigit % 2]!;

    return {
      animal,
      element,
      polarity,
      year: yearNum,
    };
  };

  const calculatedInfo = useMemo(() => {
    const yr = parseInt(birthYear);
    if (isNaN(yr) || yr < 1000 || yr > 2100) return null;
    return getZodiacInfo(yr);
  }, [birthYear]);

  // Compatibility calculation
  const compatibilityResult = useMemo(() => {
    const yr1 = parseInt(year1);
    const yr2 = parseInt(year2);

    if (isNaN(yr1) || isNaN(yr2) || yr1 < 1000 || yr2 < 1000) return null;

    const info1 = getZodiacInfo(yr1);
    const info2 = getZodiacInfo(yr2);

    const a1 = info1.animal.name;
    const a2 = info2.animal.name;

    // Check relationship matrices
    let score = 70; // neutral default
    let verdict = 'Neutral Match';
    let summary = 'A steady relationship that requires moderate communication and sharing of life values to flourish.';
    let color = 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-900/30';

    if (info1.animal.bestMatches.includes(a2)) {
      score = 95;
      verdict = 'Excellent Match (Harmonious)';
      summary = `The ${a1} and ${a2} represent a natural synergy. Their connection is highly supportive, intuitive, and filled with mutual understanding.`;
      color = 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30';
    } else if (info1.animal.worstMatches.includes(a2)) {
      score = 35;
      verdict = 'Challenging Match (Friction)';
      summary = `A connection between ${a1} and ${a2} can have inherent conflicts of interest and personalities. Extra compromise, patience, and effort are required.`;
      color = 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-900/30';
    } else if (info1.element === info2.element) {
      score = 80;
      verdict = 'Good Match (Shared Element)';
      summary = `Sharing the element ${info1.element} creates instant common ground and style. They share structural life principles.`;
      color = 'text-indigo-500 bg-indigo-500/10 border-indigo-200 dark:border-indigo-900/30';
    }

    return {
      info1,
      info2,
      score,
      verdict,
      summary,
      color,
    };
  }, [year1, year2]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-red-500" />
                Parameters
              </CardTitle>
              <CardDescription>
                Input parameters depending on the active solver tab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {activeTab === 'calc' && (
                <div className="space-y-2">
                  <Label htmlFor="birth-year">Select/Enter Birth Year</Label>
                  <Input
                    id="birth-year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="font-bold text-lg"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Accepts years from 1900 to 2100.
                  </p>
                </div>
              )}

              {activeTab === 'compat' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="year-1">P1 Birth Year</Label>
                    <Input
                      id="year-1"
                      type="number"
                      value={year1}
                      onChange={(e) => setYear1(e.target.value)}
                      className="font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year-2">P2 Birth Year</Label>
                    <Input
                      id="year-2"
                      type="number"
                      value={year2}
                      onChange={(e) => setYear2(e.target.value)}
                      className="font-bold"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'wiki' && (
                <div className="space-y-2">
                  <Label>Select Wiki Animal</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.keys(ZODIAC_DATA).map((animalName) => {
                      const isSelected = selectedWikiAnimal === animalName;
                      return (
                        <Button
                          key={animalName}
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => setSelectedWikiAnimal(animalName)}
                          className="h-8 text-xs font-semibold px-1"
                          style={isSelected ? { backgroundColor: '#DC2626', color: '#FFFFFF' } : {}}
                        >
                          {ZODIAC_DATA[animalName]!.emoji} {animalName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Trad Info Box */}
          <Card className="border-red-500/10 bg-red-500/5 dark:bg-red-950/10">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                <Compass className="w-4 h-4" />
                The Lunar Calendar Note
              </div>
              <p>
                The Chinese Zodiac is strictly based on the <strong>Chinese Lunar Calendar</strong>, which begins on Chinese New Year (typically late January or early February).
              </p>
              <p>
                If you were born in January or early February, your sign might belong to the *previous* Gregorian year. This tool calculates based on calendar years for general conventions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="calc" value={activeTab} onValueChange={(val) => setActiveTab(val as 'calc' | 'compat' | 'wiki')} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1">
              <TabsTrigger value="calc" className="data-[state=active]:bg-background transition-all">
                <Search className="w-4 h-4 mr-2 text-red-500" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="compat" className="data-[state=active]:bg-background transition-all">
                <Heart className="w-4 h-4 mr-2 text-pink-500" />
                Compatibility
              </TabsTrigger>
              <TabsTrigger value="wiki" className="data-[state=active]:bg-background transition-all">
                <BookOpen className="w-4 h-4 mr-2 text-amber-500" />
                Encyclopedia
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: CALCULATOR */}
            <TabsContent value="calc" className="mt-6 space-y-6">
              {calculatedInfo ? (
                <div className="space-y-6">
                  {/* Animal Banner Card */}
                  <Card className="border-red-500/20 bg-gradient-to-r from-red-500/5 to-amber-500/5 dark:from-red-950/20 dark:to-amber-950/20 overflow-hidden relative shadow-sm">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-6xl p-4 bg-background border rounded-2xl shadow-inner select-none">
                        {calculatedInfo.animal.emoji}
                      </div>
                      
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-2xl font-black text-foreground">{calculatedInfo.animal.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {calculatedInfo.animal.pinyin}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600 text-white font-mono uppercase tracking-wider">
                            {calculatedInfo.element}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-stone-900 font-mono uppercase tracking-wider">
                            {calculatedInfo.polarity}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground max-w-lg leading-relaxed">
                          {calculatedInfo.animal.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Strengths & Weaknesses */}
                    <Card className="border-muted bg-card/40">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500" /> Personality Traits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs space-y-3 leading-relaxed">
                        <div>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">Strengths:</strong>
                          <span className="text-muted-foreground">{calculatedInfo.animal.strengths}</span>
                        </div>
                        <div>
                          <strong className="text-red-500 font-semibold block mb-0.5">Weaknesses:</strong>
                          <span className="text-muted-foreground">{calculatedInfo.animal.weaknesses}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lucky stats */}
                    <Card className="border-muted bg-card/40">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-indigo-500" /> Lucky Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs space-y-3 leading-relaxed">
                        <div className="flex justify-between border-b py-1">
                          <span className="text-muted-foreground">Lucky Numbers:</span>
                          <span className="font-bold text-foreground font-mono">{calculatedInfo.animal.luckyNumbers}</span>
                        </div>
                        <div className="flex justify-between border-b py-1">
                          <span className="text-muted-foreground">Lucky Colors:</span>
                          <span className="font-bold text-foreground">{calculatedInfo.animal.luckyColors}</span>
                        </div>
                        <div className="flex justify-between border-b py-1">
                          <span className="text-muted-foreground">Lucky Directions:</span>
                          <span className="font-bold text-foreground">{calculatedInfo.animal.luckyDirections}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Compatibility listings */}
                  <Card className="border-muted bg-card/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-pink-500" /> Matches & Relationships
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 py-1">
                        <div className="sm:w-1/2">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Highly Compatible (Best Matches):</span>
                          <div className="flex gap-1.5">
                            {calculatedInfo.animal.bestMatches.map(m => (
                              <span key={m} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/20">
                                {ZODIAC_DATA[m]?.emoji} {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="sm:w-1/2">
                          <span className="font-semibold text-red-500 block mb-1">Relationship Friction (Avoid):</span>
                          <div className="flex gap-1.5">
                            {calculatedInfo.animal.worstMatches.map(m => (
                              <span key={m} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-bold border border-red-500/20">
                                {ZODIAC_DATA[m]?.emoji} {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                  Invalid year inputs. Enter a year from 1900 to 2100.
                </div>
              )}
            </TabsContent>

            {/* TAB CONTENT: COMPATIBILITY */}
            <TabsContent value="compat" className="mt-6 space-y-6">
              {compatibilityResult ? (
                <div className="space-y-6">
                  {/* Match score banner */}
                  <Card className="border-muted bg-card/40">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl p-3 bg-muted rounded-xl">
                          {compatibilityResult.info1.animal.emoji}
                        </div>
                        <span className="text-muted-foreground font-bold font-mono">VS</span>
                        <div className="text-4xl p-3 bg-muted rounded-xl">
                          {compatibilityResult.info2.animal.emoji}
                        </div>
                      </div>

                      <div className="text-center sm:text-right space-y-1">
                        <span className="text-[10px] font-extrabold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded tracking-wide">
                          Compatibility Score
                        </span>
                        <div className="text-4xl font-black text-foreground">
                          {compatibilityResult.score}%
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${compatibilityResult.color}`}>
                          {compatibilityResult.verdict}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary card */}
                  <Card className="border-muted bg-card/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-indigo-500" /> Relationship Dynamics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs leading-relaxed text-muted-foreground">
                      <p className="mb-4">{compatibilityResult.summary}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                          <strong className="text-foreground block mb-0.5">Person 1 ({compatibilityResult.info1.year}):</strong>
                          <span>{compatibilityResult.info1.polarity} {compatibilityResult.info1.element} {compatibilityResult.info1.animal.name}</span>
                        </div>
                        <div>
                          <strong className="text-foreground block mb-0.5">Person 2 ({compatibilityResult.info2.year}):</strong>
                          <span>{compatibilityResult.info2.polarity} {compatibilityResult.info2.element} {compatibilityResult.info2.animal.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                  Invalid year parameters. Input positive year numbers.
                </div>
              )}
            </TabsContent>

            {/* TAB CONTENT: ENCYCLOPEDIA */}
            <TabsContent value="wiki" className="mt-6 space-y-6">
              {selectedWikiAnimal && ZODIAC_DATA[selectedWikiAnimal] ? (
                <div className="space-y-6">
                  {/* Wiki Card banner */}
                  <Card className="border-red-500/20 bg-gradient-to-r from-red-500/5 to-amber-500/5 dark:from-red-950/20 dark:to-amber-950/20 overflow-hidden shadow-sm">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-6xl p-4 bg-background border rounded-2xl shadow-inner select-none">
                        {ZODIAC_DATA[selectedWikiAnimal]!.emoji}
                      </div>
                      
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-2xl font-black text-foreground">{ZODIAC_DATA[selectedWikiAnimal]!.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {ZODIAC_DATA[selectedWikiAnimal]!.pinyin}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground max-w-lg leading-relaxed">
                          {ZODIAC_DATA[selectedWikiAnimal]!.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attributes details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-muted bg-card/40">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold">Traits Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs space-y-3 leading-relaxed text-muted-foreground">
                        <div>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">Strengths:</strong>
                          <span>{ZODIAC_DATA[selectedWikiAnimal]!.strengths}</span>
                        </div>
                        <div>
                          <strong className="text-red-500 font-semibold block mb-0.5">Weaknesses:</strong>
                          <span>{ZODIAC_DATA[selectedWikiAnimal]!.weaknesses}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-muted bg-card/40">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold">Luck Associations</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs space-y-2 text-muted-foreground">
                        <div className="flex justify-between py-1 border-b">
                          <span>Lucky Numbers:</span>
                          <span className="font-bold text-foreground font-mono">{ZODIAC_DATA[selectedWikiAnimal]!.luckyNumbers}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Lucky Colors:</span>
                          <span className="font-bold text-foreground">{ZODIAC_DATA[selectedWikiAnimal]!.luckyColors}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Lucky Directions:</span>
                          <span className="font-bold text-foreground">{ZODIAC_DATA[selectedWikiAnimal]!.luckyDirections}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Compatibility matches */}
                  <Card className="border-muted bg-card/40">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold">Compatibilities List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 py-1">
                        <div className="sm:w-1/2">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Excellent Matches:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ZODIAC_DATA[selectedWikiAnimal]!.bestMatches.map(m => (
                              <span key={m} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold border border-emerald-500/20">
                                {ZODIAC_DATA[m]?.emoji} {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="sm:w-1/2">
                          <span className="font-semibold text-red-500 block mb-1">High Friction:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ZODIAC_DATA[selectedWikiAnimal]!.worstMatches.map(m => (
                              <span key={m} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-bold border border-red-500/20">
                                {ZODIAC_DATA[m]?.emoji} {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolLayout>
  );
}

