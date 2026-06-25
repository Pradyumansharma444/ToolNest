import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Flame } from 'lucide-react';

interface Country {
  name: string;
  flag: string; // unicode flag emoji
  continent: 'Americas' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
}

const COUNTRIES: Country[] = [
  { name: 'United States', flag: '🇺🇸', continent: 'Americas' },
  { name: 'Canada', flag: '🇨🇦', continent: 'Americas' },
  { name: 'Mexico', flag: '🇲🇽', continent: 'Americas' },
  { name: 'Brazil', flag: '🇧🇷', continent: 'Americas' },
  { name: 'Argentina', flag: '🇦🇷', continent: 'Americas' },
  { name: 'Colombia', flag: '🇨🇴', continent: 'Americas' },
  { name: 'Peru', flag: '🇵🇪', continent: 'Americas' },
  { name: 'Chile', flag: '🇨🇱', continent: 'Americas' },
  { name: 'Venezuela', flag: '🇻🇪', continent: 'Americas' },
  { name: 'Ecuador', flag: '🇪🇨', continent: 'Americas' },

  { name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' },
  { name: 'France', flag: '🇫🇷', continent: 'Europe' },
  { name: 'Germany', flag: '🇩🇪', continent: 'Europe' },
  { name: 'Italy', flag: '🇮🇹', continent: 'Europe' },
  { name: 'Spain', flag: '🇪🇸', continent: 'Europe' },
  { name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' },
  { name: 'Belgium', flag: '🇧🇪', continent: 'Europe' },
  { name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' },
  { name: 'Sweden', flag: '🇸🇪', continent: 'Europe' },
  { name: 'Norway', flag: '🇳🇴', continent: 'Europe' },
  { name: 'Greece', flag: '🇬🇷', continent: 'Europe' },
  { name: 'Portugal', flag: '🇵🇹', continent: 'Europe' },
  { name: 'Poland', flag: '🇵🇱', continent: 'Europe' },

  { name: 'Japan', flag: '🇯🇵', continent: 'Asia' },
  { name: 'China', flag: '🇨🇳', continent: 'Asia' },
  { name: 'India', flag: '🇮🇳', continent: 'Asia' },
  { name: 'South Korea', flag: '🇰🇷', continent: 'Asia' },
  { name: 'Thailand', flag: '🇹🇭', continent: 'Asia' },
  { name: 'Vietnam', flag: '🇻🇳', continent: 'Asia' },
  { name: 'Singapore', flag: '🇸🇬', continent: 'Asia' },
  { name: 'Malaysia', flag: '🇲🇾', continent: 'Asia' },
  { name: 'Indonesia', flag: '🇮🇩', continent: 'Asia' },
  { name: 'Philippines', flag: '🇵🇭', continent: 'Asia' },
  { name: 'Pakistan', flag: '🇵🇰', continent: 'Asia' },
  { name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Asia' },
  { name: 'Turkey', flag: '🇹🇷', continent: 'Asia' },

  { name: 'South Africa', flag: '🇿🇦', continent: 'Africa' },
  { name: 'Egypt', flag: '🇪🇬', continent: 'Africa' },
  { name: 'Nigeria', flag: '🇳🇬', continent: 'Africa' },
  { name: 'Kenya', flag: '🇰🇪', continent: 'Africa' },
  { name: 'Ethiopia', flag: '🇪🇹', continent: 'Africa' },
  { name: 'Morocco', flag: '🇲🇦', continent: 'Africa' },
  { name: 'Ghana', flag: '🇬🇭', continent: 'Africa' },
  { name: 'Uganda', flag: '🇺🇬', continent: 'Africa' },
  { name: 'Algeria', flag: '🇩🇿', continent: 'Africa' },

  { name: 'Australia', flag: '🇦🇺', continent: 'Oceania' },
  { name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania' },
  { name: 'Fiji', flag: '🇫🇯', continent: 'Oceania' },
  { name: 'Samoa', flag: '🇼🇸', continent: 'Oceania' },
];

export default function FlagQuiz() {
  const tool = getToolById('flag-quiz')!;

  const [continent, setContinent] = useState<string>('All');
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    const saved = localStorage.getItem('flag_best_streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Filter list
  const getFilteredCountries = useCallback(() => {
    if (continent === 'All') return COUNTRIES;
    return COUNTRIES.filter((c) => c.continent === continent);
  }, [continent]);

  // Generate a quiz round
  const generateRound = useCallback(() => {
    const list = getFilteredCountries();
    if (list.length < 4) return;

    // Pick target country
    const target = list[Math.floor(Math.random() * list.length)];
    setCurrentCountry(target);

    // Pick wrong options from target list
    const wrongOptions = list
      .filter((c) => c.name !== target.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.name);

    const merged = [target.name, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(merged);
    setFeedback(null);
  }, [getFilteredCountries]);

  useEffect(() => {
    generateRound(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [generateRound]);

  // Handle choice select
  const handleOptionSelect = (opt: string) => {
    if (feedback || !currentCountry) return;

    const isCorrect = opt === currentCountry.name;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 10);
      setFeedback({ isCorrect: true, text: 'Correct!' });

      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        localStorage.setItem('flag_best_streak', nextStreak.toString());
      }
    } else {
      setStreak(0);
      setFeedback({ isCorrect: false, text: `Incorrect! It is ${currentCountry.name}.` });
    }
  };

  const handleNext = () => {
    generateRound();
  };

  const handleReset = () => {
    setScore(0);
    setStreak(0);
    generateRound();
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-md mx-auto py-2 space-y-6 select-none">
        
        {/* Toggle Categories filters */}
        <div className="flex bg-muted p-1 rounded-xl w-full flex-wrap justify-center text-xs">
          {['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'].map((c) => (
            <button
              key={c}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                continent === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                setContinent(c);
                setScore(0);
                setStreak(0);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Score and Streaks row */}
        <div className="flex w-full justify-between items-center gap-4 px-2">
          <div className="bg-muted px-4 py-1.5 rounded-xl font-mono text-xs font-bold text-center">
            Score: <span className="font-extrabold">{score}</span>
          </div>

          {streak > 2 && (
            <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-xl border border-amber-200">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <span>Streak {streak}</span>
            </div>
          )}

          <div className="bg-muted px-4 py-1.5 rounded-xl font-mono text-xs font-bold text-center">
            Best Streak: <span className="font-extrabold">{bestStreak}</span>
          </div>
        </div>

        {/* Display flag symbol */}
        {currentCountry && (
          <div className="rounded-2xl border bg-card p-8 w-full text-center shadow-lg relative overflow-hidden flex items-center justify-center">
            <span className="text-8xl sm:text-9xl drop-shadow-md select-none">{currentCountry.flag}</span>
          </div>
        )}

        {/* Choice buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {options.map((opt) => {
            let btnClass = 'w-full py-4 text-sm font-semibold rounded-xl text-center shadow ';
            if (feedback) {
              if (opt === currentCountry?.name) {
                btnClass += 'bg-emerald-500 text-white';
              } else if (feedback.text.includes(opt)) {
                btnClass += 'bg-red-500 text-white';
              } else {
                btnClass += 'bg-muted opacity-50';
              }
            } else {
              btnClass += 'bg-card border hover:bg-accent hover:text-accent-foreground cursor-pointer';
            }

            return (
              <button
                key={opt}
                onClick={() => handleOptionSelect(opt)}
                disabled={!!feedback}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Next controls */}
        {feedback && (
          <div className="w-full flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset Game
            </Button>
            <Button className="flex-1 font-bold" onClick={handleNext}>
              Next Flag
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
