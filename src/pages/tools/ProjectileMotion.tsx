import { useState, useMemo } from 'react';

import { Input } from '@/components/ui/input';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const G = 9.80665;

export default function ProjectileMotion() {
  const tool = getToolById('projectile-motion')!;
  const [velocity, setVelocity] = useState('20');
  const [angle, setAngle] = useState('45');
  const [height, setHeight] = useState('0');

  const results = useMemo(() => {
    const v0 = parseFloat(velocity);
    const theta = (parseFloat(angle) * Math.PI) / 180;
    const h0 = parseFloat(height);
    if (isNaN(v0) || isNaN(theta) || isNaN(h0) || v0 <= 0) return null;

    const v0x = v0 * Math.cos(theta);
    const v0y = v0 * Math.sin(theta);

    const timeOfFlight = (v0y + Math.sqrt(v0y * v0y + 2 * G * h0)) / G;
    const maxHeight = h0 + (v0y * v0y) / (2 * G);
    const range = v0x * timeOfFlight;

    const trajectory: { x: number; y: number }[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = (timeOfFlight * i) / steps;
      const x = v0x * t;
      const y = h0 + v0y * t - 0.5 * G * t * t;
      trajectory.push({ x, y: Math.max(0, y) });
    }

    return { timeOfFlight, maxHeight, range, trajectory, v0x, v0y };
  }, [velocity, angle, height]);

  const svgHeight = 250;
  const svgWidth = 400;

  const pathD = useMemo(() => {
    if (!results || results.trajectory.length === 0) return '';
    const maxX = results.range || 1;
    const maxY = results.maxHeight || 1;
    const padding = 20;
    const w = svgWidth - padding * 2;
    const h = svgHeight - padding * 2;
    return results.trajectory.map((p, i) => {
      const px = padding + (p.x / maxX) * w;
      const py = padding + h - (p.y / maxY) * h;
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(' ');
  }, [results]);

  return (
    <ToolLayout tool={tool} resultVisible={results !== null}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border rounded-xl p-6">
          <div>
            <label className="text-sm font-medium">Initial Velocity (m/s)</label>
            <Input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} placeholder="20" min="0" />
          </div>
          <div>
            <label className="text-sm font-medium">Launch Angle (°)</label>
            <Input type="number" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="45" min="0" max="90" />
          </div>
          <div>
            <label className="text-sm font-medium">Initial Height (m)</label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0" min="0" />
          </div>
        </div>

        {results && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Range</p>
                <p className="text-xl font-bold">{results.range.toFixed(2)} m</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Max Height</p>
                <p className="text-xl font-bold">{results.maxHeight.toFixed(2)} m</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-xs text-muted-foreground">Time of Flight</p>
                <p className="text-xl font-bold">{results.timeOfFlight.toFixed(2)} s</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-64">
                <line x1="20" y1={svgHeight - 20} x2={svgWidth - 20} y2={svgHeight - 20} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                {pathD && <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />}
                {results.trajectory.length > 0 && (
                  <circle cx={20} cy={svgHeight - 20 - (results.maxHeight > 0 ? (results.trajectory[0].y / results.maxHeight) * (svgHeight - 40) : 0)} r="4" fill="currentColor" className="text-primary" />
                )}
              </svg>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
