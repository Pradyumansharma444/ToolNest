import { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, Baby } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

export default function PregnancyCalculator() {
  const tool = getToolById('pregnancy-calculator') || {
    id: 'pregnancy-calculator',
    name: 'Pregnancy Due Date Calculator',
    description: 'Calculate your estimated due date, gestational age, and pregnancy timeline milestones.',
    metaTitle: 'Pregnancy Due Date & Milestone Calculator | ToolNest',
    metaDescription: 'Calculate your baby\'s due date from your last menstrual period (LMP) or conception date, and see trimester milestones.',
    category: 'health',
  };

  const [calcMode, setCalcMode] = useState<'lmp' | 'conception'>('lmp');
  const [dateInput, setDateInput] = useState('');
  const [cycleLength, setCycleLength] = useState('28');

  const timeline = useMemo(() => {
    if (!dateInput) return null;

    let lmpDate: Date;
    let conceptionDate: Date;
    let dueDate: Date;

    const baseDate = parseISO(dateInput);

    if (calcMode === 'lmp') {
      lmpDate = baseDate;
      const cycleDiff = Number(cycleLength) - 28;
      // Due Date = LMP + 280 days + (cycle length - 28)
      dueDate = addDays(lmpDate, 280 + cycleDiff);
      conceptionDate = addDays(lmpDate, 14 + cycleDiff);
    } else {
      conceptionDate = baseDate;
      // Due Date = Conception + 266 days
      dueDate = addDays(conceptionDate, 266);
      lmpDate = addDays(conceptionDate, -14); // Back-calculated LMP
    }

    const today = new Date();
    const totalDays = differenceInDays(today, lmpDate);
    const daysLeft = differenceInDays(dueDate, today);

    // Gestational specs
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));

    let trimester = 1;
    if (weeks >= 27) trimester = 3;
    else if (weeks >= 13) trimester = 2;

    // Milestones
    const milestones = [
      { name: 'Estimated Conception', date: conceptionDate, desc: 'Fertilization of the egg.' },
      { name: 'First Heartbeat', date: addDays(lmpDate, 42), desc: 'Fetal heart begins to beat (6 weeks).' },
      { name: 'End of 1st Trimester', date: addDays(lmpDate, 91), desc: 'Risk of miscarriage drops significantly (13 weeks).' },
      { name: 'First Movements (Quickening)', date: addDays(lmpDate, 126), desc: 'Mother may start to feel light flutters (18 weeks).' },
      { name: 'Viability Milestone', date: addDays(lmpDate, 168), desc: 'High chance of survival outside the womb with intensive care (24 weeks).' },
      { name: 'End of 2nd Trimester', date: addDays(lmpDate, 189), desc: 'Entering the final stretch of growth (27 weeks).' },
      { name: 'Full Term', date: addDays(lmpDate, 259), desc: 'Baby\'s organs are fully functional and ready for birth (37 weeks).' },
      { name: 'Estimated Due Date (EDD)', date: dueDate, desc: 'Congratulations! Estimated date of delivery (40 weeks).' },
    ];

    return {
      lmpDate,
      dueDate,
      weeks,
      days,
      daysLeft,
      progressPercent,
      trimester,
      milestones,
    };
  }, [calcMode, dateInput, cycleLength]);

  return (
    <ToolLayout tool={tool as import('@/types').Tool} resultVisible={!!timeline}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">Calculator Setup</h3>

          <div className="space-y-1">
            <label className="text-sm font-medium">Calculate based on:</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={calcMode === 'lmp' ? 'default' : 'outline'}
                onClick={() => setCalcMode('lmp')}
                className="w-full text-xs"
              >
                Last Period (LMP)
              </Button>
              <Button
                type="button"
                variant={calcMode === 'conception' ? 'default' : 'outline'}
                onClick={() => setCalcMode('conception')}
                className="w-full text-xs"
              >
                Conception Date
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                {calcMode === 'lmp' ? 'First Day of Last Period' : 'Date of Conception'}
              </label>
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </div>

            {calcMode === 'lmp' && (
              <div>
                <label className="text-sm font-medium">Average Cycle Length (Days)</label>
                <Select value={cycleLength} onValueChange={setCycleLength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => String(i + 22)).map((len) => (
                      <SelectItem key={len} value={len}>
                        {len} Days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {timeline ? (
            <div className="space-y-6">
              {/* Due Date & Current Week Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Estimated Due Date
                  </span>
                  <p className="text-2xl md:text-3xl font-extrabold mt-2 text-rose-500">
                    {format(timeline.dueDate, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeline.daysLeft > 0 ? `${timeline.daysLeft} days remaining` : 'Due date reached!'}
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Current Gestational Age
                  </span>
                  <p className="text-2xl md:text-3xl font-extrabold mt-2 text-primary">
                    {timeline.weeks > 42 ? 'Overdue' : `${timeline.weeks} Weeks, ${timeline.days} Days`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trimester {timeline.trimester} of pregnancy
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Gestational Progress</span>
                  <span>{timeline.progressPercent}% Complete</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 dark:bg-rose-600 transition-all duration-500"
                    style={{ width: `${timeline.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Conception</span>
                  <span>1st Tri</span>
                  <span>2nd Tri</span>
                  <span>3rd Tri</span>
                  <span>Due Date</span>
                </div>
              </div>

              {/* Milestones list */}
              <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-rose-400" /> Key Milestones Timeline
                </h4>
                <div className="space-y-4 border-l border-muted pl-4 ml-2 relative">
                  {timeline.milestones.map((m, index) => {
                    const isPassed = differenceInDays(new Date(), m.date) > 0;
                    return (
                      <div key={index} className="relative space-y-1">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-background transition-colors ${
                            isPassed ? 'border-rose-400 bg-rose-400' : 'border-muted'
                          }`}
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <span className={`font-semibold text-xs ${isPassed ? 'text-rose-500' : 'text-foreground'}`}>
                            {m.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {format(m.date, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground bg-muted/20 min-h-[300px]">
              <Calendar className="w-12 h-12 mb-3 text-muted-foreground/60" />
              <h3 className="font-semibold text-base mb-1">Pregnancy Timeline Setup</h3>
              <p className="text-sm max-w-md">
                Select your Last Period Date or conception details in the configuration panel to map out key fetal milestones and trimester guidelines.
              </p>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This tool is for informational and educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Always consult with a qualified health professional or OB/GYN before making medical decisions or changes to your prenatal care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
