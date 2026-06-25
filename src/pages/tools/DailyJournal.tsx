import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const STORAGE_KEY = 'daily-journal-entries';

interface Entry {
  date: string;
  content: string;
  timestamp: number;
}

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return [];
}

function saveEntries(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function DailyJournal() {
  const tool = getToolById('daily-journal')!;
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => { saveEntries(entries); }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => e.content.toLowerCase().includes(q) || e.date.includes(q));
  }, [entries, search]);

  const saveEntry = useCallback(() => {
    if (!content.trim()) return;
    setEntries((prev) => {
      if (editingIndex !== null) {
        const next = [...prev];
        next[editingIndex] = { ...next[editingIndex], content: content.trim() };
        return next;
      }
      return [{ date, content: content.trim(), timestamp: Date.now() }, ...prev];
    });
    setContent('');
    setEditingIndex(null);
  }, [content, date, editingIndex]);

  const editEntry = useCallback((idx: number) => {
    const entry = filteredEntries[idx];
    const realIdx = entries.indexOf(entry);
    setEditingIndex(realIdx);
    setDate(entry.date);
    setContent(entry.content);
  }, [filteredEntries, entries]);

  const deleteEntry = useCallback((idx: number) => {
    const entry = filteredEntries[idx];
    setEntries((prev) => prev.filter((e) => e !== entry));
    if (editingIndex !== null && entries.indexOf(entry) === editingIndex) {
      setEditingIndex(null);
      setContent('');
    }
  }, [filteredEntries, entries, editingIndex]);

  const handleNew = () => {
    setEditingIndex(null);
    setContent('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="relative max-w-xs">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
  <input type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
</div>
          </div>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind today?" rows={6} />
          <div className="flex gap-2">
            <Button onClick={saveEntry} disabled={!content.trim()} className="gap-2">
              <BookOpen className="w-4 h-4" /> {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
            </Button>
            {editingIndex !== null && (
              <Button onClick={handleNew} variant="outline">New Entry</Button>
            )}
          </div>
        </Card>

        {filteredEntries.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            {search ? 'No entries match your search.' : 'No journal entries yet. Write your first one!'}
          </Card>
        )}

        <div className="space-y-3">
          {filteredEntries.map((entry, idx) => (
            <Card key={entry.timestamp} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{entry.date}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editEntry(idx)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteEntry(idx)} className="text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-3">{entry.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
