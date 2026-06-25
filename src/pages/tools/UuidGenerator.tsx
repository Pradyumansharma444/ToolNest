import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function uuidv7(): string {
  const now = Date.now();
  const hex = now.toString(16).padStart(12, '0');
  const rest = 'xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${rest.slice(1, 4)}-${(Math.floor(Math.random() * 4) + 8).toString(16)}${rest.slice(4, 7)}-${rest.slice(7)}`;
}

export default function UuidGenerator() {
  const tool = getToolById('uuid-generator')!;
  const { toast } = useToast();
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const fn = version === 'v4' ? uuidv4 : uuidv7;
    const uuids = Array.from({ length: count }, () => {
      const id = fn();
      return uppercase ? id.toUpperCase() : id;
    });
    return uuids.join('\n');
  };

  const [output, setOutput] = useState(generate);

  const regenerate = () => setOutput(generate());

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant={version === 'v4' ? 'default' : 'outline'} onClick={() => { setVersion('v4'); setTimeout(regenerate, 0); }}>UUID v4</Button>
          <Button size="sm" variant={version === 'v7' ? 'default' : 'outline'} onClick={() => { setVersion('v7'); setTimeout(regenerate, 0); }}>UUID v7</Button>
          <Button size="sm" variant="outline" onClick={() => { setUppercase(!uppercase); setTimeout(regenerate, 0); }}>
            {uppercase ? 'UPPERCASE' : 'lowercase'}
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Count:</span>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.min(100, Math.max(1, +e.target.value)))}
              className="w-16 h-8 rounded-md border bg-background px-2 text-sm" />
          </div>
          <Button size="sm" variant="outline" onClick={regenerate}><RefreshCw className="w-4 h-4 mr-1" />Generate</Button>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex justify-end mb-2">
            <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
          </div>
          <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
