import { useState, useMemo } from 'react';
import { Moon, Calendar, Compass, Sun } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Known New Moon date: January 6, 2000 18:14 UTC
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
// Synodic month (lunar cycle) duration in milliseconds
const LUNAR_CYCLE_MS = 29.530588853 * 24 * 60 * 60 * 1000;

interface PhaseDetail {
  name: string;
  emoji: string;
  description: string;
}

const PHASE_DETAILS: Record<string, PhaseDetail> = {
  'New Moon': {
    name: 'New Moon',
    emoji: '🌑',
    description: 'The Moon is positioned between the Earth and the Sun, making its lit side invisible to Earth. Ideal time for stargazing.',
  },
  'Waxing Crescent': {
    name: 'Waxing Crescent',
    emoji: '🌒',
    description: 'The Moon is growing, appearing as a thin silver sliver in the evening sky after sunset. It sets in the west shortly after dark.',
  },
  'First Quarter': {
    name: 'First Quarter',
    emoji: '🌓',
    description: 'Exactly half of the Moon is illuminated. It rises at noon and sets around midnight, appearing high in the sky at sunset.',
  },
  'Waxing Gibbous': {
    name: 'Waxing Gibbous',
    emoji: '🌔',
    description: 'The Moon is mostly illuminated and continues to grow. It rises in the afternoon and stays visible for most of the night.',
  },
  'Full Moon': {
    name: 'Full Moon',
    emoji: '🌕',
    description: 'The Earth is between the Sun and the Moon, showing the fully lit lunar surface. It rises at sunset and sets at sunrise.',
  },
  'Waning Gibbous': {
    name: 'Waning Gibbous',
    emoji: '🌖',
    description: 'The Moon is shrinking, rising later in the evening and staying visible through early morning. Light decreases daily.',
  },
  'Last Quarter': {
    name: 'Last Quarter',
    emoji: '🌗',
    description: 'Half of the Moon is lit, but on the opposite side of the First Quarter. It rises around midnight and sets at noon.',
  },
  'Waning Crescent': {
    name: 'Waning Crescent',
    emoji: '🌘',
    description: 'The Moon is a thin sliver again, visible in the eastern sky right before dawn. It sets in the afternoon.',
  },
};

