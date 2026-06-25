import { useState } from 'react';
import { Plus, Trash2, Printer, User } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

interface Chore {
  id: string;
  name: string;
  assignments: Record<string, string>;
}

export default function ChoreChart() {
  const tool = getToolById('chore-chart')!;
  const [members, setMembers] = useState<string[]>(['Mom', 'Dad', 'Kid 1', 'Kid 2']);
  const [newMember, setNewMember] = useState('');
  const [chores, setChores] = useState<Chore[]>([
    { id: '1', name: 'Wash Dishes', assignments: {} },
    { id: '2', name: 'Vacuum Floors', assignments: {} },
    { id: '3', name: 'Take Out Trash', assignments: {} },
    { id: '4', name: 'Clean Bathroom', assignments: {} },
    { id: '5', name: 'Do Laundry', assignments: {} },
  ]);
  const [newChore, setNewChore] = useState('');

  const addMember = () => {
    const name = newMember.trim();
    if (!name || members.includes(name)) return;
    setMembers([...members, name]);
    setNewMember('');
  };

  const removeMember = (name: string) => {
    setMembers(members.filter(m => m !== name));
    setChores(chores.map(c => {
      const next = { ...c.assignments };
      delete next[name];
      return { ...c, assignments: next };
    }));
  };

  const addChore = () => {
    const name = newChore.trim();
    if (!name) return;
    setChores([...chores, { id: crypto.randomUUID(), name, assignments: {} }]);
    setNewChore('');
  };

  const removeChore = (id: string) => {
    setChores(chores.filter(c => c.id !== id));
  };

  const assignChore = (choreId: string, day: string, member: string) => {
    setChores(chores.map(c =>
      c.id === choreId
        ? { ...c, assignments: { ...c.assignments, [day]: member === '__none__' ? '' : member } }
        : c
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Family Members
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={newMember}
                onChange={e => setNewMember(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMember()}
              />
              <Button onClick={addMember} size="icon"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {members.map(m => (
                <span key={m} className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 pl-2 pr-1 py-0.5 rounded-full border border-blue-200/20">
                  {m}
                  <button onClick={() => removeMember(m)} className="hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm">Chores</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Chore name"
                value={newChore}
                onChange={e => setNewChore(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addChore()}
              />
              <Button onClick={addChore} size="icon"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {chores.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/30">
                  <span>{c.name}</span>
                  <button onClick={() => removeChore(c.id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handlePrint} variant="outline" className="w-full gap-2">
            <Printer className="w-4 h-4" /> Print Chart
          </Button>
        </div>

        <div className="lg:col-span-9 overflow-x-auto">
          <div className="rounded-xl border bg-card shadow-sm min-w-[600px]">
            <div className="grid grid-cols-[140px_repeat(7,1fr)] bg-muted/50 border-b text-xs font-semibold">
              <div className="px-3 py-2.5 border-r">Chore</div>
              {DAYS.map(d => (
                <div key={d} className="px-2 py-2.5 text-center border-r last:border-r-0">{d.slice(0, 3)}</div>
              ))}
            </div>
            <div className="divide-y">
              {chores.map(chore => (
                <div key={chore.id} className="grid grid-cols-[140px_repeat(7,1fr)] text-xs">
                  <div className="px-3 py-2 border-r font-medium flex items-center gap-1">
                    {chore.name}
                  </div>
                  {DAYS.map(day => (
                    <div key={day} className="px-1 py-1 border-r last:border-r-0">
                      <Select
                        value={chore.assignments[day] || '__none__'}
                        onValueChange={v => assignChore(chore.id, day, v)}
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          {members.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Assign each family member to chores for each day of the week. Use the print button to create a paper copy.
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
