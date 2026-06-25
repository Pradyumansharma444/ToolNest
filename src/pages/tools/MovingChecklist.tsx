import { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Square, Trash2 } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Category {
  title: string;
  color: string;
  items: ChecklistItem[];
}

const DEFAULT_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: '8 Weeks Before',
    items: [
      'Create a moving budget',
      'Research moving companies or truck rentals',
      'Get quotes from at least 3 movers',
      'Declutter and donate unused items',
      'Start gathering packing supplies',
      'Notify landlord of move-out date',
      'Begin sorting items room by room',
    ],
  },
  {
    title: '4 Weeks Before',
    items: [
      'Book moving company or truck',
      'Start packing non-essential items',
      'Change address with USPS',
      'Notify utility companies of move date',
      'Arrange for school records transfer',
      'Collect important documents',
      'Measure new home for furniture placement',
    ],
  },
  {
    title: '2 Weeks Before',
    items: [
      'Pack most belongings except essentials',
      'Label all boxes with room and contents',
      'Arrange for pets and plants transport',
      'Confirm moving day details with movers',
      'Set up internet and cable at new home',
      'Defrost and clean refrigerator',
      'Empty and clean all appliances',
    ],
  },
  {
    title: '1 Week Before',
    items: [
      'Pack a "first night" essentials box',
      'Confirm elevator/stair access at both locations',
      'Arrange parking permits for moving truck',
      'Finish deep cleaning old home',
      'Take photos of valuables for insurance',
      'Disassemble large furniture',
      'Return borrowed items and collect loaned items',
    ],
  },
  {
    title: 'Moving Day',
    items: [
      'Do a final walkthrough of old home',
      'Keep essentials bag with you (not in truck)',
      'Confirm movers arrival time',
      'Take meter readings at old home',
      'Leave keys and garage openers for new tenant',
      'Direct movers on furniture placement',
      'Check for damage before movers leave',
      'Enjoy your new home!',
    ],
  },
];

export default function MovingChecklist() {
  const tool = getToolById('moving-checklist')!;
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('moving-checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_CATEGORIES.map(c => ({
      title: c.title,
      color: '',
      items: c.items.map(text => ({ id: crypto.randomUUID(), text, checked: false })),
    }));
  });

  useEffect(() => {
    localStorage.setItem('moving-checklist', JSON.stringify(categories));
  }, [categories]);

  const toggleItem = (catIdx: number, itemId: string) => {
    setCategories(cats => cats.map((c, i) =>
      i === catIdx
        ? { ...c, items: c.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) }
        : c
    ));
  };

  const resetAll = () => {
    setCategories(DEFAULT_CATEGORIES.map(c => ({
      title: c.title,
      color: '',
      items: c.items.map(text => ({ id: crypto.randomUUID(), text, checked: false })),
    })));
  };

  const totalItems = useMemo(() => categories.reduce((s, c) => s + c.items.length, 0), [categories]);
  const checkedItems = useMemo(() => categories.reduce((s, c) => s + c.items.filter(i => i.checked).length, 0), [categories]);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">Moving Progress</h3>
              <p className="text-xs text-muted-foreground">{checkedItems} of {totalItems} items done</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{progress}%</Badge>
              <Button variant="outline" size="sm" onClick={resetAll} className="gap-1 text-xs">
                <Trash2 className="w-3 h-3" /> Reset
              </Button>
            </div>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat, catIdx) => {
            const catDone = cat.items.filter(i => i.checked).length;
            return (
              <div key={cat.title} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/50 border-b flex items-center justify-between">
                  <span className="font-semibold text-sm">{cat.title}</span>
                  <Badge variant="secondary" className="text-xs">{catDone}/{cat.items.length}</Badge>
                </div>
                <div className="divide-y">
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(catIdx, item.id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/20 ${
                        item.checked ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.checked
                        ? <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      }
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
