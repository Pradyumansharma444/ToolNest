import { useState, useMemo } from 'react';
import { MapPin, Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const CITIES: CityData[] = [
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Bogota', country: 'Colombia', lat: 4.711, lon: -74.0721 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
];

function toDMS(deg: number, type: 'lat' | 'lon'): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.round(((abs - d) * 60 - m) * 60);
  const dir = type === 'lat' ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${d}°${m}'${s}"${dir}`;
}

export default function LatLongFinder() {
  const tool = getToolById('lat-long-finder')!;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('New York');

  const city = CITIES.find(c => c.name === selected);

  const filtered = useMemo(() => {
    if (!search) return CITIES;
    const q = search.toLowerCase();
    return CITIES.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
  }, [search]);

  return (
    <ToolLayout tool={tool} resultVisible={!!city}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Search cities</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Type city or country name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1 mt-2 max-h-40 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.name} onClick={() => setSelected(c.name)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${selected === c.name ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                  {c.name}, {c.country}
                </button>
              ))}
            </div>
          </div>
          {city && (
            <div className="space-y-4">
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-lg font-bold">{city.name}, {city.country}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="text-xl font-bold">{city.lat.toFixed(4)}°</p>
                  <p className="text-xs text-muted-foreground">{toDMS(city.lat, 'lat')}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="text-xl font-bold">{city.lon.toFixed(4)}°</p>
                  <p className="text-xs text-muted-foreground">{toDMS(city.lon, 'lon')}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">DMS</p>
                  <p className="text-sm font-mono">{toDMS(city.lat, 'lat')} {toDMS(city.lon, 'lon')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
