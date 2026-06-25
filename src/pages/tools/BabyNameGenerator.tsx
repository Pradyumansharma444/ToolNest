import { useState, useMemo } from 'react';
import { Heart, Search, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NameEntry {
  name: string;
  gender: 'boy' | 'girl' | 'unisex';
  origin: string;
  meaning: string;
}

const NAMES: NameEntry[] = [
  { name: 'Liam', gender: 'boy', origin: 'Irish', meaning: 'Strong-willed warrior' },
  { name: 'Emma', gender: 'girl', origin: 'German', meaning: 'Universal' },
  { name: 'Noah', gender: 'boy', origin: 'Hebrew', meaning: 'Rest, comfort' },
  { name: 'Olivia', gender: 'girl', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Oliver', gender: 'boy', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Charlotte', gender: 'girl', origin: 'French', meaning: 'Free man' },
  { name: 'James', gender: 'boy', origin: 'Hebrew', meaning: 'Supplanter' },
  { name: 'Amelia', gender: 'girl', origin: 'German', meaning: 'Work' },
  { name: 'Ethan', gender: 'boy', origin: 'Hebrew', meaning: 'Strong, firm' },
  { name: 'Mia', gender: 'girl', origin: 'Italian', meaning: 'Mine' },
  { name: 'Lucas', gender: 'boy', origin: 'Greek', meaning: 'Light' },
  { name: 'Isabella', gender: 'girl', origin: 'Italian', meaning: 'Pledged to God' },
  { name: 'Mason', gender: 'boy', origin: 'English', meaning: 'Worker in stone' },
  { name: 'Sophia', gender: 'girl', origin: 'Greek', meaning: 'Wisdom' },
  { name: 'Logan', gender: 'boy', origin: 'Scottish', meaning: 'Little hollow' },
  { name: 'Ava', gender: 'girl', origin: 'Latin', meaning: 'Bird' },
  { name: 'Aiden', gender: 'boy', origin: 'Irish', meaning: 'Little fire' },
  { name: 'Ella', gender: 'girl', origin: 'German', meaning: 'Light' },
  { name: 'Carter', gender: 'boy', origin: 'English', meaning: 'Transporter of goods' },
  { name: 'Grace', gender: 'girl', origin: 'Latin', meaning: 'Grace of God' },
  { name: 'Elijah', gender: 'boy', origin: 'Hebrew', meaning: 'My God is Yahweh' },
  { name: 'Chloe', gender: 'girl', origin: 'Greek', meaning: 'Blooming' },
  { name: 'Wyatt', gender: 'boy', origin: 'English', meaning: 'Brave in war' },
  { name: 'Harper', gender: 'girl', origin: 'English', meaning: 'Harp player' },
  { name: 'Henry', gender: 'boy', origin: 'German', meaning: 'Home ruler' },
  { name: 'Evelyn', gender: 'girl', origin: 'English', meaning: 'Wished for child' },
  { name: 'Jack', gender: 'boy', origin: 'English', meaning: 'God is gracious' },
  { name: 'Luna', gender: 'girl', origin: 'Latin', meaning: 'Moon' },
  { name: 'Owen', gender: 'boy', origin: 'Welsh', meaning: 'Young warrior' },
  { name: 'Aria', gender: 'girl', origin: 'Italian', meaning: 'Air' },
  { name: 'Leo', gender: 'boy', origin: 'Latin', meaning: 'Lion' },
  { name: 'Stella', gender: 'girl', origin: 'Latin', meaning: 'Star' },
  { name: 'Ezra', gender: 'boy', origin: 'Hebrew', meaning: 'Help' },
  { name: 'Maya', gender: 'girl', origin: 'Sanskrit', meaning: 'Illusion' },
  { name: 'Asher', gender: 'boy', origin: 'Hebrew', meaning: 'Happy, blessed' },
  { name: 'Hazel', gender: 'girl', origin: 'English', meaning: 'Hazelnut' },
  { name: 'Kai', gender: 'unisex', origin: 'Hawaiian', meaning: 'Sea' },
  { name: 'Riley', gender: 'unisex', origin: 'Irish', meaning: 'Courageous' },
  { name: 'Quinn', gender: 'unisex', origin: 'Irish', meaning: 'Wisdom, reason' },
  { name: 'Sage', gender: 'unisex', origin: 'Latin', meaning: 'Wise one' },
  { name: 'Avery', gender: 'unisex', origin: 'English', meaning: 'Elfin ruler' },
  { name: 'Jordan', gender: 'unisex', origin: 'Hebrew', meaning: 'To flow down' },
  { name: 'Zion', gender: 'unisex', origin: 'Hebrew', meaning: 'Highest point' },
  { name: 'Rowan', gender: 'unisex', origin: 'Irish', meaning: 'Little red-haired one' },
  { name: 'Arjun', gender: 'boy', origin: 'Sanskrit', meaning: 'Bright, shining' },
  { name: 'Priya', gender: 'girl', origin: 'Sanskrit', meaning: 'Beloved' },
  { name: 'Hiro', gender: 'boy', origin: 'Japanese', meaning: 'Generous' },
  { name: 'Sakura', gender: 'girl', origin: 'Japanese', meaning: 'Cherry blossom' },
  { name: 'Mateo', gender: 'boy', origin: 'Spanish', meaning: 'Gift of God' },
  { name: 'Sofia', gender: 'girl', origin: 'Spanish', meaning: 'Wisdom' },
];

const ORIGINS = [...new Set(NAMES.map(n => n.origin))].sort();

export default function BabyNameGenerator() {
  const tool = getToolById('baby-name-generator')!;
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('baby-name-favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const toggleFavorite = (name: string) => {
    const next = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];
    setFavorites(next);
    localStorage.setItem('baby-name-favorites', JSON.stringify(next));
  };

  const filtered = useMemo(() => {
    return NAMES.filter(n => {
      if (genderFilter !== 'all' && n.gender !== genderFilter) return false;
      if (originFilter !== 'all' && n.origin !== originFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!n.name.toLowerCase().includes(q) && !n.meaning.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, genderFilter, originFilter]);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search names or meanings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="boy">Boy</SelectItem>
                <SelectItem value="girl">Girl</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Origins</SelectItem>
                {ORIGINS.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{filtered.length} names</span>
              {favorites.length > 0 && (
                <Badge variant="secondary" className="text-xs">{favorites.length} favorites</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(entry => {
            const isFav = favorites.includes(entry.name);
            return (
              <div
                key={entry.name}
                className={`rounded-xl border p-4 transition-all shadow-sm ${
                  isFav
                    ? 'bg-red-500/5 border-red-200/30'
                    : 'bg-card hover:border-muted-foreground/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{entry.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {entry.gender === 'boy' ? '👦' : entry.gender === 'girl' ? '👧' : '👤'} {entry.gender}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">{entry.origin}</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(entry.name)}
                    className={`transition-colors ${isFav ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {entry.meaning}
                </p>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            <p className="font-semibold">No names match your criteria</p>
            <p className="text-xs mt-1">Try adjusting the filters.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
