import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

function jsonToYaml(json: string): string {
  const obj = JSON.parse(json);
  function stringify(val: unknown, indent: number): string {
    const pad = '  '.repeat(indent);
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'string') {
      if (val.includes(':') || val.includes('#') || val.includes('\n') || val.startsWith('"')) return JSON.stringify(val);
      return val;
    }
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      return val.map(v => `\n${pad}- ${stringify(v, indent + 1).trimStart()}`).join('');
    }
    if (typeof val === 'object') {
      const objVal = val as Record<string, unknown>;
      const keys = Object.keys(objVal);
      if (keys.length === 0) return '{}';
      return keys.map(k => `\n${pad}${k}: ${stringify(objVal[k], indent + 1).trimStart()}`).join('');
    }
    return String(val);
  }
  return stringify(obj, 0).trim();
}

function yamlToJson(yaml: string): string {
  const lines = yaml.split('\n').filter(l => l.trim());
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];
  for (const line of lines) {
    const indent = line.search(/\S/);
    const content = line.trim();
    if (content.startsWith('- ')) {
      const val = content.slice(2).trim();
      const parent = stack[stack.length - 1].obj;
      const lastKey = Object.keys(parent).pop();
      if (lastKey && Array.isArray(parent[lastKey])) {
        (parent[lastKey] as unknown[]).push(isNaN(+val) ? val : +val);
      }
    } else {
      const [key, ...rest] = content.split(':');
      const val = rest.join(':').trim();
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      parent[key.trim()] = isNaN(+val) ? val || {} : +val;
      if (!val) stack.push({ indent, obj: parent[key.trim()] as Record<string, unknown> });
    }
  }
  return JSON.stringify(result, null, 2);
}

export default function JsonToYaml() {
  const tool = getToolById('json-to-yaml')!;
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return mode === 'json-to-yaml' ? jsonToYaml(input) : yamlToJson(input);
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  }, [input, mode]);

  const isError = result.startsWith('Error');

  const copyResult = () => {
    if (!isError) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!' });
    }
  };

  return (
    <ToolLayout tool={tool} resultVisible={result.length > 0}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'json-to-yaml' ? 'default' : 'outline'} onClick={() => setMode('json-to-yaml')}>JSON → YAML</Button>
          <Button size="sm" variant={mode === 'yaml-to-json' ? 'default' : 'outline'} onClick={() => setMode('yaml-to-json')}>YAML → JSON</Button>
        </div>
        <Textarea placeholder={mode === 'json-to-yaml' ? 'Paste JSON...' : 'Paste YAML...'} value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[200px] resize-y font-mono text-sm" />
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={isError ? 'text-destructive font-medium' : 'font-medium'}>{isError ? 'Error' : 'Output'}</span>
              {!isError && <Button size="sm" variant="ghost" onClick={copyResult}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>}
            </div>
            <div className="rounded-xl border bg-card p-4">
              <pre className={`text-sm whitespace-pre-wrap overflow-auto max-h-96 font-mono ${isError ? 'text-destructive' : ''}`}>{result}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
