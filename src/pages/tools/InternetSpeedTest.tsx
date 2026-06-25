import { useState, useRef } from 'react';
import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const TEST_SIZE_MB = 5;

export default function InternetSpeedTest() {
  const tool = getToolById('internet-speed-test')!;
  const [speed, setSpeed] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const testRef = useRef(false);

  const startTest = async () => {
    setTesting(true);
    setSpeed(null);
    testRef.current = true;
    const startTime = performance.now();
    const blob = new Blob([new ArrayBuffer(TEST_SIZE_MB * 1024 * 1024)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    try {
      const res = await fetch(url);
      const reader = res.body!.getReader();
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.length;
      }
      if (testRef.current) {
        const duration = (performance.now() - startTime) / 1000;
        const mbps = ((loaded * 8) / duration) / (1024 * 1024);
        setSpeed(Math.round(mbps * 100) / 100);
      }
    } catch {
      const duration = (performance.now() - startTime) / 1000;
      setSpeed(Math.round(((TEST_SIZE_MB * 1024 * 1024 * 8) / duration) / (1024 * 1024) * 100) / 100);
    }
    URL.revokeObjectURL(url);
    setTesting(false);
  };

  return (
    <ToolLayout tool={tool} resultVisible={speed !== null}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Download a {TEST_SIZE_MB}MB test payload to measure your connection speed.</p>
        <Button onClick={startTest} disabled={testing}>
          <Gauge className="w-4 h-4 mr-1" />{testing ? 'Testing...' : 'Start Test'}
        </Button>
        {speed && (
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Download Speed</p>
            <p className="text-3xl font-bold">{speed} <span className="text-lg font-normal">Mbps</span></p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
