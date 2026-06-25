import { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const SUBJECT_COLORS = [
  'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
  'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
  'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'bg-teal-200 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
];

export default function StudyTimetable() {
  const tool = getToolById('study-timetable')!;
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Science', 'English']);
  const [newSubject, setNewSubject] = useState('');
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const addSubject = () => {
    if (!newSubject.trim() || subjects.includes(newSubject.trim())) return;
    setSubjects(prev => [...prev, newSubject.trim()]);
    setNewSubject('');
  };

  const removeSubject = (subj: string) => {
    setSubjects(prev => prev.filter(s => s !== subj));
    setSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k] === subj) delete next[k]; });
      return next;
    });
  };

  const toggleCell = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    if (!activeSubject) return;
    setSchedule(prev => {
      const next = { ...prev };
      if (next[key] === activeSubject) delete next[key];
      else next[key] = activeSubject;
      return next;
    });
  };

  const getSubjectColor = (subj: string) => {
    const idx = subjects.indexOf(subj);
    return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
  };

  const downloadTimetable = () => {
    const lines = ['Weekly Study Timetable\n'];
    lines.push('Day'.padEnd(14) + SLOTS.map(s => s.padEnd(12)).join(''));
    lines.push('');
    DAYS.forEach(day => {
      const row = day.padEnd(14);
      lines.push(row + SLOTS.map(slot => {
        const key = `${day}-${slot}`;
        return (schedule[key] || '-').padEnd(12);
      }).join(''));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-timetable.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="flex flex-wrap gap-2 items-center">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setActiveSubject(activeSubject === subj ? null : subj)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${getSubjectColor(subj)} ${activeSubject === subj ? 'ring-2 ring-primary ring-offset-2' : 'opacity-80 hover:opacity-100'}`}
            >
              {subj}
            </button>
          ))}
          <div className="flex gap-1 ml-2">
            <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="New subject..." className="w-32 h-8 text-sm" onKeyDown={e => e.key === 'Enter' && addSubject()} />
            <Button size="icon" variant="ghost" onClick={addSubject}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        {activeSubject && (
          <div className="rounded-lg bg-muted/30 p-3 text-sm text-center">
            Click cells to assign <span className={`inline-block rounded px-2 py-0.5 font-medium ${getSubjectColor(activeSubject)}`}>{activeSubject}</span>. Click again to remove.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border p-1.5 text-left sticky left-0 bg-card font-medium text-muted-foreground w-24">Day / Time</th>
                {SLOTS.map(slot => (
                  <th key={slot} className="border p-1.5 text-center font-medium text-muted-foreground min-w-[80px]">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="border p-1.5 font-medium sticky left-0 bg-card">{day}</td>
                  {SLOTS.map(slot => {
                    const key = `${day}-${slot}`;
                    const subj = schedule[key];
                    return (
                      <td
                        key={key}
                        onClick={() => toggleCell(day, slot)}
                        className={`border p-1.5 text-center cursor-pointer transition-colors hover:bg-muted/50 ${subj ? getSubjectColor(subj) : ''}`}
                      >
                        {subj || ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          {subjects.map(subj => (
            <Badge key={subj} variant="outline" className="gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${getSubjectColor(subj).split(' ')[0]}`} />
              {subj}
              <button onClick={() => removeSubject(subj)} className="ml-1 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>

        <Button variant="outline" onClick={downloadTimetable} className="w-full">
          <Download className="w-4 h-4 mr-1" />Download as Text
        </Button>
      </div>
    </ToolLayout>
  );
}
