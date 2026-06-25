import { useState } from 'react';
import { FormInput, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob, uint8ToBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface FormField {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'radio';
  value: string;
  x: number;
  y: number;
}

export default function PdfForms() {
  const tool = getToolById('pdf-forms')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setComplete(false); setFields([]); }
  };

  const addField = () => {
    setFields(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      name: `field_${prev.length + 1}`,
      type: 'text',
      value: '',
      x: 50,
      y: 700 - prev.length * 30,
    }]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const fillForm = async () => {
    if (!file || fields.length === 0) return;
    setProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const page = pages[0];

      if (page) {
        const { height } = page.getSize();
        for (const field of fields) {
          if (field.type === 'text') {
            page.drawText(`${field.name}: ${field.value}`, {
              x: field.x,
              y: height - field.y,
              size: 10,
              font,
              color: rgb(0, 0, 0),
            });
          } else if (field.type === 'checkbox' && field.value === 'true') {
            page.drawText('[X]', {
              x: field.x,
              y: height - field.y,
              size: 10,
              font,
              color: rgb(0, 0, 0),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(uint8ToBlob(pdfBytes, 'application/pdf'), 'filled_' + file.name);
      setComplete(true);
      toast({ title: 'Success!', description: `Form filled with ${fields.length} fields.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to fill form.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={complete}>
      <div className="space-y-6">
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          onFilesSelected={handleFileSelected}
          selectedFile={file}
          onFileRemoved={() => { setFile(null); setFields([]); setComplete(false); }}
          label="Upload PDF Form"
        />

        {file && (
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Form Fields ({fields.length})</span>
              <Button size="sm" variant="outline" onClick={addField}><Plus className="w-4 h-4 mr-1" /> Add Field</Button>
            </div>

            {fields.map(field => (
              <div key={field.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Field name"
                  value={field.name}
                  onChange={e => updateField(field.id, { name: e.target.value })}
                  className="flex-1"
                />
                <select
                  value={field.type}
                  onChange={e => updateField(field.id, { type: e.target.value as 'text' | 'checkbox' | 'radio' })}
                  className="px-2 py-1 rounded border bg-background text-sm"
                >
                  <option value="text">Text</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={field.value === 'true'}
                    onChange={e => updateField(field.id, { value: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4"
                  />
                ) : (
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={e => updateField(field.id, { value: e.target.value })}
                    className="flex-1"
                  />
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeField(field.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button onClick={fillForm} disabled={processing || fields.length === 0} size="lg" className="w-full">
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Filling...</> : <><FormInput className="w-4 h-4 mr-2" /> Fill & Download</>}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
