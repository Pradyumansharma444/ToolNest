import { useState, useMemo } from 'react';
import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function EssayOutline() {
  const tool = getToolById('essay-outline')!;
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [thesis, setThesis] = useState('');
  const [paragraphs, setParagraphs] = useState(3);
  const [type, setType] = useState<'persuasive' | 'expository' | 'narrative'>('persuasive');

  const outline = useMemo(() => {
    if (!topic.trim()) return '';
    const lines: string[] = [];
    lines.push(`Essay Topic: ${topic.trim()}`);
    lines.push('');
    lines.push(`Essay Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (thesis.trim()) {
      lines.push('');
      lines.push('Thesis Statement:');
      lines.push(`  ${thesis.trim()}`);
    }
    lines.push('');
    lines.push('I. Introduction');
    lines.push('   A. Hook / Attention Grabber');
    lines.push('   B. Background Information');
    if (thesis.trim()) lines.push('   C. Thesis Statement');
    lines.push('');

    for (let i = 1; i <= paragraphs; i++) {
      const roman = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i - 1] || `${i + 1}`;
      lines.push(`${roman}. Body Paragraph ${i}`);
      lines.push('   A. Topic Sentence');
      lines.push('   B. Supporting Evidence / Example');
      lines.push('   C. Analysis / Explanation');
      lines.push('   D. Concluding / Transition Sentence');
      lines.push('');
    }

    lines.push(`${String.fromCharCode(65 + paragraphs)}. Conclusion`);
    lines.push('   A. Restate Thesis (in different words)');
    lines.push('   B. Summarize Key Points');
    lines.push('   C. Final Thought / Call to Action');
    lines.push('');

    if (type === 'persuasive') {
      lines.push('Counterargument Notes:');
      lines.push('   - Address potential counterarguments');
      lines.push('   - Rebuttal points');
      lines.push('');
    }

    lines.push('References / Sources:');
    lines.push('   - 1.');
    lines.push('   - 2.');
    lines.push('   - 3.');

    return lines.join('\n');
  }, [topic, thesis, paragraphs, type]);

  const copyOutline = () => {
    navigator.clipboard.writeText(outline);
    toast({ title: 'Outline copied to clipboard!' });
  };

  const downloadOutline = () => {
    const blob = new Blob([outline], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'essay-outline.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!outline}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Essay Topic</label>
            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter your essay topic..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Essay Type</label>
            <select value={type} onChange={e => setType(e.target.value as typeof type)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              <option value="persuasive">Persuasive / Argumentative</option>
              <option value="expository">Expository / Informative</option>
              <option value="narrative">Narrative</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Thesis Statement</label>
          <Textarea value={thesis} onChange={e => setThesis(e.target.value)} placeholder="Enter your thesis statement (optional)..." rows={2} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Body Paragraphs: {paragraphs}</label>
          <input type="range" min={2} max={8} value={paragraphs} onChange={e => setParagraphs(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>2</span><span>8</span></div>
        </div>

        {outline && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyOutline}><Copy className="w-4 h-4 mr-1" />Copy</Button>
              <Button variant="outline" onClick={downloadOutline}><Download className="w-4 h-4 mr-1" />Download</Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">{outline}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
