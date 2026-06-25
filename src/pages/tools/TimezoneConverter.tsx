import { useState, useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Helsinki', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok',
  'Asia/Singapore', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Seoul',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Fiji', 'Africa/Cairo', 'Africa/Johannesburg',
];

export default function TimezoneConverter() {
  const tool = getToolById('timezone-converter')!;
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [fromZone, setFromZone] = useState('America/New_York');
  const [toZone, setToZone] = useState('Europe/London');

  const convertedTime = useMemo(() => {
    if (!dateTime) return null;
    try {
      const date = new Date(dateTime);
      const fromOffset = getOffset(date, fromZone);
      const toOffset = getOffset(date, toZone);
      const diffMs = (toOffset - fromOffset) * 60 * 1000;
      const converted = new Date(date.getTime() + diffMs);
      return converted;
    } catch {
      return null;
    }
  }, [dateTime, fromZone, toZone]);

  const getOffset = (date: Date, zone: string): number => {
    // Simplified offset calculation
    const offsets: Record<string, number> = {
      'UTC': 0, 'America/New_York': -300, 'America/Chicago': -360,
      'America/Denver': -420, 'America/Los_Angeles': -480, 'America/Toronto': -300,
      'America/Vancouver': -480, 'America/Mexico_City': -360, 'America/Sao_Paulo': -180,
      'Europe/London': 0, 'Europe/Paris': 60, 'Europe/Berlin': 60, 'Europe/Madrid': 60,
      'Europe/Rome': 60, 'Europe/Amsterdam': 60, 'Europe/Stockholm': 60,
      'Europe/Helsinki': 120, 'Europe/Moscow': 180, 'Asia/Dubai': 240,
      'Asia/Karachi': 300, 'Asia/Kolkata': 330, 'Asia/Dhaka': 360, 'Asia/Bangkok': 420,
      'Asia/Singapore': 480, 'Asia/Shanghai': 480, 'Asia/Hong_Kong': 480,
      'Asia/Tokyo': 540, 'Asia/Seoul': 540, 'Australia/Perth': 480,
      'Australia/Adelaide': 570, 'Australia/Sydney': 600, 'Australia/Melbourne': 600,
      'Pacific/Auckland': 780, 'Pacific/Fiji': 780, 'Africa/Cairo': 120,
      'Africa/Johannesburg': 120,
    };
    return offsets[zone] || 0;
  };

  const formatTime = (date: Date | null, zone: string): string => {
    if (!date) return '--';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: zone,
    }).format(date);
  };

  const swap = () => {
    setFromZone(toZone);
    setToZone(fromZone);
  };

  return (
    <ToolLayout tool={tool} resultVisible={false}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          {/* Date & Time */}
          <div>
            <label className="text-sm font-medium">Date & Time</label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          {/* From / To */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="text-sm font-medium">From Timezone</label>
              <Select value={fromZone} onValueChange={setFromZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIMEZONES.map(z => <SelectItem key={z} value={z}>{z.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={swap} className="mb-0.5">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div>
              <label className="text-sm font-medium">To Timezone</label>
              <Select value={toZone} onValueChange={setToZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIMEZONES.map(z => <SelectItem key={z} value={z}>{z.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result */}
          {convertedTime && (
            <div className="text-center py-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Converted Time</p>
              <p className="text-2xl font-bold mt-1">{formatTime(convertedTime, toZone)}</p>
            </div>
          )}
        </div>

        {/* Time difference */}
        {convertedTime && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-medium text-sm mb-3">Time Difference</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{fromZone.replace(/_/g, ' ')}</p>
                <p className="font-medium">{formatTime(new Date(dateTime), fromZone)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{toZone.replace(/_/g, ' ')}</p>
                <p className="font-medium">{formatTime(convertedTime, toZone)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
