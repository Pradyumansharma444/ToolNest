import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';

export default function OvulationCalculator() {
  const tool = getToolById('ovulation-calculator') || {
    id: 'ovulation-calculator',
    name: 'Ovulation & Fertility Calculator',
    description: 'Calculate your ovulation day, fertile window, and next period cycles.',
    metaTitle: 'Ovulation & Fertile Window Calculator | ToolNest',
    metaDescription: 'Find your most fertile days and schedule your cycle predictions with our interactive fertility calendar.',
    category: 'health',
  };

  const [dateInput, setDateInput] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const predictions = useMemo(() => {
    if (!dateInput) return null;

    const baseLmp = parseISO(dateInput);
    const length = Number(cycleLength);

    const cycles = [];
    let lmp = baseLmp;

    // Project next 3 cycles
    for (let i = 0; i < 3; i++) {
      const nextPeriodStart = addDays(lmp, length);
      const ovulation = addDays(nextPeriodStart, -14);
      const fertileStart = addDays(ovulation, -5);
      const fertileEnd = addDays(ovulation, 1);
      const periodEnd = addDays(lmp, 4); // Assume 5 days of bleeding

      cycles.push({
        periodStart: lmp,
        periodEnd,
        fertileStart,
        fertileEnd,
        ovulation,
        nextPeriodStart,
      });

      lmp = nextPeriodStart;
    }

    return cycles;
  }, [dateInput, cycleLength]);

  // Calendar Day Checking Helpers
  const getDayState = (day: Date) => {
    if (!predictions) return 'normal';

    for (const cycle of predictions) {
      if (isSameDay(day, cycle.ovulation)) {
        return 'ovulation';
      }
      if (day >= cycle.fertileStart && day <= cycle.fertileEnd) {
        return 'fertile';
      }
      if (day >= cycle.periodStart && day <= cycle.periodEnd) {
        return 'period';
      }
    }
    return 'normal';
  };

  // Calendar render metrics
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentCalendarMonth);
    const end = endOfMonth(currentCalendarMonth);
    const days = eachDayOfInterval({ start, end });

    // Pad starting days
    const startDayOfWeek = getDay(start);
    const padding = Array.from({ length: startDayOfWeek }, () => null);

    return [...padding, ...days];
  }, [currentCalendarMonth]);

  const handlePrevMonth = () => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1));
  const handleNextMonth = () => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1));

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={!!predictions}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">Cycle Setup</h3>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">First Day of Last Period</label>
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  if (e.target.value) {
                    setCurrentCalendarMonth(parseISO(e.target.value));
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Average Cycle Length (Days)</label>
              <Select value={cycleLength} onValueChange={setCycleLength}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 25 }, (_, i) => String(i + 21)).map((len) => (
                    <SelectItem key={len} value={len}>
                      {len} Days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {predictions ? (
            <div className="space-y-6">
              {/* Highlight summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Next Ovulation Day
                  </span>
                  <p className="text-xl md:text-2xl font-extrabold mt-2 text-purple-600 dark:text-purple-400">
                    {format(predictions[0].ovulation, 'EEEE, MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Highest chance of conception
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Next Fertile Window
                  </span>
                  <p className="text-xl md:text-2xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-500">
                    {format(predictions[0].fertileStart, 'MMM d')} - {format(predictions[0].fertileEnd, 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ideal days for planning pregnancy
                  </p>
                </div>
              </div>

              {/* Custom interactive calendar */}
              <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-purple-400" /> Fertility Calendar
                  </h4>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-semibold px-2 min-w-[100px] text-center">
                      {format(currentCalendarMonth, 'MMMM yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center text-xs pb-2 border-b">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-red-400 dark:bg-red-600" />
                    <span>Period Day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300" />
                    <span>Fertile Window (High chance)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-purple-500 text-white" />
                    <span>Ovulation Day (Peak chance)</span>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Days of week */}
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d} className="text-xs font-bold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                  {/* Calendar slots */}
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="h-9" />;

                    const state = getDayState(day);
                    let cellClass = 'hover:bg-muted/50 text-foreground';

                    if (state === 'period') {
                      cellClass = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200';
                    } else if (state === 'fertile') {
                      cellClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200';
                    } else if (state === 'ovulation') {
                      cellClass = 'bg-purple-500 text-white font-bold shadow-sm';
                    }

                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-9 flex items-center justify-center text-xs rounded transition-colors ${cellClass}`}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Cycle projections lists */}
              <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                <h4 className="font-semibold text-sm">Future Predictions</h4>
                <div className="space-y-2">
                  {predictions.map((p, index) => (
                    <div key={index} className="flex justify-between items-center text-xs border-b pb-2 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-bold text-foreground">Cycle {index + 1}</p>
                        <p className="text-muted-foreground">
                          Period: {format(p.periodStart, 'MMM d')} - {format(p.periodEnd, 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          Ovulation: {format(p.ovulation, 'MMM d, yyyy')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Fertility: {format(p.fertileStart, 'MMM d')} - {format(p.fertileEnd, 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <CalendarIcon className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Set Cycle Specifications</h3>
              <p className="text-sm max-w-md">
                Input your last period date and cycle length to generate your peak fertility projections and view the calendar layout.
              </p>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This tool is for informational and educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Fertile windows are predictions and should not be used as a primary method of birth control. Consult with a healthcare professional for clinical counseling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
