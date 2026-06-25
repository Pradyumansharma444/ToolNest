import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';


export default function QuadraticSolver() {
  const tool = getToolById('quadratic-solver')!;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');

  const [solution, setSolution] = useState<{
    roots: string;
    discriminant: number;
    vertex: { x: number; y: number };
    steps: string[];
  } | null>(null);

  // Render parabola on canvas
  const drawParabola = (
    coeffA: number,
    coeffB: number,
    coeffC: number,
    vX: number,
    vY: number,
    rootsList: number[]
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 20; // 20 pixels equals 1 coordinate unit

    // Draw grid coordinates axis lines
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY); // X axis
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height); // Y axis
    ctx.stroke();

    // Draw parabola curve
    ctx.strokeStyle = '#3b82f6'; // primary blue
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let first = true;
    for (let px = 0; px < width; px++) {
      const xVal = (px - centerX) / scale;
      const yVal = coeffA * xVal * xVal + coeffB * xVal + coeffC;
      const py = centerY - yVal * scale;

      if (py >= 0 && py <= height) {
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Draw vertex point
    ctx.fillStyle = '#f59e0b'; // amber
    ctx.beginPath();
    ctx.arc(centerX + vX * scale, centerY - vY * scale, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw roots markers
    ctx.fillStyle = '#ef4444'; // red roots
    rootsList.forEach((rx) => {
      ctx.beginPath();
      ctx.arc(centerX + rx * scale, centerY, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Math solving trigger
  const handleSolve = useCallback(() => {
    const coeffA = parseFloat(a);
    const coeffB = parseFloat(b);
    const coeffC = parseFloat(c);

    if (isNaN(coeffA) || isNaN(coeffB) || isNaN(coeffC) || coeffA === 0) {
      return;
    }

    const steps: string[] = [];
    const disc = coeffB * coeffB - 4 * coeffA * coeffC;
    steps.push(`Discriminant (D) = b² - 4ac`);
    steps.push(`= (${coeffB})² - 4 × (${coeffA}) × (${coeffC})`);
    steps.push(`= ${coeffB * coeffB} - ${4 * coeffA * coeffC}`);
    steps.push(`= ${disc}`);

    let rootsStr = '';
    let root1X = 0;
    let root2X = 0;

    if (disc > 0) {
      const r1 = (-coeffB + Math.sqrt(disc)) / (2 * coeffA);
      const r2 = (-coeffB - Math.sqrt(disc)) / (2 * coeffA);
      root1X = r1;
      root2X = r2;
      rootsStr = `Two Real Roots: x₁ = ${r1.toFixed(3)}, x₂ = ${r2.toFixed(3)}`;
      steps.push(`D > 0: Real distinct roots.`);
      steps.push(`x₁ = (-b + √D) / 2a = (${-coeffB} + ${Math.sqrt(disc).toFixed(3)}) / ${2 * coeffA} = ${r1.toFixed(3)}`);
      steps.push(`x₂ = (-b - √D) / 2a = (${-coeffB} - ${Math.sqrt(disc).toFixed(3)}) / ${2 * coeffA} = ${r2.toFixed(3)}`);
    } else if (disc === 0) {
      const r = -coeffB / (2 * coeffA);
      root1X = r;
      root2X = r;
      rootsStr = `One Double Real Root: x = ${r.toFixed(3)}`;
      steps.push(`D = 0: Real equal roots.`);
      steps.push(`x = -b / 2a = ${-coeffB} / ${2 * coeffA} = ${r.toFixed(3)}`);
    } else {
      const real = -coeffB / (2 * coeffA);
      const imag = Math.sqrt(-disc) / (2 * coeffA);
      rootsStr = `Complex Roots: x₁,x₂ = ${real.toFixed(3)} ± ${imag.toFixed(3)}i`;
      steps.push(`D < 0: Complex conjugate roots.`);
      steps.push(`x₁,₂ = -b/2a ± i√-D/2a = ${real.toFixed(3)} ± ${imag.toFixed(3)}i`);
    }

    // Vertex coordinates: x = -b/2a, y = f(x)
    const vertexX = -coeffB / (2 * coeffA);
    const vertexY = coeffA * vertexX * vertexX + coeffB * vertexX + coeffC;

    setSolution({
      roots: rootsStr,
      discriminant: disc,
      vertex: { x: vertexX, y: vertexY },
      steps,
    });

    drawParabola(coeffA, coeffB, coeffC, vertexX, vertexY, disc >= 0 ? [root1X, root2X] : []);
  }, [a, b, c]);

  // Auto-solve on mount
  useEffect(() => {
    handleSolve(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [handleSolve]);

  return (
    <ToolLayout tool={tool} resultVisible={solution !== null}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-2 select-none">
        
        {/* Left Side: Equation input coefficients */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Coefficients: ax² + bx + c = 0</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase">a</label>
                <Input type="number" className="font-bold text-center" value={a} onChange={(e) => setA(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase">b</label>
                <Input type="number" className="font-bold text-center" value={b} onChange={(e) => setB(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-semibold uppercase">c</label>
                <Input type="number" className="font-bold text-center" value={c} onChange={(e) => setC(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleSolve} disabled={!a || !b || !c} className="w-full font-bold gap-1.5 rounded-xl">
              Solve Equation
            </Button>
          </div>

          {/* Solution details block */}
          {solution && (
            <div className="rounded-2xl border p-5 bg-muted/20 space-y-3 animate-fade-in text-xs">
              <div className="text-[10px] text-muted-foreground uppercase font-bold border-b pb-2">Equation Output</div>
              <div className="text-sm font-bold text-primary">{solution.roots}</div>
              <div className="font-mono text-muted-foreground">
                Vertex Coordinates: ({solution.vertex.x.toFixed(2)}, {solution.vertex.y.toFixed(2)})
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Graph Canvas & Math Steps */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow bg-white">
            <canvas ref={canvasRef} width={300} height={200} className="block w-full" />
          </div>

          {solution && solution.steps.length > 0 && (
            <div className="rounded-2xl border bg-muted/20 p-5 space-y-2 animate-fade-in font-mono text-xs w-full">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Math Steps</div>
              <div className="space-y-1">
                {solution.steps.map((step, idx) => (
                  <div key={idx} className="border-b border-muted py-0.5">{step}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </ToolLayout>
  );
}
