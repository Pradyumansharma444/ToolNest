import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, Trash2, Briefcase } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STORAGE_KEY = 'time-tracker-sessions';

interface Session {
  id: string;
  project: string;
  start: number;
  end: number | null;
}

export default function TimeTracker() {
  const tool = getToolById('time-tracker')!;
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [project, setProject] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.end === null);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - activeSession.start);
      }, 100);
      return () => { clearInterval(timerRef.current!); };
    }
  }, [activeSession]);

  const startTimer = () => {
    if (!project.trim()) return;
    const newSession: Session = {
      id: Math.random().toString(36).substring(2, 9),
      project: project.trim(),
      start: Date.now(),
      end: null,
    };
    setSessions(prev => [...prev, newSession]);
  };

  const stopTimer = () => {
    setSessions(prev =>
      prev.map(s => (s.end === null ? { ...s, end: Date.now() } : s))
    );
    setElapsed(0);
  };

  const clearSessions = () => setSessions([]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  const totalByProject = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.filter(s => s.end !== null).forEach(s => {
      map[s.project] = (map[s.project] || 0) + (s.end! - s.start);
    });
    return map;
  }, [sessions]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Timer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={project}
                onChange={e => setProject(e.target.value)}
                placeholder="e.g. Client Website"
                disabled={!!activeSession}
              />
            </div>
            <div className="text-center py-6">
              <div className="text-5xl font-mono font-bold tabular-nums">
                {formatTime(elapsed)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {activeSession ? `Tracking: ${activeSession.project}` : 'Ready'}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              {!activeSession ? (
                <Button onClick={startTimer} size="lg" disabled={!project.trim()}>
                  <Play className="w-5 h-5 mr-2" />Start
                </Button>
              ) : (
                <Button onClick={stopTimer} variant="destructive" size="lg">
                  <Square className="w-5 h-5 mr-2" />Stop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Session Log</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearSessions}>
              <Trash2 className="w-4 h-4 mr-1" />Clear
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            )}
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{s.project}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.start)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">
                    {s.end ? formatTime(s.end - s.start) : 'Running...'}
                  </p>
                </div>
              </div>
            ))}
            {Object.keys(totalByProject).length > 0 && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Totals by Project</p>
                {Object.entries(totalByProject).map(([p, ms]) => (
                  <div key={p} className="flex justify-between text-sm">
                    <span>{p}</span>
                    <span className="font-mono">{formatTime(ms)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
