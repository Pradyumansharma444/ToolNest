import { useState, useMemo } from 'react';
import { Sparkles, Calendar, User, Info, FileText, LayoutGrid } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NumerologyProfile {
  title: string;
  keyword: string;
  strengths: string;
  description: string;
}

const NUMBER_PROFILES: Record<number, NumerologyProfile> = {
  1: {
    title: 'The Pioneer / Leader',
    keyword: 'Independence, originality, ambition, self-reliance.',
    strengths: 'Innovative thinking, courageous initiator, decisive leader.',
    description: 'Number 1s are natural leaders who value independence and self-determination. They thrive on pioneering new ideas and projects, though they must guard against impatience and self-centeredness.',
  },
  2: {
    title: 'The Peacemaker / Partner',
    keyword: 'Diplomacy, cooperation, intuition, harmony.',
    strengths: 'Empathetic listener, supportive partner, sensitive mediator.',
    description: 'Number 2s seek balance and harmony. They are intuitive, supportive, and excel in collaborative environments. They need to work on maintaining boundaries and avoiding hypersensitivity.',
  },
  3: {
    title: 'The Creative / Communicator',
    keyword: 'Expression, creativity, optimism, socialization.',
    strengths: 'Artistic talent, engaging storyteller, infectious enthusiasm.',
    description: 'Number 3s are highly expressive, social, and imaginative. They bring joy and creative spark to their environments, though they can struggle with focus and scattered energy.',
  },
  4: {
    title: 'The Builder / Organizer',
    keyword: 'Stability, process, discipline, reliability.',
    strengths: 'Highly organized, practical executor, loyal teammate.',
    description: 'Number 4s represent structure, order, and practicality. They are the backbone of any team, valuing stability and hard work. They must watch out for stubbornness or rigidity.',
  },
  5: {
    title: 'The Explorer / Catalyst',
    keyword: 'Freedom, adventure, versatility, change.',
    strengths: 'Highly adaptable, charismatic communicator, multi-talented.',
    description: 'Number 5s are driven by a need for freedom, variety, and adventure. They embrace change and are excellent communicators. They need to find focus to prevent restlessness.',
  },
  6: {
    title: 'The Nurturer / Caregiver',
    keyword: 'Responsibility, care, protection, domesticity.',
    strengths: 'Deeply compassionate, artistic appreciation, loyal protector.',
    description: 'Number 6s represent love, family, and service. They have a deep sense of responsibility toward others and create beautiful, harmonious environments, but can over-extend or smother.',
  },
  7: {
    title: 'The Seeker / Analyst',
    keyword: 'Introspection, wisdom, analysis, spirituality.',
    strengths: 'Sharp intellect, scientific observation, intuitive seeker.',
    description: 'Number 7s seek truth, knowledge, and inner wisdom. They are quiet, analytical, and spiritual, needing quiet time to recharge. They can sometimes appear aloof or secretive.',
  },
  8: {
    title: 'The Powerhouse / Executive',
    keyword: 'Abundance, authority, execution, material success.',
    strengths: 'Strong business instincts, goal-oriented organizer, resilient leader.',
    description: 'Number 8s are aligned with power, material success, and balance. They excel at managing large projects and finances, though they must guard against materialism or control issues.',
  },
  9: {
    title: 'The Humanitarian / Idealist',
    keyword: 'Compassion, completion, generosity, creative expression.',
    strengths: 'Global perspective, selfless volunteer, artistic sensitivity.',
    description: 'Number 9s represent completion and global consciousness. They are deeply compassionate, generous, and creative. They must learn to let go of the past and accept help.',
  },
  11: {
    title: 'The Intuitive Guide (Master Number)',
    keyword: 'Spiritual insight, charisma, inspiration, sensitivity.',
    strengths: 'Highly developed intuition, visionary catalyst, empathetic leader.',
    description: 'As a Master Number, 11 brings double the intensity of 2. They are channelers of inspiration, highly sensitive, and seek to illuminate the path for others, though they face anxiety.',
  },
  22: {
    title: 'The Master Builder (Master Number)',
    keyword: 'Visionary execution, high impact, practical power.',
    strengths: 'Transforms dreams into reality, systemic organizer, massive reach.',
    description: '22 is the most powerful number in numerology. It combines the sensitivity of 2 and practical structure of 4 to build legacy systems that benefit humanity. Requires intense discipline.',
  },
  33: {
    title: 'The Master Teacher (Master Number)',
    keyword: 'Universal love, spiritual instruction, deep empathy.',
    strengths: 'Selfless caregiver, emotional beacon, inspirational educator.',
    description: '33 is the Master Teacher, blending the creative expression of 3 and nurturing care of 6. They guide others toward spiritual alignment and emotional healing with absolute compassion.',
  },
};

