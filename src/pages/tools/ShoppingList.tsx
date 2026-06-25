import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ShoppingCart, CheckCircle2, RotateCcw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Other'] as const;

interface Item {
  id: string;
  name: string;
  category: string;
  bought: boolean;
}

export default function ShoppingList() {
  const tool = getToolById('shopping-list')!;
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('shopping-list-items');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Produce');

  useEffect(() => {
    localStorage.setItem('shopping-list-items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    setItems([...items, { id: crypto.randomUUID(), name, category: newCategory, bought: false }]);
    setNewName('');
  };

  const toggleBought = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
  };

  const clearBought = () => {
    setItems(items.filter(i => !i.bought));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const grouped = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    CATEGORIES.forEach(c => groups[c] = []);
    items.forEach(i => {
      if (groups[i.category]) groups[i.category].push(i);
      else groups['Other'].push(i);
    });
    return groups;
  }, [items]);

  const totalItems = items.length;
  const boughtCount = items.filter(i => i.bought).length;

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-500" />
              Add Item
            </h3>
            <div className="space-y-2">
              <Input
                placeholder="Item name (e.g. Apples)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
              />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addItem} className="w-full gap-1">
                <Plus className="w-4 h-4" /> Add to List
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-bold">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bought</span>
              <span className="font-bold text-emerald-500">{boughtCount}</span>
            </div>
            {boughtCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearBought} className="w-full gap-1 text-xs mt-2">
                <RotateCcw className="w-3 h-3" /> Clear Bought Items
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {CATEGORIES.filter(c => (grouped[c] ?? []).length > 0).map(category => (
            <div key={category} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b">
                <Badge variant="secondary" className="text-xs">{category}</Badge>
              </div>
              <div className="divide-y">
                {grouped[category]?.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      item.bought ? 'bg-muted/20 line-through text-muted-foreground' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleBought(item.id)}
                        className={`rounded-full p-0.5 transition-colors ${
                          item.bought ? 'text-emerald-500' : 'text-muted-foreground hover:text-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <span>{item.name}</span>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold">Your shopping list is empty</p>
              <p className="text-xs mt-1">Add items using the form to get started.</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
