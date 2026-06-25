import { useState, useMemo } from 'react';
import { Ruler, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface City {
  name: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
];

function toRad(deg: number) { return deg * Math.PI / 180; }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CityDistance() {
  const tool = getToolById('city-distance')!;
  const [city1, setCity1] = useState('New York');
  const [city2, setCity2] = useState('London');

  const c1 = CITIES.find(c => c.name === city1);
  const c2 = CITIES.find(c => c.name === city2);

  const result = useMemo(() => {
    if (!c1 || !c2 || city1 === city2) return null;
    const km = haversine(c1.lat, c1.lon, c2.lat, c2.lon);
    return { km: Math.round(km), miles: Math.round(km * 0.621371) };
  }, [city1, city2, c1, c2]);

  const swap = () => { setCity1(city2); setCity2(city1); };

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="text-sm font-medium">City A</label>
              <Select value={city1} onValueChange={setCity1}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={swap} className="mb-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div>
              <label className="text-sm font-medium">City B</label>
              <Select value={city2} onValueChange={setCity2}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {result && (
            <div className="grid grid-cols-2 gap-4 text-center py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <Ruler className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.km.toLocaleString()} km</p>
                <p className="text-xs text-muted-foreground">Kilometers</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <Ruler className="w-6 h-6 mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.miles.toLocaleString()} mi</p>
                <p className="text-xs text-muted-foreground">Miles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
