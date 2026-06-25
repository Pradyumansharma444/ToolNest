import { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle, XCircle, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizMaker() {
  const tool = getToolById('quiz-maker')!;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [mode, setMode] = useState<'edit' | 'take'>('edit');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const addQuestion = () => {
    if (!question.trim() || options.some(o => !o.trim())) return;
    const q: Question = { id: Date.now(), question: question.trim(), options: options.map(o => o.trim()), correctIndex };
    setQuestions(prev => [...prev, q]);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  };

  const removeQuestion = (id: number) => setQuestions(prev => prev.filter(q => q.id !== id));

  const startQuiz = () => {
    setMode('take');
    setCurrentQ(0);
    setAnswers([]);
    setFinished(false);
  };

  const answerQuestion = (idx: number) => {
    const newAnswers = [...answers, idx];
    if (currentQ + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrentQ(prev => prev + 1);
    } else {
      setAnswers(newAnswers);
      setFinished(true);
    }
  };

  const score = finished ? answers.filter((a, i) => a === questions[i].correctIndex).length : 0;

  const downloadPDF = () => {
    const content = questions.map((q, i) => {
      const userAns = finished && answers[i] !== undefined ? `\nYour answer: ${q.options[answers[i]]}` : '';
      const correct = finished ? `\nCorrect: ${q.options[q.correctIndex]}` : '';
      return `Q${i + 1}: ${q.question}${userAns}${correct}`;
    }).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={finished}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        {mode === 'edit' ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Enter your question..." rows={2} />
              </div>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} className="accent-primary" />
                  <Input value={opt} onChange={e => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} placeholder={`Option ${i + 1}`} />
                  <Badge variant={correctIndex === i ? 'default' : 'outline'}>{correctIndex === i ? 'Correct' : ''}</Badge>
                </div>
              ))}
              <Button onClick={addQuestion} disabled={!question.trim() || options.some(o => !o.trim())}><Plus className="w-4 h-4 mr-1" />Add Question</Button>
            </div>

            {questions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div className="flex-1 truncate mr-2">
                      <span className="font-medium">Q{i + 1}:</span> {q.question}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button onClick={startQuiz} className="w-full"><Play className="w-4 h-4 mr-1" />Start Quiz ({questions.length} questions)</Button>
              </div>
            )}
          </>
        ) : finished ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              {score === questions.length ? <CheckCircle className="w-10 h-10 text-green-500" /> : <XCircle className="w-10 h-10 text-destructive" />}
            </div>
            <p className="text-2xl font-bold">{score} / {questions.length}</p>
            <p className="text-muted-foreground">{score === questions.length ? 'Perfect score!' : score >= questions.length / 2 ? 'Good effort!' : 'Keep practicing!'}</p>
            <div className="space-y-2 text-left max-h-64 overflow-y-auto">
              {questions.map((q, i) => (
                <div key={q.id} className={`rounded-lg border p-3 text-sm ${answers[i] === q.correctIndex ? 'border-green-300 bg-green-50 dark:bg-green-950' : 'border-red-300 bg-red-50 dark:bg-red-950'}`}>
                  <p className="font-medium">Q{i + 1}: {q.question}</p>
                  <p className="text-muted-foreground">Your answer: {q.options[answers[i]]}</p>
                  {answers[i] !== q.correctIndex && <p className="text-green-600">Correct answer: {q.options[q.correctIndex]}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => { setMode('edit'); setFinished(false); }}><RotateCcw className="w-4 h-4 mr-1" />Back to Edit</Button>
              <Button onClick={downloadPDF}><Download className="w-4 h-4 mr-1" />Download Results</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentQ + 1} of {questions.length}</Badge>
            </div>
            <div className="rounded-lg border p-6">
              <p className="text-lg font-medium mb-4">{questions[currentQ].question}</p>
              <div className="space-y-2">
                {questions[currentQ].options.map((opt, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start text-left h-auto py-3 px-4" onClick={() => answerQuestion(i)}>
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm mr-3">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
