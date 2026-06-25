import { useState, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function toRad(deg: number) { return deg * Math.PI / 180; }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GpsDistance() {
  const tool = getToolById('gps-distance')!;
  const [lat1, setLat1] = useState('40.7128');
  const [lon1, setLon1] = useState('-74.006');
  const [lat2, setLat2] = useState('51.5074');
  const [lon2, setLon2] = useState('-0.1278');

  const result = useMemo(() => {
    const a = parseFloat(lat1), b = parseFloat(lon1);
    const c = parseFloat(lat2), d = parseFloat(lon2);
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) return null;
    if (a === c && b === d) return { km: 0, miles: 0, nmi: 0 };
    const km = haversine(a, b, c, d);
    return {
      km: Math.round(km * 100) / 100,
      miles: Math.round(km * 0.621371 * 100) / 100,
      nmi: Math.round(km * 0.539957 * 100) / 100,
    };
  }, [lat1, lon1, lat2, lon2]);

  const inputClass = "text-sm";

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Point A</p>
              <div>
                <label className="text-xs text-muted-foreground">Latitude</label>
                <Input className={inputClass} placeholder="e.g. 40.7128" value={lat1} onChange={e => setLat1(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Longitude</label>
                <Input className={inputClass} placeholder="e.g. -74.006" value={lon1} onChange={e => setLon1(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Point B</p>
              <div>
                <label className="text-xs text-muted-foreground">Latitude</label>
                <Input className={inputClass} placeholder="e.g. 51.5074" value={lat2} onChange={e => setLat2(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Longitude</label>
                <Input className={inputClass} placeholder="e.g. -0.1278" value={lon2} onChange={e => setLon2(e.target.value)} />
              </div>
            </div>
          </div>
          {result && (
            <div className="grid grid-cols-3 gap-4 text-center py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <Navigation className="w-5 h-5 mx-auto mb-1" />
                <p className="text-lg font-bold">{result.km.toLocaleString()} km</p>
                <p className="text-xs text-muted-foreground">Kilometers</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <Navigation className="w-5 h-5 mx-auto mb-1" />
                <p className="text-lg font-bold">{result.miles.toLocaleString()} mi</p>
                <p className="text-xs text-muted-foreground">Miles</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <Navigation className="w-5 h-5 mx-auto mb-1" />
                <p className="text-lg font-bold">{result.nmi.toLocaleString()} nmi</p>
                <p className="text-xs text-muted-foreground">Nautical miles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
