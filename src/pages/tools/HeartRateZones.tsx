import { useState, useMemo } from 'react';
import { Activity, Info, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Zone {
  name: string;
  intensity: string;
  minBpm: number;
  maxBpm: number;
  description: string;
  colorClass: string;
  progressBg: string;
}

export default function HeartRateZones() {
  const tool = getToolById('heart-rate-zones') || {
    id: 'heart-rate-zones',
    name: 'Heart Rate Zones Calculator',
    description: 'Calculate your target heart rate zones for cardiovascular training using the Karvonen formula.',
    metaTitle: 'Heart Rate Zones Calculator - Karvonen Method | ToolNest',
    metaDescription: 'Find your target heart rate zones (Zone 1-5) based on age and resting heart rate to optimize aerobic workouts.',
    category: 'health',
  };

  const [age, setAge] = useState('');
  const [restingHr, setRestingHr] = useState('');

  const mhr = useMemo(() => {
    const ageVal = Number(age);
    if (!ageVal || ageVal <= 0) return 0;
    // Standard formula: 220 - age
    return 220 - ageVal;
  }, [age]);

  const zones = useMemo<Zone[] | null>(() => {
    const ageVal = Number(age);
    if (!ageVal || ageVal <= 0) return null;

    const rhrVal = Number(restingHr) || 0;
    const maxHr = 220 - ageVal;
    const hrr = maxHr - rhrVal;

    const getBpm = (intensity: number) => {
      // Karvonen formula: Target HR = (HRR * intensity) + RHR
      return Math.round((hrr * intensity) + rhrVal);
    };

    return [
      {
        name: 'Zone 1: Warm Up',
        intensity: '50% - 60%',
        minBpm: getBpm(0.5),
        maxBpm: getBpm(0.6),
        description: 'Active recovery, easy pace. Builds basic stamina and accelerates muscle repair.',
        colorClass: 'text-blue-500 border-blue-200 dark:border-blue-900',
        progressBg: 'bg-blue-500',
      },
      {
        name: 'Zone 2: Fat Burn',
        intensity: '60% - 70%',
        minBpm: getBpm(0.6),
        maxBpm: getBpm(0.7),
        description: 'Conversational endurance pace. Optimizes metabolism to utilize fats for energy.',
        colorClass: 'text-emerald-500 border-emerald-200 dark:border-emerald-900',
        progressBg: 'bg-emerald-500',
      },
      {
        name: 'Zone 3: Aerobic',
        intensity: '70% - 80%',
        minBpm: getBpm(0.7),
        maxBpm: getBpm(0.8),
        description: 'Moderate cardio effort. Improves efficiency of heart, lungs, and circulatory pathways.',
        colorClass: 'text-yellow-600 border-yellow-200 dark:border-yellow-900',
        progressBg: 'bg-yellow-500',
      },
      {
        name: 'Zone 4: Anaerobic',
        intensity: '80% - 90%',
        minBpm: getBpm(0.8),
        maxBpm: getBpm(0.9),
        description: 'High intensity. Boosts speed endurance, lactic threshold capacity, and VO2 max.',
        colorClass: 'text-orange-500 border-orange-200 dark:border-orange-900',
        progressBg: 'bg-orange-500',
      },
      {
        name: 'Zone 5: Red Line',
        intensity: '90% - 100%',
        minBpm: getBpm(0.9),
        maxBpm: getBpm(1.0),
        description: 'Maximum exertion. Short intervals. Increases anaerobic performance speed.',
        colorClass: 'text-red-500 border-red-200 dark:border-red-900',
        progressBg: 'bg-red-500',
      },
    ];
  }, [age, restingHr]);

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={zones !== null}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">Age & Pulse</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Age (Years)</label>
              <Input
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="110"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Resting Heart Rate (BPM, optional)</label>
              <Input
                type="number"
                placeholder="60"
                value={restingHr}
                onChange={(e) => setRestingHr(e.target.value)}
                min="30"
                max="150"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Leave blank to calculate based purely on age (RHR = 0). Providing resting pulse enables the more accurate Karvonen method.
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {zones ? (
            <div className="space-y-6">
              {/* Max HR card summary */}
              <div className="rounded-xl border bg-card p-5 flex justify-between items-center shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    Estimated Max Heart Rate
                  </span>
                  <p className="text-3xl font-extrabold mt-1 text-primary">{mhr} BPM</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    Resting Heart Rate
                  </span>
                  <p className="text-xl font-bold mt-1 text-muted-foreground">
                    {restingHr ? `${restingHr} BPM` : 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Training Zones Lists */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" /> Target Training Zones
                </h4>
                <div className="space-y-3">
                  {zones.map((zone, idx) => (
                    <div key={idx} className={`rounded-xl border bg-card p-4 space-y-2 shadow-sm border-l-4`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-bold text-sm ${zone.colorClass}`}>{zone.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-muted">
                          {zone.minBpm} - {zone.maxBpm} BPM ({zone.intensity})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{zone.description}</p>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${zone.progressBg}`}
                          style={{
                            width: `${(zone.maxBpm / mhr) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanatory Info */}
              <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Karvonen Method vs. Basic MHR</p>
                  <p>
                    The Karvonen formula factors in your Resting Heart Rate (RHR) to determine Target Heart Rate (THR) ranges. By subtracting your resting rate from your max heart rate, it calculates your Heart Rate Reserve (HRR) representing the dynamic workload ceiling available for workouts. This offers a more personalized zone guide than formulas based solely on age.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <Activity className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Enter Age Details</h3>
              <p className="text-sm max-w-md">
                Input your age in the parameters panel to compile your target heart rate zones and see training descriptions.
              </p>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This tool is for informational and educational purposes only and does not constitute professional medical advice or training prescription. Max heart rate formulas are population estimations. Consult with a primary care physician or sports medicine specialist before initiating a high-intensity cardio program.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
