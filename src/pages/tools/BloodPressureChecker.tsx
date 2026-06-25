/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Heart, Info, AlertTriangle, Plus, Trash2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface BpLog {
  id: string;
  timestamp: string;
  systolic: number;
  diastolic: number;
  label: string;
  colorClass: string;
}

export default function BloodPressureChecker() {
  const tool = getToolById('blood-pressure') || {
    id: 'blood-pressure',
    name: 'Blood Pressure Checker',
    description: 'Log and analyze your blood pressure readings according to AHA guidelines.',
    metaTitle: 'Blood Pressure Checker & History Tracker | ToolNest',
    metaDescription: 'Analyze your systolic and diastolic blood pressure readings, check hypertension categories, and maintain a client-side health log.',
    category: 'health',
  };

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [logs, setLogs] = useState<BpLog[]>(() => {
    const cachedLogs = localStorage.getItem('bp-checker-logs');
    if (cachedLogs) {
      try {
        return JSON.parse(cachedLogs);
      } catch {
        return [];
      }
    }
    return [];
  });

  const currentClassification = useMemo(() => {
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (!sys || !dia || sys <= 0 || dia <= 0) return null;

    if (sys > 180 || dia > 120) {
      return {
        label: 'Hypertensive Crisis',
        desc: 'Consult your doctor immediately or seek emergency medical care.',
        color: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900',
        gaugeBg: 'bg-red-700',
      };
    }
    if (sys >= 140 || dia >= 90) {
      return {
        label: 'Hypertension Stage 2',
        desc: 'Systolic is 140 or higher, or diastolic is 90 or higher.',
        color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50',
        gaugeBg: 'bg-red-500',
      };
    }
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return {
        label: 'Hypertension Stage 1',
        desc: 'Systolic is 130-139, or diastolic is 80-89.',
        color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
        gaugeBg: 'bg-amber-500',
      };
    }
    if (sys >= 120 && sys <= 129 && dia < 80) {
      return {
        label: 'Elevated',
        desc: 'Systolic is 120-129 and diastolic is less than 80.',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50',
        gaugeBg: 'bg-yellow-400',
      };
    }
    return {
      label: 'Normal',
      desc: 'Systolic is less than 120 and diastolic is less than 80.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
      gaugeBg: 'bg-emerald-500',
    };
  }, [systolic, diastolic]);

  const logReading = () => {
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (!sys || !dia || sys <= 0 || dia <= 0 || !currentClassification) return;

    const newLog: BpLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      systolic: sys,
      diastolic: dia,
      label: currentClassification.label,
      colorClass: currentClassification.color,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('bp-checker-logs', JSON.stringify(updated));

    // Clear inputs
    setSystolic('');
    setDiastolic('');
  };

  const deleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    localStorage.setItem('bp-checker-logs', JSON.stringify(updated));
  };

  const clearAllLogs = () => {
    if (window.confirm('Clear all logged readings?')) {
      setLogs([]);
      localStorage.removeItem('bp-checker-logs');
    }
  };

  return (
    <ToolLayout tool={tool as any} resultVisible={logs.length > 0 || !!currentClassification}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Parameters Panel */}
        <div className="md:col-span-1 rounded-xl border bg-card p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-base mb-2">New Reading</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Systolic (Upper Number, mmHg)</label>
              <Input
                type="number"
                placeholder="120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                min="50"
                max="250"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Diastolic (Lower Number, mmHg)</label>
              <Input
                type="number"
                placeholder="80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                min="30"
                max="150"
              />
            </div>

            <Button
              onClick={logReading}
              disabled={!currentClassification}
              className="w-full gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Reading
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Classification Display */}
          {currentClassification ? (
            <div className={`rounded-xl border p-5 space-y-2 shadow-sm ${currentClassification.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Category</span>
                  <h4 className="text-xl font-bold mt-0.5">{currentClassification.label}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Reading</span>
                  <p className="text-xl font-extrabold mt-0.5">{systolic}/{diastolic} mmHg</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{currentClassification.desc}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground bg-muted/20">
              <Heart className="w-10 h-10 mb-2 text-muted-foreground/60" />
              <p className="text-xs max-w-sm">
                Enter your systolic and diastolic measurements to analyze your blood pressure range.
              </p>
            </div>
          )}

          {/* Logs List */}
          {logs.length > 0 && (
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-400" /> Log History
                </h4>
                <Button variant="ghost" onClick={clearAllLogs} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 px-2">
                  Clear All
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-xs p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-bold text-foreground">
                        {log.systolic}/{log.diastolic} mmHg
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{log.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold px-2 py-0.5 rounded text-[10px] border border-muted bg-card">
                        {log.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLog(log.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines info */}
          <div className="flex gap-3 bg-muted/50 rounded-xl border p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">AHA Blood Pressure Ranges</p>
              <p className="mb-2">
                The American Heart Association (AHA) defines the following pressure categories for adults:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><span className="font-bold text-foreground">Normal</span>: Under 120 systolic AND under 80 diastolic.</li>
                <li><span className="font-bold text-foreground">Elevated</span>: 120-129 systolic AND under 80 diastolic.</li>
                <li><span className="font-bold text-foreground">Stage 1</span>: 130-139 systolic OR 80-89 diastolic.</li>
                <li><span className="font-bold text-foreground">Stage 2</span>: 140 or higher systolic OR 90 or higher diastolic.</li>
                <li><span className="font-bold text-foreground">Crisis</span>: Over 180 systolic and/or over 120 diastolic.</li>
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This tool is for informational and educational purposes only and does not constitute professional medical advice, diagnosis, or treatment. Self-monitoring is not a substitute for clinical visits. Always consult with a qualified health professional or doctor if you have concerns about your blood pressure readings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
