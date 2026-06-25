import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw, HelpCircle, Award } from 'lucide-react';

interface Question {
  q: string;
  options: string[];
  answer: string;
  category: string;
}

const TRIVIA_BANK: Question[] = [
  {
    q: 'What is the chemical symbol for gold?',
    options: ['Au', 'Ag', 'Fe', 'Gd'],
    answer: 'Au',
    category: 'Science',
  },
  {
    q: 'Which planet in our solar system is known for its prominent rings?',
    options: ['Saturn', 'Jupiter', 'Uranus', 'Mars'],
    answer: 'Saturn',
    category: 'Science',
  },
  {
    q: 'Who painted the Mona Lisa?',
    options: ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo'],
    answer: 'Leonardo da Vinci',
    category: 'Pop Culture',
  },
  {
    q: 'Which country hosted the 2016 Summer Olympics?',
    options: ['Brazil', 'United Kingdom', 'China', 'Japan'],
    answer: 'Brazil',
    category: 'Sports',
  },
  {
    q: 'What is the capital of Canada?',
    options: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'],
    answer: 'Ottawa',
    category: 'Geography',
  },
  {
    q: 'Which is the largest ocean on Earth?',
    options: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
    answer: 'Pacific Ocean',
    category: 'Geography',
  },
  {
    q: 'In which year did the Titanic sink?',
    options: ['1912', '1905', '1920', '1898'],
    answer: '1912',
    category: 'History',
  },
  {
    q: 'Who was the first President of the United States?',
    options: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'],
    answer: 'George Washington',
    category: 'History',
  },
  {
    q: 'How many bones are there in an adult human body?',
    options: ['206', '212', '198', '224'],
    answer: '206',
    category: 'Science',
  },
  {
    q: 'Which actor played Jack in the movie Titanic?',
    options: ['Leonardo DiCaprio', 'Brad Pitt', 'Johnny Depp', 'Tom Cruise'],
    answer: 'Leonardo DiCaprio',
    category: 'Pop Culture',
  },
];

export default function TriviaQuiz() {
  const tool = getToolById('trivia')!;

  const [category, setCategory] = useState<string>('All');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const endQuiz = useCallback(() => {
    setIsPlaying(false);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleNextQuestion = () => {
    setSelectedOption(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      startTimer();
    } else {
      endQuiz();
    }
  };

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleNextQuestion();
          return 15;
        }
        return t - 1;
      });
    }, 1000);
  }

  // Initialize Quiz Match
  const startQuiz = useCallback((selectedCat = category) => {
    setCategory(selectedCat);
    const filtered = selectedCat === 'All'
      ? TRIVIA_BANK
      : TRIVIA_BANK.filter((q) => q.category === selectedCat);

    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setTimeLeft(15);
    setIsPlaying(true);
    setShowResults(false);
    startTimer();
  }, [category]);

  const handleOptionSelect = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentIdx];
    if (opt === currentQ.answer) {
      // Bonus points for rapid answers
      setScore((s) => s + 10 + timeLeft);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIdx];

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col items-center max-w-xl mx-auto py-2 space-y-6 select-none">
        
        {/* Set up options */}
        {!isPlaying && !showResults && (
          <div className="rounded-2xl border bg-card p-6 w-full space-y-6 shadow-md text-center">
            <HelpCircle className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <h3 className="text-xl font-bold">General Trivia Quiz</h3>
            
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Choose Category</label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Science', 'History', 'Geography', 'Pop Culture', 'Sports'].map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={() => startQuiz(category)} className="w-full font-bold">
              Start Quiz
            </Button>
          </div>
        )}

        {/* Question Board Panel */}
        {isPlaying && currentQ && (
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-muted-foreground">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="font-mono text-xs font-bold bg-muted px-2.5 py-1 rounded-xl">
                Time Left: {timeLeft}s
              </span>
            </div>

            {/* Prompt text card */}
            <div className="rounded-2xl border bg-card p-8 text-center shadow-md relative overflow-hidden">
              <div className="text-xs font-bold text-primary/70 uppercase mb-2">{currentQ.category}</div>
              <h3 className="text-xl sm:text-2xl font-black">{currentQ.q}</h3>
            </div>

            {/* Answers options buttons grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                let btnClass = 'w-full py-4 text-sm font-semibold rounded-xl text-center shadow ';
                if (selectedOption !== null) {
                  if (opt === currentQ.answer) {
                    btnClass += 'bg-emerald-500 text-white';
                  } else if (selectedOption === opt) {
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
                    disabled={selectedOption !== null}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <Button onClick={handleNextQuestion} className="w-full font-bold">
                {currentIdx + 1 === questions.length ? 'Show Results' : 'Next Question'}
              </Button>
            )}
          </div>
        )}

        {/* Results Screen */}
        {showResults && (
          <div className="rounded-2xl border bg-card p-6 text-center space-y-4 shadow-xl max-w-sm w-full">
            <Award className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-extrabold font-mono">Quiz Finished!</h3>
            <p className="text-sm text-muted-foreground">
              You scored <span className="font-bold text-foreground">{score} points</span>.
            </p>
            <Button onClick={() => startQuiz(category)} className="w-full gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
