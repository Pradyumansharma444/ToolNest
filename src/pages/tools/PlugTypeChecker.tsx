import { useState, useMemo } from 'react';
import { Plug, Zap, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface PlugInfo {
  types: string[];
  voltage: string;
  frequency: string;
}

const PLUG_DATA: Record<string, PlugInfo> = {
  'USA': { types: ['A', 'B'], voltage: '120 V', frequency: '60 Hz' },
  'Canada': { types: ['A', 'B'], voltage: '120 V', frequency: '60 Hz' },
  'Mexico': { types: ['A', 'B'], voltage: '127 V', frequency: '60 Hz' },
  'Brazil': { types: ['C', 'N'], voltage: '127 / 220 V', frequency: '60 Hz' },
  'Argentina': { types: ['C', 'I'], voltage: '220 V', frequency: '50 Hz' },
  'UK': { types: ['G'], voltage: '230 V', frequency: '50 Hz' },
  'Ireland': { types: ['G'], voltage: '230 V', frequency: '50 Hz' },
  'Germany': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'France': { types: ['C', 'E'], voltage: '230 V', frequency: '50 Hz' },
  'Italy': { types: ['C', 'F', 'L'], voltage: '230 V', frequency: '50 Hz' },
  'Spain': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Netherlands': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Switzerland': { types: ['C', 'J'], voltage: '230 V', frequency: '50 Hz' },
  'Sweden': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Norway': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Denmark': { types: ['C', 'K', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Poland': { types: ['C', 'E'], voltage: '230 V', frequency: '50 Hz' },
  'Russia': { types: ['C', 'F'], voltage: '220 V', frequency: '50 Hz' },
  'Turkey': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'India': { types: ['C', 'D', 'M'], voltage: '230 V', frequency: '50 Hz' },
  'China': { types: ['A', 'C', 'I'], voltage: '220 V', frequency: '50 Hz' },
  'Japan': { types: ['A', 'B'], voltage: '100 V', frequency: '50 / 60 Hz' },
  'South Korea': { types: ['C', 'F'], voltage: '220 V', frequency: '60 Hz' },
  'Singapore': { types: ['G'], voltage: '230 V', frequency: '50 Hz' },
  'Malaysia': { types: ['G'], voltage: '240 V', frequency: '50 Hz' },
  'Thailand': { types: ['A', 'B', 'C'], voltage: '220 V', frequency: '50 Hz' },
  'Vietnam': { types: ['A', 'B', 'C'], voltage: '220 V', frequency: '50 Hz' },
  'Indonesia': { types: ['C', 'F'], voltage: '230 V', frequency: '50 Hz' },
  'Philippines': { types: ['A', 'B'], voltage: '220 V', frequency: '60 Hz' },
  'Australia': { types: ['I'], voltage: '230 V', frequency: '50 Hz' },
  'New Zealand': { types: ['I'], voltage: '230 V', frequency: '50 Hz' },
  'South Africa': { types: ['C', 'D', 'M', 'N'], voltage: '230 V', frequency: '50 Hz' },
  'Nigeria': { types: ['D', 'G'], voltage: '230 V', frequency: '50 Hz' },
  'Kenya': { types: ['G'], voltage: '240 V', frequency: '50 Hz' },
  'Egypt': { types: ['C', 'F'], voltage: '220 V', frequency: '50 Hz' },
  'Morocco': { types: ['C', 'E'], voltage: '220 V', frequency: '50 Hz' },
  'UAE': { types: ['C', 'D', 'G'], voltage: '220 V', frequency: '50 Hz' },
  'Saudi Arabia': { types: ['A', 'B', 'C', 'G'], voltage: '127 / 220 V', frequency: '60 Hz' },
  'Israel': { types: ['C', 'H'], voltage: '230 V', frequency: '50 Hz' },
  'Hong Kong': { types: ['G'], voltage: '220 V', frequency: '50 Hz' },
};

const PLUG_IMAGES: Record<string, string> = {
  'A': 'Two flat parallel pins',
  'B': 'Two flat pins with round ground',
  'C': 'Two round pins (Europlug)',
  'D': 'Three round pins in triangle',
  'E': 'Two round pins with female ground',
  'F': 'Two round pins with clips (Schuko)',
  'G': 'Three rectangular pins (British)',
  'H': 'Two round/flat pins (Israeli)',
  'I': 'Two flat V-shaped pins (Aus/NZ)',
  'J': 'Two round pins (Swiss)',
  'K': 'Two round pins (Danish)',
  'L': 'Two/three round pins (Italian)',
  'M': 'Three round pins (South Africa)',
  'N': 'Two round pins (Brazilian)',
};

export default function PlugTypeChecker() {
  const tool = getToolById('plug-type-checker')!;
  const [search, setSearch] = useState('');

  const countries = Object.keys(PLUG_DATA).sort();

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(c => c.toLowerCase().includes(q));
  }, [search, countries]);

  const [selected, setSelected] = useState('USA');

  const data = PLUG_DATA[selected];

  return (
    <ToolLayout tool={tool} resultVisible={!!data}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Search or select a country</label>
            <Input placeholder="Type country name..." value={search} onChange={e => setSearch(e.target.value)} className="mb-2" />
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {filtered.map(c => (
                <button key={c} onClick={() => { setSelected(c); setSearch(''); }}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${selected === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <Plug className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Plug Type(s)</p>
                <p className="text-xl font-bold">{data.types.join(', ')}</p>
                <p className="text-xs text-muted-foreground mt-1">{data.types.map(t => PLUG_IMAGES[t]).join(' / ')}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Voltage</p>
                <p className="text-xl font-bold">{data.voltage}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="text-xl font-bold">{data.frequency}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
