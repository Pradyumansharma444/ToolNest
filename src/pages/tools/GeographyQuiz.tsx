import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { Flame } from 'lucide-react';

interface GeoQuestion {
  country: string;
  capital: string;
  continent: string;
  svgPath: string; // Simplified outline paths for map quiz
  viewBox: string;
}

const QUESTIONS: GeoQuestion[] = [
  {
    country: 'United States',
    capital: 'Washington, D.C.',
    continent: 'North America',
    svgPath: 'M 10 30 L 90 30 L 90 70 L 10 70 Z M 15 35 L 35 35 L 35 45 L 15 45 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'India',
    capital: 'New Delhi',
    continent: 'Asia',
    svgPath: 'M 50 10 L 65 35 L 80 50 L 55 60 L 50 90 L 45 60 L 20 50 L 35 35 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'Australia',
    capital: 'Canberra',
    continent: 'Oceania',
    svgPath: 'M 20 30 L 40 20 L 70 30 L 80 60 L 60 80 L 30 75 L 15 55 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'Brazil',
    capital: 'Brasilia',
    continent: 'South America',
    svgPath: 'M 40 10 L 80 30 L 75 70 L 50 90 L 20 60 L 25 30 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'South Africa',
    capital: 'Pretoria',
    continent: 'Africa',
    svgPath: 'M 20 20 L 80 20 L 70 70 L 50 85 L 30 70 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'Japan',
    capital: 'Tokyo',
    continent: 'Asia',
    svgPath: 'M 20 80 Q 40 50 80 20 M 25 85 L 30 80 M 70 30 L 75 25',
    viewBox: '0 0 100 100',
  },
  {
    country: 'France',
    capital: 'Paris',
    continent: 'Europe',
    svgPath: 'M 50 10 L 80 30 L 75 75 L 50 90 L 25 75 L 20 30 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'Egypt',
    capital: 'Cairo',
    continent: 'Africa',
    svgPath: 'M 10 10 L 90 10 L 90 90 L 10 90 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'Italy',
    capital: 'Rome',
    continent: 'Europe',
    svgPath: 'M 20 10 L 40 10 L 50 40 L 75 70 L 70 85 L 55 75 L 40 45 Z',
    viewBox: '0 0 100 100',
  },
  {
    country: 'United Kingdom',
    capital: 'London',
    continent: 'Europe',
    svgPath: 'M 30 90 L 40 60 L 55 35 L 50 15 L 40 30 L 25 70 Z',
    viewBox: '0 0 100 100',
  },
];

export default function GeographyQuiz() {
  const tool = getToolById('geography-quiz')!;

  const [mode, setMode] = useState<'map' | 'capital'>('map');
  const [currentQ, setCurrentQ] = useState<GeoQuestion | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    const saved = localStorage.getItem('geo_best_streak');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Generate a quiz question round
  const generateQuestion = useCallback(() => {
    if (QUESTIONS.length === 0) return;
    const target = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQ(target);

    // Filter incorrect options
    const wrong = QUESTIONS.filter((q) => q.country !== target.country);
    
    let choices: string[] = [];
    if (mode === 'map') {
      const wrongNames = wrong.sort(() => Math.random() - 0.5).slice(0, 3).map((q) => q.country);
      choices = [target.country, ...wrongNames].sort(() => Math.random() - 0.5);
    } else {
      const wrongCapitals = wrong.sort(() => Math.random() - 0.5).slice(0, 3).map((q) => q.capital);
      choices = [target.capital, ...wrongCapitals].sort(() => Math.random() - 0.5);
    }

    setOptions(choices);
    setFeedback(null);
  }, [mode]);

  useEffect(() => {
    generateQuestion(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [generateQuestion]);

  // Answer handling select
  const handleOptionSelect = (opt: string) => {
    if (feedback || !currentQ) return;

    const isCorrect = mode === 'map' ? opt === currentQ.country : opt === currentQ.capital;
    const answerName = mode === 'map' ? currentQ.country : currentQ.capital;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 10);
      setFeedback({ isCorrect: true, text: 'Correct!' });

      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        localStorage.setItem('geo_best_streak', nextStreak.toString());
      }
    } else {
      setStreak(0);
      setFeedback({ isCorrect: false, text: `Incorrect! It is ${answerName}.` });
    }
  };

  const handleNext = () => {
    generateQuestion();
  };

  const handleReset = () => {
    setScore(0);
    setStreak(0);
    generateQuestion();
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-md mx-auto py-2 space-y-6 select-none">
        
        {/* Toggle Game Modes */}
        <div className="flex bg-muted p-1 rounded-xl w-full justify-center">
          <Button
            size="sm"
            variant={mode === 'map' ? 'default' : 'ghost'}
            className="flex-1 rounded-lg"
            onClick={() => {
              setMode('map');
              setScore(0);
              setStreak(0);
            }}
          >
            Identify Outline Map
          </Button>
          <Button
            size="sm"
            variant={mode === 'capital' ? 'default' : 'ghost'}
            className="flex-1 rounded-lg"
            onClick={() => {
              setMode('capital');
              setScore(0);
              setStreak(0);
            }}
          >
            Capitals Quiz
          </Button>
        </div>

        {/* Score and Streak displays */}
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

        {/* Map visualization for map outline quiz mode */}
        {currentQ && (
          <div className="rounded-2xl border bg-card p-6 w-full text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[180px]">
            {mode === 'map' ? (
              <svg
                viewBox={currentQ.viewBox}
                className="w-32 h-32 text-primary stroke-foreground fill-primary/25"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={currentQ.svgPath} />
              </svg>
            ) : (
              <div className="space-y-2">
                <span className="text-sm font-bold text-muted-foreground uppercase">What is the capital of:</span>
                <h3 className="text-3xl font-extrabold">{currentQ.country}</h3>
              </div>
            )}
          </div>
        )}

        {/* Multiple choice selections */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {options.map((opt) => {
            let btnClass = 'w-full py-4 text-sm font-semibold rounded-xl text-center shadow ';
            const isCorrectAnswer = mode === 'map' ? opt === currentQ?.country : opt === currentQ?.capital;

            if (feedback) {
              if (isCorrectAnswer) {
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

        {/* Next buttons controls */}
        {feedback && (
          <div className="w-full flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset Game
            </Button>
            <Button className="flex-1 font-bold" onClick={handleNext}>
              Next Question
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
