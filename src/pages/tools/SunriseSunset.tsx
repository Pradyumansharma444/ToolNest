import { useState, useMemo } from 'react';
import { Sun, Sunrise, Sunset } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface CityCoord { name: string; lat: number; lon: number; }

const CITIES: CityCoord[] = [
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
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633 },
  { name: 'Reykjavik', lat: 64.1466, lon: -21.9426 },
];

function toRad(deg: number) { return deg * Math.PI / 180; }

function toDeg(rad: number) { return rad * 180 / Math.PI; }

function calcSunriseSunset(lat: number, _lon: number, date: Date): { sunrise: string; sunset: string; dayLength: string } | null {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const zenith = 90.833;
  const latRad = toRad(lat);

  const declination = 23.45 * Math.sin(toRad(360 / 365 * (dayOfYear - 81)));
  const declRad = toRad(declination);

  const cosHA = (Math.cos(toRad(zenith)) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));

  if (Math.abs(cosHA) > 1) return null;

  const ha = toDeg(Math.acos(cosHA));

  const sunriseMinutes = 720 - 4 * ha;
  const sunsetMinutes = 720 + 4 * ha;

  const minutesToTime = (mins: number): string => {
    const adjusted = ((mins + 24 * 60) % (24 * 60));
    const h = Math.floor(adjusted / 60);
    const m = Math.floor(adjusted % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const sunrise = minutesToTime(sunriseMinutes);
  const sunset = minutesToTime(sunsetMinutes);
  const dayLengthMins = sunsetMinutes - sunriseMinutes;
  const dlH = Math.floor(dayLengthMins / 60);
  const dlM = Math.round(dayLengthMins % 60);

  return { sunrise, sunset, dayLength: `${dlH}h ${dlM}m` };
}

export default function SunriseSunset() {
  const tool = getToolById('sunrise-sunset')!;
  const now = new Date();
  const [city, setCity] = useState('New York');
  const [dateStr, setDateStr] = useState(now.toISOString().slice(0, 10));

  const selectedCity = CITIES.find(c => c.name === city)!;

  const result = useMemo(() => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return calcSunriseSunset(selectedCity.lat, selectedCity.lon, d);
  }, [city, dateStr, selectedCity]);

  const isToday = dateStr === now.toISOString().slice(0, 10);

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {CITIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
                  <Sunrise className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="text-2xl font-bold tabular-nums">{result.sunrise}</p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-4 text-center">
                  <Sunset className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm text-muted-foreground">Sunset</p>
                  <p className="text-2xl font-bold tabular-nums">{result.sunset}</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-center">
                  <Sun className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Day Length</p>
                  <p className="text-2xl font-bold tabular-nums">{result.dayLength}</p>
                </div>
              </div>
              {isToday && (
                <div className="text-center text-sm text-muted-foreground">
                  {(() => {
                    const h = now.getHours() * 60 + now.getMinutes();
                    const sr = parseInt(result.sunrise.split(':')[0]) * 60 + parseInt(result.sunrise.split(':')[1]);
                    const ss = parseInt(result.sunset.split(':')[0]) * 60 + parseInt(result.sunset.split(':')[1]);
                    return h < sr ? '☀️ Sun hasn\'t risen yet' : h < ss ? '☀️ Daytime' : '🌙 Nighttime';
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
