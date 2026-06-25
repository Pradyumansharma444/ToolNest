import { useState, useMemo } from 'react';
import { Dog, Cat, Rabbit, Bird, HelpCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PetType = 'dog' | 'cat' | 'rabbit' | 'hamster' | 'bird' | 'guinea-pig';
type DogSize = 'small' | 'medium' | 'large';

const PET_TYPES: { value: PetType; label: string; icon: typeof Dog }[] = [
  { value: 'dog', label: 'Dog', icon: Dog },
  { value: 'cat', label: 'Cat', icon: Cat },
  { value: 'rabbit', label: 'Rabbit', icon: Rabbit },
  { value: 'hamster', label: 'Hamster', icon: Bird },
  { value: 'bird', label: 'Bird', icon: Bird },
  { value: 'guinea-pig', label: 'Guinea Pig', icon: Bird },
];

const DOG_SIZES: { value: DogSize; label: string; factor: number }[] = [
  { value: 'small', label: 'Small (< 20 lbs)', factor: 1 },
  { value: 'medium', label: 'Medium (20-50 lbs)', factor: 2 },
  { value: 'large', label: 'Large (> 50 lbs)', factor: 3 },
];

function petAgeToHumanYears(type: PetType, age: number, dogSize?: DogSize): number {
  if (type === 'dog') {
    const factor = dogSize === 'small' ? 0 : dogSize === 'large' ? 2 : 1;
    if (age <= 1) return 15;
    if (age <= 2) return 24;
    return 24 + (age - 2) * (4 + factor);
  }
  if (type === 'cat') {
    if (age <= 1) return 15;
    if (age <= 2) return 24;
    return 24 + (age - 2) * 4;
  }
  if (type === 'rabbit') {
    return age * 8;
  }
  if (type === 'hamster') {
    return age * 25;
  }
  if (type === 'bird') {
    if (age <= 1) return 12;
    return 12 + (age - 1) * 4;
  }
  if (type === 'guinea-pig') {
    return age * 12;
  }
  return age * 7;
}

const LIFE_STAGES: { label: string; maxHumanYears: number }[] = [
  { label: 'Baby / Kitten / Puppy', maxHumanYears: 2 },
  { label: 'Adolescent', maxHumanYears: 10 },
  { label: 'Adult', maxHumanYears: 30 },
  { label: 'Mature', maxHumanYears: 50 },
  { label: 'Senior', maxHumanYears: 100 },
];

export default function PetAgeCalculator() {
  const tool = getToolById('pet-age-calculator')!;
  const [petType, setPetType] = useState<PetType>('dog');
  const [dogSize, setDogSize] = useState<DogSize>('medium');
  const [petAge, setPetAge] = useState('5');

  const humanYears = useMemo(() => {
    const age = parseFloat(petAge);
    if (isNaN(age) || age < 0) return 0;
    return petAgeToHumanYears(petType, age, dogSize);
  }, [petType, dogSize, petAge]);

  const stage = useMemo(() => {
    const hy = humanYears;
    for (const s of LIFE_STAGES) {
      if (hy <= s.maxHumanYears) return s.label;
    }
    return 'Senior';
  }, [humanYears]);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Pet Details
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Pet Type</Label>
                <Select value={petType} onValueChange={v => setPetType(v as PetType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {petType === 'dog' && (
                <div>
                  <Label className="text-xs">Breed Size</Label>
                  <Select value={dogSize} onValueChange={v => setDogSize(v as DogSize)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOG_SIZES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-xs">Pet's Age (years)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={petAge}
                  onChange={e => setPetAge(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border bg-indigo-500/5 border-indigo-200/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-2">
              <Dog className="w-5 h-5" />
              Human Years Equivalent
            </div>
            <p className="text-4xl font-extrabold">{Math.round(humanYears)} <span className="text-lg text-muted-foreground font-normal">human years</span></p>
            <div className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-200/20">
              {stage}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h4 className="font-semibold text-sm mb-3">Quick Reference</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Cat (1 yr)</span>
                <p className="font-bold">15 human yrs</p>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Cat (2 yr)</span>
                <p className="font-bold">24 human yrs</p>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Dog (1 yr)</span>
                <p className="font-bold">~15 human yrs</p>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Dog (2 yr)</span>
                <p className="font-bold">~24 human yrs</p>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Rabbit (1 yr)</span>
                <p className="font-bold">~8 human yrs</p>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-muted-foreground">Hamster (1 yr)</span>
                <p className="font-bold">~25 human yrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
