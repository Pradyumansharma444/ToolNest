import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Keyboard, Award } from 'lucide-react';

const PARAGRAPHS = [
  'Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.',
  'Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence of humans and animals. Leading AI textbooks define the field as the study of intelligent agents, which is any system that perceives its environment.',
  'WebAssembly is a binary instruction format for a stack-based virtual machine. It is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications with near-native performance.',
  'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies. React can be used to develop single-page applications.',
  'The quick brown fox jumps over the lazy dog. This classical English pangram contains every letter of the alphabet. It is commonly used for typing practice, testing keyboards, and displaying font variations because it is short and easy to remember.',
];

export default function TypingSpeedTest() {
  const tool = getToolById('typing-test')!;

  const [duration, setDuration] = useState<30 | 60 | 120>(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [textToType, setTextToType] = useState(() =>
    PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
  );
  const [inputValue, setInputValue] = useState('');
  
  const [gameActive, setGameActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize test
  const startTest = useCallback((selectedDuration = duration) => {
    const randomPara = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    setTextToType(randomPara);
    setInputValue('');
    setDuration(selectedDuration);
    setTimeLeft(selectedDuration);
    setGameActive(false);
    setShowResults(false);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    if (timerRef.current) clearInterval(timerRef.current);
  }, [duration]);

  // Compute live stats
  const computeStats = useCallback((input: string) => {
    if (input.length === 0) return;

    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== textToType[i]) {
        errors++;
      }
    }

    const accuracy = Math.round(((input.length - errors) / input.length) * 100);

    const elapsedMinutes = (duration - timeLeft) / 60 || 0.01;
    // WPM formula: (total characters typed / 5) / elapsed minutes
    const wpm = Math.round((input.length / 5) / elapsedMinutes);

    setStats({ wpm: Math.max(0, wpm), accuracy, errors });
  }, [textToType, duration, timeLeft]);

  // End test
  const endTest = useCallback(() => {
    setGameActive(false);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, timeLeft, endTest]);

  // Handle keys type
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // Start timer on first keystroke
    if (!gameActive && !showResults) {
      setGameActive(true);
    }

    if (val.length <= textToType.length) {
      setInputValue(val);
      computeStats(val);

      if (val.length === textToType.length) {
        endTest();
      }
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6 py-2 select-none">
        
        {/* Top Controls Settings */}
        <div className="flex justify-between items-center flex-wrap gap-4 px-2">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            {([30, 60, 120] as const).map((timeVal) => (
              <Button
                key={timeVal}
                size="sm"
                variant={duration === timeVal ? 'default' : 'ghost'}
                className="rounded-lg"
                onClick={() => startTest(timeVal)}
                disabled={gameActive}
              >
                {timeVal}s
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <span className="font-mono text-lg font-bold bg-muted px-3 py-1.5 rounded-xl">
              Timer: {timeLeft}s
            </span>
            <Button size="sm" variant="outline" onClick={() => startTest(duration)} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Typing Area Box */}
        <div className="rounded-2xl border bg-card p-6 shadow-md space-y-4">
          <div className="text-base sm:text-lg leading-relaxed font-mono relative min-h-[120px] select-none text-muted-foreground break-words">
            {textToType.split('').map((char, index) => {
              let colorClass = 'text-muted-foreground';
              let borderClass = '';

              if (index < inputValue.length) {
                colorClass = inputValue[index] === char ? 'text-emerald-500 font-semibold' : 'text-red-500 bg-red-100 dark:bg-red-950/30 font-semibold';
              } else if (index === inputValue.length) {
                borderClass = 'border-b-2 border-primary animate-pulse';
              }

              return (
                <span key={index} className={`${colorClass} ${borderClass}`}>
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            ref={inputRef}
            className="w-full min-h-[80px] p-3 rounded-xl border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Click here and start typing to begin the test..."
            value={inputValue}
            onChange={handleInputChange}
            disabled={showResults}
          />
        </div>

        {/* Real-time statistics logs */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-muted py-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Speed (WPM)</div>
            <div className="text-2xl font-black text-primary">{stats.wpm}</div>
          </div>
          <div className="bg-muted py-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy</div>
            <div className="text-2xl font-black text-emerald-500">{stats.accuracy}%</div>
          </div>
          <div className="bg-muted py-3 rounded-2xl">
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Errors</div>
            <div className="text-2xl font-black text-destructive">{stats.errors}</div>
          </div>
        </div>

        {/* Results Overlay Dialog */}
        {showResults && (
          <div className="rounded-2xl border bg-card p-6 text-center space-y-4 shadow-xl max-w-sm mx-auto">
            <Award className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-extrabold">Test Complete!</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Gross speed: <span className="font-bold text-foreground">{stats.wpm} WPM</span></p>
              <p>Accuracy rating: <span className="font-bold text-foreground">{stats.accuracy}%</span></p>
              <p>Total keystroke mistakes: <span className="font-bold text-foreground">{stats.errors}</span></p>
            </div>
            <Button size="sm" onClick={() => startTest(duration)} className="w-full gap-2">
              <Keyboard className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
