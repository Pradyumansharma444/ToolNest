import { useState } from 'react';
import { Luggage, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type TripType = 'beach' | 'snow' | 'city' | 'camping';

const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: 'beach', label: 'Beach Vacation' },
  { value: 'snow', label: 'Snow / Ski Trip' },
  { value: 'city', label: 'City Break' },
  { value: 'camping', label: 'Camping Trip' },
];

const ITEMS_BY_TYPE: Record<TripType, string[]> = {
  beach: [
    'Swimsuit', 'Sunscreen (SPF 30+)', 'Sunglasses', 'Beach towel', 'Flip-flops',
    'Sun hat', 'Beach umbrella', 'Snorkeling gear', 'Sarong/cover-up', 'Aloe vera gel',
    'Waterproof phone pouch', 'Beach bag', 'Portable speaker', 'Cooler',
  ],
  snow: [
    'Winter jacket', 'Thermal base layers', 'Ski pants', 'Snow boots', 'Gloves',
    'Beanie / ear muffs', 'Scarf', 'Lip balm with SPF', 'Moisturizer', 'Hand warmers',
    'Ski goggles', 'Thick socks (wool)', 'Neck gaiter',
  ],
  city: [
    'Comfortable walking shoes', 'Daypack / crossbody bag', 'Umbrella', 'Power bank',
    'Travel adapter', 'Reusable water bottle', 'Camera', 'City map / guidebook',
    'Carry-on luggage', 'Passport / ID', 'Wallet / money belt', 'Snacks',
  ],
  camping: [
    'Tent', 'Sleeping bag', 'Sleeping pad / air mattress', 'Camp stove', 'Cookware set',
    'Headlamp / flashlight', 'First aid kit', 'Insect repellent', 'Multi-tool / knife',
    'Water filter / purification', 'Matches / lighter', 'Camp chairs', 'Cooler',
    'Biodegradable soap', 'Trash bags',
  ],
};

interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function PackingList() {
  const tool = getToolById('packing-list')!;
  const [tripType, setTripType] = useState<TripType>('beach');
  const [customItem, setCustomItem] = useState('');
  const [items, setItems] = useState<PackingItem[]>(() =>
    ITEMS_BY_TYPE['beach'].map(text => ({ id: crypto.randomUUID(), text, checked: false }))
  );

  const handleTripChange = (val: string) => {
    const type = val as TripType;
    setTripType(type);
    setItems(ITEMS_BY_TYPE[type].map(text => ({ id: crypto.randomUUID(), text, checked: false })));
  };

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const addCustomItem = () => {
    const text = customItem.trim();
    if (!text) return;
    setItems([...items, { id: crypto.randomUUID(), text, checked: false }]);
    setCustomItem('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const checkedCount = items.filter(i => i.checked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Luggage className="w-4 h-4 text-blue-500" />
              Trip Type
            </h3>
            <Select value={tripType} onValueChange={handleTripChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIP_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Custom Item
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add your own item"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomItem()}
              />
              <Button onClick={addCustomItem} size="icon"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-2 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Packed</span>
              <span className="font-bold text-emerald-500">{checkedCount}/{items.length}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/50 border-b flex items-center justify-between">
              <span className="font-semibold text-sm">Packing Checklist</span>
              <Badge variant="outline" className="text-xs">
                {TRIP_TYPES.find(t => t.value === tripType)?.label}
              </Badge>
            </div>
            <div className="divide-y">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    item.checked ? 'bg-muted/10 line-through text-muted-foreground' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {item.checked
                      ? <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                    {item.text}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {items.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No items. Select a trip type to generate a packing list.
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
