import { useState, useMemo } from 'react';
import { Plane, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface City {
  name: string;
  code: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { name: 'New York', code: 'NYC', lat: 40.7128, lon: -74.006 },
  { name: 'London', code: 'LHR', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', code: 'TYO', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', code: 'CDG', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', code: 'DXB', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', code: 'SYD', lat: -33.8688, lon: 151.2093 },
  { name: 'Los Angeles', code: 'LAX', lat: 34.0522, lon: -118.2437 },
  { name: 'Singapore', code: 'SIN', lat: 1.3521, lon: 103.8198 },
  { name: 'Mumbai', code: 'BOM', lat: 19.076, lon: 72.8777 },
  { name: 'Beijing', code: 'PEK', lat: 39.9042, lon: 116.4074 },
  { name: 'Toronto', code: 'YYZ', lat: 43.6532, lon: -79.3832 },
  { name: 'Berlin', code: 'BER', lat: 52.52, lon: 13.405 },
  { name: 'Amsterdam', code: 'AMS', lat: 52.3676, lon: 4.9041 },
  { name: 'Hong Kong', code: 'HKG', lat: 22.3193, lon: 114.1694 },
  { name: 'San Francisco', code: 'SFO', lat: 37.7749, lon: -122.4194 },
  { name: 'Delhi', code: 'DEL', lat: 28.6139, lon: 77.209 },
  { name: 'Moscow', code: 'SVO', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', code: 'IST', lat: 41.0082, lon: 28.9784 },
  { name: 'Bangkok', code: 'BKK', lat: 13.7563, lon: 100.5018 },
  { name: 'Seoul', code: 'ICN', lat: 37.5665, lon: 126.978 },
  { name: 'Chicago', code: 'ORD', lat: 41.8781, lon: -87.6298 },
  { name: 'Frankfurt', code: 'FRA', lat: 50.1109, lon: 8.6821 },
  { name: 'Rome', code: 'FCO', lat: 41.9028, lon: 12.4964 },
  { name: 'Madrid', code: 'MAD', lat: 40.4168, lon: -3.7038 },
];

const R = 6371;

function toRad(deg: number) { return deg * Math.PI / 180; }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function FlightDuration() {
  const tool = getToolById('flight-duration')!;
  const [dep, setDep] = useState('NYC');
  const [arr, setArr] = useState('LHR');

  const depCity = CITIES.find(c => c.code === dep);
  const arrCity = CITIES.find(c => c.code === arr);

  const result = useMemo(() => {
    if (!depCity || !arrCity || dep === arr) return null;
    const km = haversine(depCity.lat, depCity.lon, arrCity.lat, arrCity.lon);
    const miles = km * 0.621371;
    const speedKmph = 875;
    const hours = km / speedKmph;
    const flightMins = Math.round(hours * 60);
    return { km: Math.round(km), miles: Math.round(miles), flightH: Math.floor(flightMins / 60), flightM: flightMins % 60 };
  }, [dep, arr, depCity, arrCity]);

  const swap = () => { setDep(arr); setArr(dep); };

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="text-sm font-medium">Departure</label>
              <Select value={dep} onValueChange={setDep}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={swap} className="mb-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div>
              <label className="text-sm font-medium">Arrival</label>
              <Select value={arr} onValueChange={setArr}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {result && (
            <div className="space-y-4">
              <div className="text-center py-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{result.km.toLocaleString()} km</p>
                <p className="text-sm text-muted-foreground">{result.miles.toLocaleString()} miles</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-muted/30 p-3">
                  <Plane className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xl font-bold">{result.flightH}h {result.flightM}m</p>
                  <p className="text-xs text-muted-foreground">Est. flight time</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xl font-bold">{result.flightH >= 6 ? 'Long-haul' : result.flightH >= 3 ? 'Medium-haul' : 'Short-haul'}</p>
                  <p className="text-xs text-muted-foreground">Flight category</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
