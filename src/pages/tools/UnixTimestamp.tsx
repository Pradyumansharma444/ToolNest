import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function UnixTimestamp() {
  const tool = getToolById('unix-timestamp')!;
  const { toast } = useToast();
  const [timestamp, setTimestamp] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedDate, setCopiedDate] = useState(false);

  const tsResult = useMemo(() => {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return null;
    const d = new Date(ts * (ts > 1e12 ? 1 : 1000));
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
    };
  }, [timestamp]);

  const dateResult = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return { seconds: Math.floor(d.getTime() / 1000), milliseconds: d.getTime() };
  }, [dateInput]);

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Unix Timestamp → Date</h3>
          <Input type="number" placeholder="Enter Unix timestamp (e.g., 1700000000)" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="font-mono" />
          {tsResult && (
            <div className="mt-3 rounded-xl border bg-card p-4 space-y-2 text-sm">
              {Object.entries(tsResult).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-mono ml-2">{val}</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(val, setCopiedTs)}>{copiedTs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium mb-2">Date → Unix Timestamp</h3>
          <Input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="font-mono" />
          {dateResult && (
            <div className="mt-3 rounded-xl border bg-card p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Seconds:</span>
                <span className="font-mono">{dateResult.seconds}</span>
                <Button size="sm" variant="ghost" onClick={() => copy(String(dateResult.seconds), setCopiedDate)}>{copiedDate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Milliseconds:</span>
                <span className="font-mono">{dateResult.milliseconds}</span>
                <Button size="sm" variant="ghost" onClick={() => copy(String(dateResult.milliseconds), setCopiedDate)}>{copiedDate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
