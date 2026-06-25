import { useState, useMemo } from 'react';
import { Award } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const COUNTRIES = [
  'USA', 'Canada', 'UK', 'India', 'Australia', 'South Africa', 'Brazil', 'Japan',
  'China', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam',
  'Philippines', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Nigeria',
  'Kenya', 'Egypt', 'Morocco', 'Saudi Arabia', 'UAE', 'Turkey', 'Russia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Poland', 'Greece', 'Portugal', 'New Zealand', 'Pakistan', 'Bangladesh', 'Sri Lanka',
  'Nepal', 'Switzerland', 'Belgium', 'Austria', 'Ireland', 'Finland',
];

type VisaType = 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'visa-required' | 'eta';

const VISA_DATA: Record<string, Record<string, VisaType>> = {
  'USA': { 'Canada': 'visa-free', 'UK': 'visa-free', 'India': 'visa-required', 'Australia': 'eta', 'Japan': 'visa-free', 'Singapore': 'visa-free', 'Brazil': 'visa-required', 'Mexico': 'visa-free', 'Germany': 'visa-free', 'France': 'visa-free', 'Italy': 'visa-free', 'Spain': 'visa-free', 'China': 'visa-required', 'South Korea': 'visa-free', 'Thailand': 'visa-free' },
  'India': { 'USA': 'visa-required', 'Canada': 'visa-required', 'UK': 'visa-required', 'Australia': 'e-visa', 'Japan': 'e-visa', 'Singapore': 'visa-free', 'Malaysia': 'visa-free', 'Thailand': 'e-visa', 'Indonesia': 'e-visa', 'Nepal': 'visa-free', 'UAE': 'e-visa', 'Germany': 'visa-required', 'France': 'visa-required' },
  'Canada': { 'USA': 'visa-free', 'UK': 'visa-free', 'India': 'visa-required', 'Australia': 'visa-free', 'Japan': 'visa-free', 'Singapore': 'visa-free', 'Brazil': 'visa-free', 'Mexico': 'visa-free', 'Germany': 'visa-free', 'France': 'visa-free', 'Italy': 'visa-free', 'China': 'visa-required', 'South Korea': 'visa-free' },
  'UK': { 'USA': 'visa-free', 'Canada': 'visa-free', 'India': 'visa-required', 'Australia': 'visa-free', 'Japan': 'visa-free', 'Singapore': 'visa-free', 'Brazil': 'visa-free', 'Germany': 'visa-free', 'France': 'visa-free', 'Italy': 'visa-free', 'Spain': 'visa-free', 'China': 'visa-required', 'South Korea': 'visa-free' },
  'Singapore': { 'USA': 'visa-free', 'Canada': 'visa-free', 'UK': 'visa-free', 'India': 'visa-required', 'Australia': 'visa-free', 'Japan': 'visa-free', 'Malaysia': 'visa-free', 'Thailand': 'visa-free', 'Indonesia': 'visa-free', 'China': 'visa-free', 'South Korea': 'visa-free' },
  'Japan': { 'USA': 'visa-free', 'Canada': 'visa-free', 'UK': 'visa-free', 'India': 'visa-required', 'Australia': 'visa-free', 'Singapore': 'visa-free', 'Brazil': 'visa-free', 'China': 'visa-required', 'South Korea': 'visa-free', 'Thailand': 'visa-free' },
};

const VISA_LABELS: Record<VisaType, { label: string; color: string }> = {
  'visa-free': { label: 'Visa Free', color: 'bg-green-500' },
  'visa-on-arrival': { label: 'Visa on Arrival', color: 'bg-blue-500' },
  'e-visa': { label: 'E-Visa', color: 'bg-yellow-500' },
  'visa-required': { label: 'Visa Required', color: 'bg-red-500' },
  'eta': { label: 'ETA', color: 'bg-purple-500' },
};

export default function VisaChecker() {
  const tool = getToolById('visa-checker')!;
  const [passport, setPassport] = useState('USA');
  const [dest, setDest] = useState('India');

  const result = useMemo(() => {
    if (passport === dest) return { type: 'visa-free' as VisaType, note: 'Domestic travel - no visa needed.' };
    const countryData = VISA_DATA[passport];
    if (!countryData) return null;
    const visaType = countryData[dest];
    if (!visaType) return { type: 'visa-required' as VisaType, note: 'No specific data found. Assume visa required.' };
    return { type: visaType, note: '' };
  }, [passport, dest]);

  return (
    <ToolLayout tool={tool} resultVisible={!!result}>
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Passport Country</label>
              <Select value={passport} onValueChange={setPassport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Destination</label>
              <Select value={dest} onValueChange={setDest}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {result && (
            <div className="text-center py-6 rounded-lg bg-muted/50 space-y-3">
              <Award className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{passport} passport → {dest}</p>
              <Badge className={`text-white text-sm px-4 py-1 ${VISA_LABELS[result.type].color}`}>
                {VISA_LABELS[result.type].label}
              </Badge>
              {result.note && <p className="text-xs text-muted-foreground">{result.note}</p>}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
