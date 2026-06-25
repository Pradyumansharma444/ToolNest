import { useState } from 'react';
import { Plus, Trash2, FileDown, Users, ListChecks } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function genId() { return Math.random().toString(36).substring(2, 9); }

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
}

export default function MeetingMinutes() {
  const tool = getToolById('meeting-minutes')!;
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendees, setAttendees] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const addAction = () => {
    setActionItems(prev => [...prev, { id: genId(), task: '', assignee: '' }]);
  };

  const updateAction = (id: string, field: keyof ActionItem, value: string) => {
    setActionItems(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAction = (id: string) => {
    setActionItems(prev => prev.filter(a => a.id !== id));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Meeting Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meeting Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sprint Planning" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Attendees (comma separated)</Label>
              <Input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="Alice, Bob, Charlie" />
            </div>
            <div>
              <Label>Agenda</Label>
              <Textarea value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="1. Project status\n2. Budget review\n3. Next steps" rows={4} />
            </div>
            <div>
              <Label>Meeting Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key discussion points and decisions..." rows={4} />
            </div>
            <div>
              <Label className="mb-2 block">Action Items</Label>
              {actionItems.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2">
                  <div className="sm:col-span-7">
                    <Input value={item.task} onChange={e => updateAction(item.id, 'task', e.target.value)} placeholder="Task description" />
                  </div>
                  <div className="sm:col-span-4">
                    <Input value={item.assignee} onChange={e => updateAction(item.id, 'assignee', e.target.value)} placeholder="Assignee" />
                  </div>
                  <div className="sm:col-span-1">
                    <Button variant="ghost" size="sm" onClick={() => removeAction(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAction}>
                <Plus className="w-4 h-4 mr-1" />Add Action Item
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Minutes Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white text-sm space-y-4">
              {title && <h2 className="text-xl font-bold">{title}</h2>}
              {date && <p className="text-xs text-gray-500">Date: {date}</p>}
              {attendees && (
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span><strong>Attendees:</strong> {attendees}</span>
                </div>
              )}
              {agenda && (
                <div>
                  <h3 className="font-semibold text-sm">Agenda</h3>
                  <pre className="text-xs whitespace-pre-wrap mt-1">{agenda}</pre>
                </div>
              )}
              {notes && (
                <div>
                  <h3 className="font-semibold text-sm">Notes</h3>
                  <pre className="text-xs whitespace-pre-wrap mt-1">{notes}</pre>
                </div>
              )}
              {actionItems.some(a => a.task) && (
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    <ListChecks className="w-4 h-4" /> Action Items
                  </h3>
                  <ul className="text-xs space-y-1 mt-1">
                    {actionItems.filter(a => a.task).map(a => (
                      <li key={a.id} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        <span>{a.task}</span>
                        {a.assignee && <span className="text-muted-foreground">— {a.assignee}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button className="mt-4" disabled>
              <FileDown className="w-4 h-4 mr-2" />Download PDF (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
