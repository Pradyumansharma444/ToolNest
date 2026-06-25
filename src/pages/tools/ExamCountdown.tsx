import { useState, useEffect, useMemo } from 'react';
import { Calendar, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface StudyTask {
  id: number;
  topic: string;
  date: string;
  done: boolean;
}

export default function ExamCountdown() {
  const tool = getToolById('exam-countdown')!;
  const [examDate, setExamDate] = useState('');
  const [examName, setExamName] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [taskTopic, setTaskTopic] = useState('');
  const [taskDate, setTaskDate] = useState('');

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const examTime = useMemo(() => examDate ? new Date(examDate + 'T23:59:59').getTime() : 0, [examDate]);
  const diff = examTime ? examTime - now : 0;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
  const passed = diff < 0;

  const addTask = () => {
    if (!taskTopic.trim() || !taskDate) return;
    setTasks(prev => [...prev, { id: Date.now(), topic: taskTopic.trim(), date: taskDate, done: false }]);
    setTaskTopic('');
    setTaskDate('');
  };

  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <ToolLayout tool={tool} resultVisible={!!examDate}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Name</label>
            <Input value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Math Final" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Date</label>
            <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
        </div>

        {examDate && (
          <div className="rounded-xl border-2 border-primary/20 bg-muted/30 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <p className="text-lg font-semibold">{examName || 'Exam'}</p>
            </div>
            {passed ? (
              <p className="text-2xl font-bold text-destructive">The exam date has passed!</p>
            ) : (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Days', value: days },
                  { label: 'Hours', value: hours },
                  { label: 'Minutes', value: minutes },
                  { label: 'Seconds', value: seconds },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-background p-3">
                    <p className="text-3xl font-bold tabular-nums">{pad(item.value)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" />Study Schedule</h3>
          <div className="flex gap-2">
            <Input value={taskTopic} onChange={e => setTaskTopic(e.target.value)} placeholder="Topic to study..." className="flex-1" />
            <Input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="w-40" />
            <Button size="icon" onClick={addTask} disabled={!taskTopic.trim() || !taskDate}><Plus className="w-4 h-4" /></Button>
          </div>
          {tasks.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between rounded-lg border p-3 text-sm ${task.done ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} className="accent-primary" />
                    <span className={task.done ? 'line-through' : ''}>{task.topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{new Date(task.date).toLocaleDateString()}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