export default function MoonPhase() {
  const tool = getToolById('moon-phase')!;

  const [targetDateStr, setTargetDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0]!;
  });
  const [hemisphere, setHemisphere] = useState<'northern' | 'southern'>('northern');

  // helper: calculate moon data for a Date
  const calculateLunarMetrics = (date: Date) => {
    const diffMs = date.getTime() - KNOWN_NEW_MOON_MS;
    
    // Calculate fractional cycles completed
    let cycleProgress = (diffMs % LUNAR_CYCLE_MS) / LUNAR_CYCLE_MS;
    if (cycleProgress < 0) {
      cycleProgress += 1.0;
    }

    // Age in days
    const age = cycleProgress * 29.53059;

    // Illumination: 0 at New Moon (0/1), 1 at Full Moon (0.5)
    // formula: 0.5 * (1 - cos(2 * pi * progress))
    const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * cycleProgress));

    // Phase identification
    let phaseName = 'New Moon';
    if (cycleProgress < 0.03 || cycleProgress >= 0.97) {
      phaseName = 'New Moon';
    } else if (cycleProgress < 0.22) {
      phaseName = 'Waxing Crescent';
    } else if (cycleProgress < 0.28) {
      phaseName = 'First Quarter';
    } else if (cycleProgress < 0.47) {
      phaseName = 'Waxing Gibbous';
    } else if (cycleProgress < 0.53) {
      phaseName = 'Full Moon';
    } else if (cycleProgress < 0.72) {
      phaseName = 'Waning Gibbous';
    } else if (cycleProgress < 0.78) {
      phaseName = 'Last Quarter';
    } else {
      phaseName = 'Waning Crescent';
    }

    // Distance to next phases
    const daysToFull = cycleProgress <= 0.5 
      ? (0.5 - cycleProgress) * 29.53
      : (1.5 - cycleProgress) * 29.53;
      
    const daysToNew = (1.0 - cycleProgress) * 29.53;

    return {
      progress: cycleProgress,
      age,
      illumination: Math.round(illumination * 100),
      phaseName,
      detail: PHASE_DETAILS[phaseName]!,
      daysToFull: parseFloat(daysToFull.toFixed(1)),
      daysToNew: parseFloat(daysToNew.toFixed(1)),
    };
  };

  const currentMetrics = useMemo(() => {
    const d = new Date(targetDateStr);
    // Align to noon to avoid timezone quirks
    d.setHours(12, 0, 0, 0);
    return calculateLunarMetrics(d);
  }, [targetDateStr]);

  // Monthly calendar forecast list (next 30 days)
  const monthlyForecast = useMemo(() => {
    const list = [];
    const baseDate = new Date(targetDateStr);
    baseDate.setHours(12, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const nextDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const metrics = calculateLunarMetrics(nextDate);
      list.push({
        date: nextDate,
        dateLabel: nextDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        metrics,
      });
    }
    return list;
  }, [targetDateStr]);

  // Helper to generate the SVG moon path terminator shade
  const moonSvgData = useMemo(() => {
    const prog = currentMetrics.progress;
    
    // We render a circle from x=-50 to x=50, radius=50
    // Waxing: lit on the right. Waning: lit on the left.
    // If southern hemisphere, flip left-right!
    const flip = hemisphere === 'southern';

    // Draw dark background circle.
    // Then overlay lit path:
    // M 0,-50 A 50,50 0 0,1 0,50
    // Then return back through terminator:
    // A termR,50 0 0,sweep 0,-50
    // Horizontal scale of terminator
    const termR = Math.abs(50 - 200 * (prog % 0.5));
    
    let litPath = '';
    
    if (prog < 0.25) {
      // Crescent Waxing
      const sweep = flip ? 1 : 0;
      litPath = `M 0,-50 A 50,50 0 0,${flip ? 0 : 1} 0,50 A ${termR},50 0 0,${sweep} 0,-50`;
    } else if (prog < 0.5) {
      // Gibbous Waxing
      const sweep = flip ? 0 : 1;
      litPath = `M 0,-50 A 50,50 0 0,${flip ? 0 : 1} 0,50 A ${termR},50 0 0,${sweep} 0,-50`;
    } else if (prog < 0.75) {
      // Gibbous Waning
      const sweep = flip ? 1 : 0;
      litPath = `M 0,-50 A 50,50 0 0,${flip ? 1 : 0} 0,50 A ${termR},50 0 0,${sweep} 0,-50`;
    } else {
      // Crescent Waning
      const sweep = flip ? 0 : 1;
      litPath = `M 0,-50 A 50,50 0 0,${flip ? 1 : 0} 0,50 A ${termR},50 0 0,${sweep} 0,-50`;
    }

    return { litPath };
  }, [currentMetrics.progress, hemisphere]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Astronomy Parameters
              </CardTitle>
              <CardDescription>
                Select date and local sky orientation parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="target-date">Calendar Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="font-semibold"
                />
              </div>

              {/* Hemisphere selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Sky Hemisphere</Label>
                <div className="flex rounded-md border p-0.5 bg-muted">
                  <button
                    type="button"
                    onClick={() => setHemisphere('northern')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                      hemisphere === 'northern' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Northern
                  </button>
                  <button
                    type="button"
                    onClick={() => setHemisphere('southern')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                      hemisphere === 'southern' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Southern
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The direction of lunar illumination reverses between hemispheres (e.g. Crescent lit on right in North, left in South).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Scientific Info */}
          <Card className="border-indigo-500/10 bg-indigo-500/5">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <Compass className="w-4 h-4" />
                Lunar Cycle Science
              </div>
              <p>
                The cycle between two identical moon phases is called a **synodic month** or **lunation**, which lasts exactly 29.53 days.
              </p>
              <p>
                Because of the Moon's elliptical orbit, its speed varies, causing the visual illumination boundary (the *terminator*) to shift gracefully over the course of the cycle.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Details Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Visual Moon Display (Glow style) */}
            <Card className="md:col-span-5 border-muted bg-[#09090b] text-white flex flex-col items-center justify-center p-6 shadow-lg min-h-[290px] relative overflow-hidden">
              {/* Star backdrop decoration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-[10%] left-[20%]" />
                <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-[30%] left-[80%]" />
                <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-[75%] left-[15%]" />
                <span className="absolute w-0.5 h-0.5 bg-white rounded-full top-[60%] left-[60%]" />
              </div>

              <h4 className="font-bold text-xs self-start text-indigo-400 tracking-wider uppercase mb-4">
                lunar visualization
              </h4>

              {/* SVG Moon */}
              <div className="relative w-40 h-40 drop-shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                <svg width="100%" height="100%" viewBox="-55 -55 110 110" className="overflow-visible">
                  {/* Underlay Shadow Moon */}
                  <circle cx="0" cy="0" r="50" fill="#18181b" stroke="2" />
                  
                  {/* Lit Portion */}
                  <path d={moonSvgData.litPath} fill="#fef08a" opacity="0.95" />

                  {/* Draw simulated craters over the top */}
                  <g fill="#1c1917" opacity="0.08" className="pointer-events-none">
                    <circle cx="-15" cy="-20" r="8" />
                    <circle cx="20" cy="10" r="6" />
                    <circle cx="5" cy="30" r="10" />
                    <circle cx="-25" cy="15" r="5" />
                    <circle cx="10" cy="-30" r="7" />
                  </g>
                </svg>
              </div>

              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-4">
                {hemisphere === 'northern' ? 'North' : 'South'} Sky View
              </span>
            </Card>

            {/* Calculations Card */}
            <Card className="md:col-span-7 border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3 border-b border-indigo-500/10">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  Lunar metrics
                </span>
                <CardTitle className="text-xl font-extrabold text-foreground flex items-center justify-between">
                  {currentMetrics.phaseName}
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {currentMetrics.illumination}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentMetrics.detail.description}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Moon Age (Days):</span>
                    <span className="font-bold text-foreground font-mono">{currentMetrics.age.toFixed(2)} days</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Synodic progress:</span>
                    <span className="font-bold text-foreground font-mono">{(currentMetrics.progress * 100).toFixed(1)}%</span>
                  </div>
                  <div className="space-y-1 border-t pt-2 col-span-2 flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> Days to Full Moon:
                    </span>
                    <span className="font-bold text-foreground font-mono">{currentMetrics.daysToFull} days</span>
                  </div>
                  <div className="space-y-1 border-t pt-2 col-span-2 flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" /> Days to New Moon:
                    </span>
                    <span className="font-bold text-foreground font-mono">{currentMetrics.daysToNew} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Grid (Horizontal Scroll) */}
          <Card className="border-muted bg-card/40">
            <CardHeader className="p-4 pb-2 border-b flex-row justify-between items-center space-y-0">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider">
                  30-Day Lunar Forecast
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {monthlyForecast.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-24 p-3 border rounded-xl bg-background/50 hover:bg-background/80 transition-colors flex flex-col items-center space-y-2 shadow-sm text-center"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      {item.dateLabel}
                    </span>
                    
                    {/* Small Moon Svg */}
                    <div className="w-8 h-8">
                      <svg width="100%" height="100%" viewBox="-55 -55 110 110">
                        <circle cx="0" cy="0" r="50" fill="#27272a" />
                        <path
                          d={
                            (() => {
                              const prog = item.metrics.progress;
                              const flip = hemisphere === 'southern';
                              const termR = Math.abs(50 - 200 * (prog % 0.5));
                              if (prog < 0.25) {
                                return `M 0,-50 A 50,50 0 0,${flip ? 0 : 1} 0,50 A ${termR},50 0 0,${flip ? 1 : 0} 0,-50`;
                              } else if (prog < 0.5) {
                                return `M 0,-50 A 50,50 0 0,${flip ? 0 : 1} 0,50 A ${termR},50 0 0,${flip ? 0 : 1} 0,-50`;
                              } else if (prog < 0.75) {
                                return `M 0,-50 A 50,50 0 0,${flip ? 1 : 0} 0,50 A ${termR},50 0 0,${flip ? 1 : 0} 0,-50`;
                              } else {
                                return `M 0,-50 A 50,50 0 0,${flip ? 1 : 0} 0,50 A ${termR},50 0 0,${flip ? 0 : 1} 0,-50`;
                              }
                            })()
                          }
                          fill="#fef08a"
                        />
                      </svg>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-foreground block truncate max-w-[80px]">
                        {item.metrics.phaseName}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono block">
                        {item.metrics.illumination}% lit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

