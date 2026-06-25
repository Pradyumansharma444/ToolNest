import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function ScientificCalculator() {
  const tool = getToolById('scientific-calculator')!;

  const [display, setDisplay] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isRad, setIsRad] = useState(true);

  // Evaluate expression securely using standard math evaluations
  const handleEvaluate = () => {
    if (!display.trim()) return;

    try {
      // Replace symbols for evaluation
      let sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Replace functions with Math equivalents
      // sin, cos, tan, log, ln, sqrt
      sanitized = sanitized.replace(/sin\((.*?)\)/g, (_, match) => {
        const val = parseFloat(match);
        const radians = isRad ? val : (val * Math.PI) / 180;
        return `Math.sin(${radians})`;
      });

      sanitized = sanitized.replace(/cos\((.*?)\)/g, (_, match) => {
        const val = parseFloat(match);
        const radians = isRad ? val : (val * Math.PI) / 180;
        return `Math.cos(${radians})`;
      });

      sanitized = sanitized.replace(/tan\((.*?)\)/g, (_, match) => {
        const val = parseFloat(match);
        const radians = isRad ? val : (val * Math.PI) / 180;
        return `Math.tan(${radians})`;
      });

      sanitized = sanitized.replace(/log\((.*?)\)/g, 'Math.log10($1)');
      sanitized = sanitized.replace(/ln\((.*?)\)/g, 'Math.log($1)');
      sanitized = sanitized.replace(/√\((.*?)\)/g, 'Math.sqrt($1)');

      // Simple evaluate call (safe as it contains only digits/operators/Math calls)
      const parsedFn = new Function(`return ${sanitized}`);
      const result = parsedFn();

      if (result === undefined || isNaN(result)) {
        throw new Error('Invalid Math');
      }

      setHistory((prev) => [`${display} = ${result}`, ...prev].slice(0, 10));
      setDisplay(result.toString());
    } catch {
      setDisplay('Error');
    }
  };

  const handleKey = (key: string) => {
    if (display === 'Error') setDisplay('');

    if (key === 'AC') {
      setDisplay('');
    } else if (key === 'DEL') {
      setDisplay((d) => d.slice(0, -1));
    } else if (key === '=') {
      handleEvaluate();
    } else {
      setDisplay((d) => d + key);
    }
  };

  const buttons = [
    ['AC', 'DEL', '(', ')', 'pow'],
    ['sin(', 'cos(', 'tan(', 'log(', 'ln('],
    ['√(', 'π', 'e', '÷', '^'],
    ['7', '8', '9', '×', '-'],
    ['4', '5', '6', '+', '='],
    ['1', '2', '3', '0', '.'],
  ];

  return (
    <ToolLayout tool={tool} resultVisible={history.length > 0}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-2 select-none">
        
        {/* Left Side: Calculator Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border-2 bg-muted/20 p-5 text-right font-mono flex flex-col justify-end min-h-[90px] shadow-inner relative">
            <span className="absolute top-2 left-3 text-[10px] text-muted-foreground font-bold uppercase">
              Mode: {isRad ? 'Radians' : 'Degrees'}
            </span>
            <div className="text-3xl font-extrabold break-all overflow-hidden">{display || '0'}</div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isRad ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setIsRad(true)}
            >
              Radians
            </Button>
            <Button
              size="sm"
              variant={!isRad ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setIsRad(false)}
            >
              Degrees
            </Button>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-5 gap-2">
            {buttons.flat().map((btn) => {
              let variant: 'default' | 'secondary' | 'outline' = 'secondary';
              if (['+', '-', '×', '÷', '='].includes(btn)) variant = 'default';
              if (['AC', 'DEL'].includes(btn)) variant = 'outline';

              return (
                <button
                  key={btn}
                  onClick={() => handleKey(btn)}
                  className={`py-4 text-sm font-bold rounded-xl shadow border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                    variant === 'default'
                      ? 'bg-primary text-white hover:bg-primary/95'
                      : variant === 'outline'
                      ? 'border bg-background hover:bg-accent text-destructive'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                  style={{
                    gridColumn: btn === '=' ? 'span 1' : 'auto',
                  }}
                >
                  {btn === 'sin(' ? 'sin' : btn === 'cos(' ? 'cos' : btn === 'tan(' ? 'tan' : btn === 'log(' ? 'log' : btn === 'ln(' ? 'ln' : btn === '√(' ? '√' : btn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Evaluation history */}
        <div className="md:col-span-1 rounded-xl border bg-card p-4 space-y-3 flex flex-col max-h-[360px]">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-extrabold text-sm uppercase text-muted-foreground">History</h4>
            {history.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setHistory([])}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs max-h-[300px]">
            {history.map((record, index) => (
              <div key={index} className="border-b py-1 text-right">{record}</div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No calculations logged yet.</div>
            )}
          </div>
        </div>

      </div>
    </ToolLayout>
  );
}
