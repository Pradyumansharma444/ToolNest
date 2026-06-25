import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const MINUTES = ['*', '*/5', '*/10', '*/15', '*/30', '0', '15', '30', '45'];
const HOURS = ['*', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
const DAYS_OF_MONTH = ['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
const MONTHS = ['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const DAYS_OF_WEEK = ['*', '0', '1', '2', '3', '4', '5', '6'];

const MONTH_LABELS: Record<string, string> = { '*': 'every month', '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };
const DOW_LABELS: Record<string, string> = { '*': 'every day', '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' };

function describeCron(minute: string, hour: string, dom: string, month: string, dow: string): string {
  const parts: string[] = [];
  if (dow !== '*') parts.push(DOW_LABELS[dow] || dow);
  if (month !== '*') parts.push(MONTH_LABELS[month] || month);
  if (dom !== '*') parts.push(`day ${dom}`);
  if (hour !== '*' && minute !== '*') parts.push(`at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
  else if (hour !== '*') parts.push(`at hour ${hour}`);
  else if (minute !== '*') parts.push(`at minute ${minute}`);
  if (!parts.length) return 'Every minute of every day';
  return parts.join(', ');
}

export default function CronBuilder() {
  const tool = getToolById('cron-builder')!;
  const { toast } = useToast();
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [copied, setCopied] = useState(false);

  const expression = `${minute} ${hour} ${dom} ${month} ${dow}`;
  const description = useMemo(() => describeCron(minute, hour, dom, month, dow), [minute, hour, dom, month, dow]);

  const copyResult = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Minute', value: minute, set: setMinute, opts: MINUTES },
            { label: 'Hour', value: hour, set: setHour, opts: HOURS },
            { label: 'Day of Month', value: dom, set: setDom, opts: DAYS_OF_MONTH },
            { label: 'Month', value: month, set: setMonth, opts: MONTHS },
            { label: 'Day of Week', value: dow, set: setDow, opts: DAYS_OF_WEEK },
          ].map(f => (
            <div key={f.label} className="space-y-1">
              <label className="text-sm text-muted-foreground">{f.label}</label>
              <Select value={f.value} onValueChange={f.set}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {f.opts.map(o => <SelectItem key={o} value={o}>{o === '*' ? '*' : o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Cron Expression</span>
            <Button size="sm" variant="ghost" onClick={copyResult}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <pre className="text-lg font-mono bg-muted p-3 rounded-lg text-center">{expression}</pre>
        </div>

        <div className="rounded-xl border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-lg font-medium">{description}</p>
        </div>
      </div>
    </ToolLayout>
  );
}
