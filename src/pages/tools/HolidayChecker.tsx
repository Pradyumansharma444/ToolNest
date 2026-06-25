import { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Holiday { name: string; date: string; }

function getHolidays(country: string, year: number): Holiday[] {
  const list: Record<string, [string, string][]> = {
    'USA': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Martin Luther King Jr. Day', getNthWeekday(year, 1, 1, 3)],
      ['President\'s Day', getNthWeekday(year, 2, 1, 3)],
      ['Memorial Day', getLastMonday(year, 5)],
      ['Independence Day', `${year}-07-04`],
      ['Labor Day', getNthWeekday(year, 9, 1, 1)],
      ['Columbus Day', getNthWeekday(year, 10, 1, 2)],
      ['Veterans Day', `${year}-11-11`],
      ['Thanksgiving', getNthWeekday(year, 11, 4, 4)],
      ['Christmas Day', `${year}-12-25`],
    ],
    'UK': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Good Friday', getEaster(year, -2)],
      ['Easter Monday', getEaster(year, 1)],
      ['Early May Bank Holiday', getNthWeekday(year, 5, 1, 1)],
      ['Spring Bank Holiday', getLastMonday(year, 5)],
      ['Summer Bank Holiday', getLastMonday(year, 8)],
      ['Christmas Day', `${year}-12-25`],
      ['Boxing Day', `${year}-12-26`],
    ],
    'Canada': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Family Day', getNthWeekday(year, 2, 1, 3)],
      ['Good Friday', getEaster(year, -2)],
      ['Canada Day', `${year}-07-01`],
      ['Labour Day', getNthWeekday(year, 9, 1, 1)],
      ['Thanksgiving', getNthWeekday(year, 10, 1, 2)],
      ['Remembrance Day', `${year}-11-11`],
      ['Christmas Day', `${year}-12-25`],
      ['Boxing Day', `${year}-12-26`],
    ],
    'India': [
      ['Republic Day', `${year}-01-26`],
      ['Holi', `${year}-03-14`],
      ['Independence Day', `${year}-08-15`],
      ['Gandhi Jayanti', `${year}-10-02`],
      ['Diwali', `${year}-10-31`],
      ['Christmas', `${year}-12-25`],
    ],
    'Australia': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Australia Day', `${year}-01-26`],
      ['Good Friday', getEaster(year, -2)],
      ['Easter Monday', getEaster(year, 1)],
      ['ANZAC Day', `${year}-04-25`],
      ['Christmas Day', `${year}-12-25`],
      ['Boxing Day', `${year}-12-26`],
    ],
    'Germany': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Good Friday', getEaster(year, -2)],
      ['Easter Monday', getEaster(year, 1)],
      ['Labour Day', `${year}-05-01`],
      ['Ascension Day', getEaster(year, 39)],
      ['Whit Monday', getEaster(year, 50)],
      ['German Unity Day', `${year}-10-03`],
      ['Christmas Day', `${year}-12-25`],
      ['Boxing Day', `${year}-12-26`],
    ],
    'Japan': [
      ['New Year\'s Day', `${year}-01-01`],
      ['Coming of Age Day', getNthWeekday(year, 1, 1, 2)],
      ['National Foundation Day', `${year}-02-11`],
      ['Emperor\'s Birthday', `${year}-02-23`],
      ['Vernal Equinox', `${year}-03-20`],
      ['Showa Day', `${year}-04-29`],
      ['Constitution Day', `${year}-05-03`],
      ['Culture Day', `${year}-11-03`],
      ['Labor Thanksgiving Day', `${year}-11-23`],
    ],
  };
  return (list[country] || []).map(([name, date]) => ({ name, date }));
}

function getNthWeekday(year: number, month: number, weekday: number, n: number): string {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month - 1, d).getDay() === weekday) {
      count++;
      if (count === n) return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function getLastMonday(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = daysInMonth; d >= 1; d--) {
    if (new Date(year, month - 1, d).getDay() === 1) return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function getEaster(year: number, offset: number): string {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easterDate = new Date(year, month - 1, day);
  easterDate.setDate(easterDate.getDate() + offset);
  return `${easterDate.getFullYear()}-${String(easterDate.getMonth() + 1).padStart(2, '0')}-${String(easterDate.getDate()).padStart(2, '0')}`;
}

const COUNTRIES = ['USA', 'UK', 'Canada', 'India', 'Australia', 'Germany', 'Japan'];

export default function HolidayChecker() {
  const tool = getToolById('holiday-checker')!;
  const [country, setCountry] = useState('USA');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const holidays = useMemo(() => getHolidays(country, parseInt(year) || 2025), [country, year]);

  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

  return (
    <ToolLayout tool={tool} resultVisible={holidays.length > 0}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Country</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {holidays.length > 0 && (
          <div className="rounded-xl border bg-card divide-y">
            {holidays.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CalendarDays className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(h.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
