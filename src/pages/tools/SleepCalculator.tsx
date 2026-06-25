import { useState, useMemo } from 'react';
import { Moon, Sun, Clock, Coffee, AlertCircle, Info, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SleepCalculator() {
  const tool = getToolById('sleep-calculator')!;

  const [activeTab, setActiveTab] = useState<'wake' | 'bed' | 'naps'>('wake');
  
  // States for 'Wake up' (input: bedtime)
  const [bedtime, setBedtime] = useState('23:00');
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  // States for 'Bedtime' (input: wake time)
  const [waketime, setWaketime] = useState('07:00');

  // Latency to fall asleep (minutes)
  const [latency, setLatency] = useState<number>(15);

  // Helper to format time (e.g., Date -> "10:30 PM")
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Convert "HH:MM" string to a Date object today
  const timeStringToDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Calculations for Wake-up times (given a Bedtime)
  const wakeUpOptions = useMemo(() => {
    let baseDate: Date;
    if (useCurrentTime && activeTab === 'wake') {
      baseDate = new Date();
    } else {
      baseDate = timeStringToDate(bedtime);
    }

    // Add latency (time it takes to fall asleep)
    const sleepStartDate = new Date(baseDate.getTime() + latency * 60 * 1000);

    const cycles = [1, 2, 3, 4, 5, 6];
    return cycles.map((c) => {
      const wakeTime = new Date(sleepStartDate.getTime() + c * 90 * 60 * 1000);
      const totalSleepMinutes = c * 90;
      const hours = Math.floor(totalSleepMinutes / 60);
      const mins = totalSleepMinutes % 60;
      
      // Determine quality rating
      let rating = 'Poor';
      let color = 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
      if (c === 3 || c === 4) {
        rating = 'Okay';
        color = 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
      } else if (c >= 5) {
        rating = 'Optimal';
        color = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30';
      }

      return {
        cycle: c,
        time: wakeTime,
        formattedTime: formatTime(wakeTime),
        duration: `${hours}h ${mins > 0 ? `${mins}m` : ''}`,
        rating,
        color,
      };
    });
  }, [bedtime, useCurrentTime, latency, activeTab]);

  // Calculations for Bedtimes (given a desired Wake-up time)
  const bedtimeOptions = useMemo(() => {
    const targetWakeDate = timeStringToDate(waketime);
    const cycles = [6, 5, 4, 3, 2, 1]; // Order from longest/best sleep to shortest
    
    return cycles.map((c) => {
      // Subtract cycle duration and sleep latency
      const totalMinutes = c * 90 + latency;
      const bedTime = new Date(targetWakeDate.getTime() - totalMinutes * 60 * 1000);
      const hours = Math.floor((c * 90) / 60);
      const mins = (c * 90) % 60;

      let rating = 'Poor';
      let color = 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
      if (c === 3 || c === 4) {
        rating = 'Okay';
        color = 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
      } else if (c >= 5) {
        rating = 'Optimal';
        color = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30';
      }

      return {
        cycle: c,
        time: bedTime,
        formattedTime: formatTime(bedTime),
        duration: `${hours}h ${mins > 0 ? `${mins}m` : ''}`,
        rating,
        color,
      };
    });
  }, [waketime, latency]);

  // Nap guidelines
  const napOptions = [
    {
      name: 'Power Nap',
      duration: '20 min',
      benefits: 'Improves motor skills, alertness, and energy. Ideal for a quick workday boost without post-nap grogginess.',
      icon: Zap,
      badge: 'Highly Efficient',
      badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200/30',
    },
    {
      name: 'NASA Power Nap',
      duration: '26 min',
      benefits: 'Scientifically proven by NASA to improve pilot performance by 34% and alertness by 54%. Great for high-intensity work.',
      icon: Sparkles,
      badge: 'Scientific Pick',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/30',
    },
    {
      name: 'Sweet Spot',
      duration: '30 min',
      benefits: 'Enhances cognitive memory and physical endurance. May cause mild sleep inertia (grogginess) for 5-10 minutes after waking.',
      icon: Clock,
      badge: 'Memory Boost',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/30',
    },
    {
      name: 'Deep Sleep Nap',
      duration: '60 min',
      benefits: 'Deep slow-wave sleep. Boosts memory for facts, faces, and names. Expect moderate sleep inertia upon waking.',
      icon: Moon,
      badge: 'Brain Reboot',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/30',
    },
    {
      name: 'Full Cycle Nap',
      duration: '90 min',
      benefits: 'A full sleep cycle including REM sleep. Enhances creativity, emotional memory, and procedural learning. Zero grogginess.',
      icon: Coffee,
      badge: 'Full Recovery',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/30',
    },
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-muted bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Parameters
              </CardTitle>
              <CardDescription>
                Customize variables to fit your personal circadian rhythms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Latency slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <Label htmlFor="latency" className="font-medium">Time to fall asleep</Label>
                  <span className="text-muted-foreground font-semibold text-xs bg-muted px-2 py-0.5 rounded">
                    {latency} minutes
                  </span>
                </div>
                <Slider
                  id="latency"
                  value={[latency]}
                  onValueChange={(val) => setLatency(val[0])}
                  min={5}
                  max={45}
                  step={5}
                  className="py-2"
                />
                <p className="text-[11px] text-muted-foreground">
                  The time you typically spend tossing and turning before drifting off (average is 15 minutes).
                </p>
              </div>

              <div className="h-px bg-muted" />

              {/* Dynamic input depending on tab */}
              {activeTab === 'wake' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm">Bedtime Source</Label>
                    <div className="flex rounded-md border p-0.5 bg-muted">
                      <button
                        type="button"
                        onClick={() => setUseCurrentTime(true)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          useCurrentTime ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseCurrentTime(false)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          !useCurrentTime ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Custom Time
                      </button>
                    </div>
                  </div>

                  {!useCurrentTime && (
                    <div className="space-y-2">
                      <Label htmlFor="bedtime-input" className="text-xs">When are you going to sleep?</Label>
                      <Input
                        id="bedtime-input"
                        type="time"
                        value={bedtime}
                        onChange={(e) => setBedtime(e.target.value)}
                        className="font-medium"
                      />
                    </div>
                  )}
                  {useCurrentTime && (
                    <div className="p-3 bg-muted/30 border border-muted/50 rounded-lg flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Calculating from current time:</span>
                      <span className="text-sm font-bold text-indigo-500 animate-pulse">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bed' && (
                <div className="space-y-3">
                  <Label htmlFor="waketime-input" className="font-medium text-sm">Desired Wake-up Time</Label>
                  <Input
                    id="waketime-input"
                    type="time"
                    value={waketime}
                    onChange={(e) => setWaketime(e.target.value)}
                    className="font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Select the exact time you want to be out of bed. We will calculate when you need to be asleep.
                  </p>
                </div>
              )}

              {activeTab === 'naps' && (
                <div className="p-4 bg-muted/20 border rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="w-4 h-4 text-indigo-500" />
                    About Power Napping
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Napping is an excellent way to restore cognitive power. To avoid grogginess (sleep inertia), restrict naps to either 20-30 minutes, or a complete 90-minute sleep cycle.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scientific Info Card */}
          <Card className="border-muted bg-card/30">
            <CardContent className="p-5 text-xs text-muted-foreground space-y-3 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                The 90-Minute Rule
              </div>
              <p>
                Humans sleep in cycles that average <strong>90 minutes</strong>. Each cycle runs from light sleep, down to deep sleep, and back up into REM (dreaming) sleep.
              </p>
              <p>
                Waking up mid-cycle leaves you feeling groggy, exhausted, and disoriented. Waking up at the completion of a cycle leaves you feeling refreshed and alert.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="wake" value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'wake' | 'bed' | 'naps')} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1">
              <TabsTrigger value="wake" className="data-[state=active]:bg-background transition-all">
                <Sun className="w-4 h-4 mr-2 text-amber-500" />
                Wake-up Times
              </TabsTrigger>
              <TabsTrigger value="bed" className="data-[state=active]:bg-background transition-all">
                <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                Bedtimes
              </TabsTrigger>
              <TabsTrigger value="naps" className="data-[state=active]:bg-background transition-all">
                <Coffee className="w-4 h-4 mr-2 text-emerald-500" />
                Power Naps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wake" className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Calculated Wake-up Times</h3>
                <p className="text-sm text-muted-foreground">
                  If you close your eyes at {useCurrentTime ? 'now' : bedtime} (+ {latency} min to fall asleep), try waking up at one of these times:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wakeUpOptions.map((opt) => (
                  <Card key={opt.cycle} className="border bg-card/40 hover:bg-card/70 transition-all duration-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-indigo-400" />
                          {opt.cycle} {opt.cycle === 1 ? 'Cycle' : 'Cycles'} ({opt.duration})
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                          {opt.formattedTime}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${opt.color}`}>
                        {opt.rating}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 bg-muted/20 border border-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
                <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p>
                  For a healthy night's sleep, human bodies generally require <strong>5 to 6 full cycles</strong> (7.5 to 9 hours). Waking up at <strong>{wakeUpOptions[4]?.formattedTime}</strong> or <strong>{wakeUpOptions[5]?.formattedTime}</strong> is highly recommended.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="bed" className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Optimal Bedtimes</h3>
                <p className="text-sm text-muted-foreground">
                  To wake up refreshed at {waketime}, aim to fall asleep at one of the following times (includes {latency} min to fall asleep):
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bedtimeOptions.map((opt) => (
                  <Card key={opt.cycle} className="border bg-card/40 hover:bg-card/70 transition-all duration-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-indigo-400" />
                          {opt.cycle} {opt.cycle === 1 ? 'Cycle' : 'Cycles'} ({opt.duration} sleep)
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                          {opt.formattedTime}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${opt.color}`}>
                        {opt.rating}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 bg-muted/20 border border-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
                <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p>
                  Going to bed at <strong>{bedtimeOptions[1]?.formattedTime}</strong> (6 cycles) or <strong>{bedtimeOptions[0]?.formattedTime}</strong> (5 cycles) provides the healthiest, most complete rest.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="naps" className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">Scientific Nap Scheduler</h3>
                <p className="text-sm text-muted-foreground">
                  Quick rest periods tailored to specific brain benefits. Close your eyes and wake up feeling rejuvenated.
                </p>
              </div>

              <div className="space-y-4">
                {napOptions.map((nap, idx) => {
                  const Icon = nap.icon;
                  return (
                    <Card key={idx} className="border bg-card/40 hover:bg-card/70 transition-all duration-200">
                      <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold">{nap.name}</CardTitle>
                            <CardDescription className="text-xs font-semibold text-indigo-500 mt-0.5">
                              Duration: {nap.duration}
                            </CardDescription>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${nap.badgeColor}`}>
                          {nap.badge}
                        </span>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                        {nap.benefits}
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

