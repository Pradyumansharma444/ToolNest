import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, Flame, Trophy } from 'lucide-react';

type Operation = '+' | '-' | '*' | '/';

export default function MathSpeedChallenge() {
  const tool = getToolById('math-challenge')!;

  const [ops, setOps] = useState<Operation[]>(['+', '-']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ text: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('math_best_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate arithmetic equation
  const generateQuestion = useCallback(() => {
    if (ops.length === 0) return;
    const op = ops[Math.floor(Math.random() * ops.length)];

    let maxNum = 12;
    if (difficulty === 'medium') maxNum = 50;
    if (difficulty === 'hard') maxNum = 150;

    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;

    let text = '';
    let answer = 0;

    switch (op) {
      case '+':
        text = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-': {
        // Avoid negative numbers for easy/medium
        if (difficulty !== 'hard' && num1 < num2) {
          const temp = num1;
          num1 = num2;
          num2 = temp;
        }
        text = `${num1} - ${num2}`;
        answer = num1 - num2;
        break;
      }
      case '*': {
        // Keep multiply numbers slightly smaller
        const multLimit = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 30;
        num1 = Math.floor(Math.random() * multLimit) + 2;
        num2 = Math.floor(Math.random() * multLimit) + 2;
        text = `${num1} × ${num2}`;
        answer = num1 * num2;
        break;
      }
      case '/': {
        // Guarantee clean integer division
        const divLimit = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20;
        num2 = Math.floor(Math.random() * divLimit) + 2;
        answer = Math.floor(Math.random() * divLimit) + 1;
        num1 = num2 * answer;
        text = `${num1} ÷ ${num2}`;
        break;
      }
      default:
        break;
    }

    setQuestion({ text, answer });
  }, [ops, difficulty]);

  // Start game challenge
  const startGame = () => {
    if (ops.length === 0) return;
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setUserAnswer('');
    setShowResults(false);
    setIsPlaying(true);
    generateQuestion();
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft, endGame]);

  // Handle Answer Submit
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;

    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed)) return;

    if (parsed === question.answer) {
      const bonusTime = 2; // add 2 bonus seconds
      setTimeLeft((t) => Math.min(60, t + bonusTime));
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Streak score scaling
      const points = 10 + Math.floor(newStreak / 5) * 5;
      const nextScore = score + points;
      setScore(nextScore);

      if (nextScore > bestScore) {
        setBestScore(nextScore);
        localStorage.setItem('math_best_score', nextScore.toString());
      }

      setUserAnswer('');
      generateQuestion();
    } else {
      // Mistake resets streak
      setStreak(0);
      setUserAnswer('');
      // Deduct time for mistake
      setTimeLeft((t) => Math.max(0, t - 3));
    }
  };

  // Toggle math operations choice
  const toggleOp = (op: Operation) => {
    if (ops.includes(op)) {
      if (ops.length > 1) {
        setOps((prev) => prev.filter((item) => item !== op));
      }
    } else {
      setOps((prev) => [...prev, op]);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto space-y-6 py-2 select-none flex flex-col items-center">
        
        {/* Settings Bar */}
        {!isPlaying && (
          <div className="rounded-2xl border bg-card p-6 w-full space-y-6 shadow-md">
            <h3 className="text-lg font-bold">Challenge Configurations</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Choose Operations</label>
              <div className="flex gap-2">
                {(['+', '-', '*', '/'] as const).map((op) => (
                  <Button
                    key={op}
                    variant={ops.includes(op) ? 'default' : 'outline'}
                    className="flex-1 font-bold text-lg"
                    onClick={() => toggleOp(op)}
                  >
                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty Level</label>
              <div className="flex gap-2 bg-muted p-1 rounded-xl">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? 'default' : 'ghost'}
                    className="flex-1 capitalize rounded-lg"
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={startGame} className="w-full font-bold">
              Start Challenge
            </Button>
          </div>
        )}

        {/* Active game area */}
        {isPlaying && (
          <div className="w-full flex flex-col items-center space-y-6">
            
            {/* Timer and score row */}
            <div className="flex w-full justify-between items-center gap-4 px-2">
              <div className="bg-muted px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Time Left</div>
                <div className="text-2xl font-black text-primary">{timeLeft}s</div>
              </div>

              {streak > 2 && (
                <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span>Combo {streak}</span>
                </div>
              )}

              <div className="bg-muted px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Score</div>
                <div className="text-2xl font-black text-emerald-500">{score}</div>
              </div>
            </div>

            {/* Arithmetic Equation Panel */}
            <div className="rounded-2xl border-2 bg-card p-10 w-full text-center shadow-lg relative overflow-hidden">
              <div className="text-5xl font-black font-mono tracking-widest">{question.text}</div>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleAnswerSubmit} className="w-full max-w-sm flex gap-3">
              <Input
                type="number"
                placeholder="Type your answer..."
                className="text-center font-bold font-mono text-xl py-6 rounded-xl"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
              />
              <Button type="submit" size="lg" className="rounded-xl px-6 font-bold">
                Submit
              </Button>
            </form>
          </div>
        )}

        {/* Results Screen */}
        {showResults && (
          <div className="rounded-2xl border bg-card p-6 text-center space-y-4 shadow-xl max-w-sm w-full">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-extrabold">Challenge Over!</h3>
            <p className="text-sm text-muted-foreground">
              You scored <span className="font-bold text-foreground">{score} points</span>.
            </p>
            {score >= bestScore && score > 0 && (
              <div className="text-xs text-amber-500 font-bold">New High Score!</div>
            )}
            <div className="text-xs text-muted-foreground">High Score: {bestScore}</div>
            <Button onClick={startGame} className="w-full gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
