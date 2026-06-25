import { useState, useMemo } from 'react';
import { BookOpen, Timer, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const PASSAGE = `The human brain is an extraordinary organ, capable of processing vast amounts of information every second. Reading is one of the most complex cognitive tasks we perform, involving multiple areas of the brain working in harmony. When we read, our eyes make rapid movements called saccades, pausing briefly to absorb groups of words. The average adult reads at about 200-300 words per minute, but with practice, this speed can increase significantly. Speed reading techniques focus on reducing subvocalization and expanding the number of words processed in each fixation. Comprehension is equally important - reading faster is useless if you don't understand what you've read. The key is finding the right balance between speed and understanding.`;

const QUESTIONS = [
  { question: 'What are the rapid eye movements called when reading?', options: ['Saccades', 'Fixations', 'Subvocalizations', 'Saccades and Fixations'], answer: 0 },
  { question: 'What is the average reading speed for an adult (words per minute)?', options: ['100-200', '200-300', '300-400', '400-500'], answer: 1 },
];

export default function ReadingSpeedTest() {
  const tool = getToolById('reading-speed-test')!;
  const [phase, setPhase] = useState<'start' | 'reading' | 'done'>('start');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const wordCount = useMemo(() => PASSAGE.split(/\s+/).length, []);

  const wpm = useMemo(() => {
    if (phase !== 'done' || !startTime || !endTime) return 0;
    const elapsed = (endTime - startTime) / 1000 / 60;
    if (elapsed <= 0) return 0;
    return Math.round(wordCount / elapsed);
  }, [phase, startTime, endTime, wordCount]);

  const comprehension = useMemo(() => {
    if (answers.length !== QUESTIONS.length) return 0;
    const correct = answers.filter((a, i) => a === QUESTIONS[i].answer).length;
    return Math.round((correct / QUESTIONS.length) * 100);
  }, [answers]);

  const handleStart = () => {
    setStartTime(Date.now());
    setPhase('reading');
    setAnswers([]);
  };

  const handleDone = () => {
    setEndTime(Date.now());
    setPhase('done');
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleReset = () => {
    setPhase('start');
    setStartTime(0);
    setEndTime(0);
    setAnswers([]);
  };

  return (
    <ToolLayout tool={tool} resultVisible={phase === 'done'}>
      <div className="space-y-6">
        <Card className="p-6">
          {phase === 'start' && (
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-blue-500" />
              <p className="text-sm text-muted-foreground">You will read a passage and then answer comprehension questions.</p>
              <Button onClick={handleStart} className="gap-2"><Timer className="w-4 h-4" /> Start Reading</Button>
            </div>
          )}
          {phase === 'reading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1"><Timer className="w-3 h-3" /> Reading in progress...</Badge>
                <Button onClick={handleDone} variant="default">I'm Done Reading</Button>
              </div>
              <p className="leading-relaxed text-foreground/90 select-none">{PASSAGE}</p>
            </div>
          )}
          {phase === 'done' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-blue-600">{wpm}</p>
                  <p className="text-xs text-muted-foreground">Words / min</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold text-emerald-600">{comprehension}%</p>
                  <p className="text-xs text-muted-foreground">Comprehension</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-medium flex items-center gap-2"><Brain className="w-4 h-4" /> Comprehension Check</p>
                {QUESTIONS.map((q, qi) => (
                  <div key={qi} className="space-y-2">
                    <p className="text-sm">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <Button
                          key={oi}
                          variant={answers[qi] === oi ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAnswer(qi, oi)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleReset} variant="outline" className="w-full">Try Again</Button>
            </div>
          )}
        </Card>
      </div>
    </ToolLayout>
  );
}