const PYTHAGOREAN_GRID: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];

export default function NumerologyCalculator() {
  const tool = getToolById('numerology-calculator')!;

  const [activeTab, setActiveTab] = useState<'profile' | 'library'>('profile');

  // Input states
  const [birthdate, setBirthdate] = useState('1990-10-23');
  const [fullName, setFullName] = useState('John Doe');

  // Helper to reduce number to single digit or Master Number (11, 22, 33)
  const reduceNumber = (num: number, allowMaster = true): number => {
    if (num === 0) return 0;
    
    // Check master numbers first
    if (allowMaster && (num === 11 || num === 22 || num === 33)) {
      return num;
    }

    if (num < 10) return num;

    const sum = String(num)
      .split('')
      .map(Number)
      .reduce((acc, curr) => acc + curr, 0);

    return reduceNumber(sum, allowMaster);
  };

  // Calculations
  const calculatedProfile = useMemo(() => {
    if (!birthdate) return null;

    // 1. Life Path Number
    // Sum month, day, year digits individually first, then sum them up
    const [yearStr, monthStr, dayStr] = birthdate.split('-');
    if (!yearStr || !monthStr || !dayStr) return null;

    const mSum = reduceNumber(Number(monthStr), false);
    const dSum = reduceNumber(Number(dayStr), false);
    const ySum = reduceNumber(Number(yearStr), false);

    const lifePath = reduceNumber(mSum + dSum + ySum, true);

    // 2. Name Numbers: Expression, Soul Urge, Personality
    const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');
    let expressionSum = 0;
    let soulUrgeSum = 0;
    let personalitySum = 0;

    for (let i = 0; i < cleanName.length; i++) {
      const char = cleanName[i]!;
      const val = PYTHAGOREAN_GRID[char] || 0;
      expressionSum += val;

      if (VOWELS.includes(char)) {
        soulUrgeSum += val;
      } else {
        personalitySum += val;
      }
    }

    const expressionNum = reduceNumber(expressionSum, true);
    const soulUrgeNum = reduceNumber(soulUrgeSum, true);
    const personalityNum = reduceNumber(personalitySum, true);

    return {
      lifePath,
      expressionNum,
      soulUrgeNum,
      personalityNum,
      lifePathProfile: NUMBER_PROFILES[lifePath],
      expressionProfile: NUMBER_PROFILES[expressionNum],
    };
  }, [birthdate, fullName]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Personal Inputs
              </CardTitle>
              <CardDescription>
                Provide details to calculate your Pythagorean profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="birth-picker" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Birth Date
                </Label>
                <Input
                  id="birth-picker"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name-input" className="flex items-center gap-1">
                  <User className="w-4 h-4 text-indigo-500" /> Full Name
                </Label>
                <Input
                  id="name-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="font-semibold"
                />
                <p className="text-[10px] text-muted-foreground">
                  Input birth certificate name (vowels count Y as a vowel in this lookup).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Info */}
          <Card className="border-indigo-500/10 bg-indigo-500/5">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <Info className="w-4 h-4" />
                Numerological Numbers
              </div>
              <p>
                <strong>Life Path Number:</strong> Represents your core identity, life journey, and challenges.
              </p>
              <p>
                <strong>Expression Number:</strong> Details your natural talents, capabilities, and destiny goals.
              </p>
              <p>
                <strong>Soul Urge:</strong> Reveals your subconscious inner desires and motivation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Dashboard panel */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'profile' | 'library')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-muted/60 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-background transition-all">
                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                Your Numerological Profile
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-background transition-all">
                <LayoutGrid className="w-4 h-4 mr-2 text-indigo-500" />
                Numbers Encyclopedia
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: PROFILE */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              {calculatedProfile ? (
                <div className="space-y-6">
                  {/* Two Main Cards: Life Path & Expression */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Life Path Card */}
                    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10 font-bold text-8xl pointer-events-none select-none font-mono">
                        {calculatedProfile.lifePath}
                      </div>

                      <CardHeader className="pb-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                          Journey & Essence
                        </span>
                        <CardTitle className="text-base font-extrabold flex items-baseline gap-2">
                          Life Path Number:
                          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                            {calculatedProfile.lifePath}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-3 leading-relaxed text-muted-foreground">
                        {calculatedProfile.lifePathProfile ? (
                          <>
                            <div>
                              <strong className="text-foreground font-bold block">Archetype:</strong>
                              <span className="font-semibold text-foreground text-sm">
                                {calculatedProfile.lifePathProfile.title}
                              </span>
                            </div>
                            <div>
                              <strong className="text-foreground block">Core Keywords:</strong>
                              <span>{calculatedProfile.lifePathProfile.keyword}</span>
                            </div>
                            <div>
                              <strong className="text-foreground block">Key Strengths:</strong>
                              <span>{calculatedProfile.lifePathProfile.strengths}</span>
                            </div>
                            <p className="text-muted-foreground border-t pt-2 mt-1">
                              {calculatedProfile.lifePathProfile.description}
                            </p>
                          </>
                        ) : (
                          <p>Unknown profile reference.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Expression Number Card */}
                    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 shadow-sm relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10 font-bold text-8xl pointer-events-none select-none font-mono">
                        {calculatedProfile.expressionNum}
                      </div>

                      <CardHeader className="pb-2">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
                          Talents & Destiny
                        </span>
                        <CardTitle className="text-base font-extrabold flex items-baseline gap-2">
                          Expression Number:
                          <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
                            {calculatedProfile.expressionNum}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-3 leading-relaxed text-muted-foreground">
                        {calculatedProfile.expressionProfile ? (
                          <>
                            <div>
                              <strong className="text-foreground font-bold block">Archetype:</strong>
                              <span className="font-semibold text-foreground text-sm">
                                {calculatedProfile.expressionProfile.title}
                              </span>
                            </div>
                            <div>
                              <strong className="text-foreground block">Core Keywords:</strong>
                              <span>{calculatedProfile.expressionProfile.keyword}</span>
                            </div>
                            <div>
                              <strong className="text-foreground block">Key Strengths:</strong>
                              <span>{calculatedProfile.expressionProfile.strengths}</span>
                            </div>
                            <p className="text-muted-foreground border-t pt-2 mt-1">
                              {calculatedProfile.expressionProfile.description}
                            </p>
                          </>
                        ) : (
                          <p>Unknown profile reference.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Soul Urge & Personality (Smaller display) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Soul Urge */}
                    <Card className="border-muted bg-card/45">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                          Soul Urge (Heart's Desire)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground pr-4 leading-relaxed">
                          The internal, subconscious drives and true emotional desires governing your spirit.
                        </div>
                        <span className="text-3xl font-black text-indigo-500 bg-indigo-500/10 px-3.5 py-1 rounded-xl font-mono">
                          {calculatedProfile.soulUrgeNum}
                        </span>
                      </CardContent>
                    </Card>

                    {/* Personality Number */}
                    <Card className="border-muted bg-card/45">
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                          Personality Number
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground pr-4 leading-relaxed">
                          The external traits and characteristics you project and how other people perceive you.
                        </div>
                        <span className="text-3xl font-black text-purple-500 bg-purple-500/10 px-3.5 py-1 rounded-xl font-mono">
                          {calculatedProfile.personalityNum}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                  Provide a birthdate in the sidebar to generate calculations.
                </div>
              )}
            </TabsContent>

            {/* TAB CONTENT: LIBRARY */}
            <TabsContent value="library" className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Numerology Numbers Dictionary</h3>
                <p className="text-sm text-muted-foreground">
                  Explore the archetypes and meanings behind the core single-digit numbers and Master Numbers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(NUMBER_PROFILES).map((numKey) => {
                  const num = Number(numKey);
                  const p = NUMBER_PROFILES[num]!;
                  return (
                    <Card key={num} className="border bg-card/30 hover:bg-card/60 transition-colors">
                      <CardHeader className="p-4 pb-1.5 flex-row items-center gap-3 space-y-0">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 h-10 w-10 flex items-center justify-center rounded-lg font-mono">
                          {num}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-extrabold">{p.title}</CardTitle>
                          <CardDescription className="text-[10px] truncate max-w-[200px]">{p.keyword}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed mt-1">
                        {p.description}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ToolLayout>
  );
}

