import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

type Matrix = number[][];

export default function MatrixCalculator() {
  const tool = getToolById('matrix-calculator')!;

  const [dim, setDim] = useState<2 | 3>(3);
  const [matrixA, setMatrixA] = useState<Matrix>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [matrixB, setMatrixB] = useState<Matrix>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const [result, setResult] = useState<{
    grid: Matrix;
    det?: number;
    textResult?: string;
  } | null>(null);

  // Resize matrices when dimension changes
  const handleDimChange = (newDim: 2 | 3) => {
    setDim(newDim);
    setMatrixA(Array.from({ length: newDim }, () => Array(newDim).fill(0)));
    setMatrixB(Array.from({ length: newDim }, () => Array(newDim).fill(0)));
    setResult(null);
  };

  // Matrix Cell Input change
  const handleCellChange = (matrix: 'A' | 'B', r: number, c: number, val: string) => {
    const parsed = parseFloat(val) || 0;
    if (matrix === 'A') {
      const next = matrixA.map((row, idx) => (idx === r ? row.map((cell, cIdx) => (cIdx === c ? parsed : cell)) : [...row]));
      setMatrixA(next);
    } else {
      const next = matrixB.map((row, idx) => (idx === r ? row.map((cell, cIdx) => (cIdx === c ? parsed : cell)) : [...row]));
      setMatrixB(next);
    }
  };

  // Operations
  const handleAdd = () => {
    const next = matrixA.map((row, r) => row.map((val, c) => val + matrixB[r][c]));
    setResult({ grid: next });
  };

  const handleSubtract = () => {
    const next = matrixA.map((row, r) => row.map((val, c) => val - matrixB[r][c]));
    setResult({ grid: next });
  };

  const handleMultiply = () => {
    const next = Array.from({ length: dim }, () => Array(dim).fill(0));
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        let sum = 0;
        for (let i = 0; i < dim; i++) {
          sum += matrixA[r][i] * matrixB[i][c];
        }
        next[r][c] = sum;
      }
    }
    setResult({ grid: next });
  };

  const handleTransposeA = () => {
    const next = Array.from({ length: dim }, () => Array(dim).fill(0));
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        next[c][r] = matrixA[r][c];
      }
    }
    setResult({ grid: next });
  };

  // 2x2 and 3x3 Determinants
  const getDeterminant = (m: Matrix): number => {
    if (m.length === 2) {
      return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }
    // 3x3 Sarrus
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  };

  const handleDeterminantA = () => {
    const det = getDeterminant(matrixA);
    setResult({ grid: [], det, textResult: `Determinant of Matrix A = ${det}` });
  };

  return (
    <ToolLayout tool={tool} resultVisible={result !== null}>
      <div className="space-y-6">
        
        {/* Dimensions selector */}
        <div className="flex justify-between items-center gap-4 bg-muted/40 p-3 rounded-2xl border flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Matrix Dimensions</span>
          <div className="flex gap-1 bg-muted p-1 rounded-xl text-xs">
            {([2, 3] as const).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={dim === d ? 'default' : 'ghost'}
                className="rounded-lg px-4"
                onClick={() => handleDimChange(d)}
              >
                {d}x{d}
              </Button>
            ))}
          </div>
        </div>

        {/* Matrix inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matrix A */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Matrix A</h3>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {matrixA.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`A-${r}-${c}`}
                    type="number"
                    className="w-12 h-12 text-center font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    value={val}
                    onChange={(e) => handleCellChange('A', r, c, e.target.value)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Matrix B */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Matrix B</h3>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {matrixB.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`B-${r}-${c}`}
                    type="number"
                    className="w-12 h-12 text-center font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    value={val}
                    onChange={(e) => handleCellChange('B', r, c, e.target.value)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Matrix operations row */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleAdd} size="sm">A + B</Button>
          <Button onClick={handleSubtract} size="sm">A - B</Button>
          <Button onClick={handleMultiply} size="sm">A × B</Button>
          <Button onClick={handleTransposeA} size="sm" variant="outline">Transpose A</Button>
          <Button onClick={handleDeterminantA} size="sm" variant="outline">Det(A)</Button>
        </div>

        {/* Calculation output display */}
        {result && (
          <div className="rounded-2xl border p-6 bg-muted/20 space-y-3 animate-fade-in flex flex-col items-center">
            <div className="text-xs text-muted-foreground uppercase font-bold border-b pb-2 w-full text-center">Result Matrix</div>
            
            {result.grid.length > 0 ? (
              <div
                className="grid gap-2 mt-4"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {result.grid.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`res-${r}-${c}`}
                      className="w-12 h-12 flex items-center justify-center font-bold bg-background border border-primary/20 rounded-lg font-mono text-primary text-sm shadow-sm"
                    >
                      {parseFloat(val.toFixed(2))}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-lg font-bold font-mono py-4">{result.textResult}</div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
