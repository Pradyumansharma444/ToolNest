import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function MetaTagsPreview() {
  const tool = getToolById('meta-tags-preview')!;
  const { toast } = useToast();
  const [title, setTitle] = useState('My Page Title');
  const [desc, setDesc] = useState('A compelling description for search results and social shares.');
  const [image, setImage] = useState('https://via.placeholder.com/1200x630.png?text=Preview+Image');
  const [copied, setCopied] = useState(false);

  const metaHtml = `<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:image" content="${image}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${image}" />`;

  const copyHtml = () => {
    navigator.clipboard.writeText(metaHtml);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Meta tags copied!' });
  };

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="space-y-2">
          <LabelInput label="Title" value={title} onChange={setTitle} />
          <LabelInput label="Description" value={desc} onChange={setDesc} />
          <LabelInput label="Image URL" value={image} onChange={setImage} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Facebook / LinkedIn</p>
            <div className="border rounded-lg overflow-hidden">
              {image && <img src={image} alt="" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div className="p-2"><p className="text-xs text-muted-foreground uppercase">example.com</p><p className="text-sm font-semibold truncate">{title}</p><p className="text-xs text-muted-foreground line-clamp-2">{desc}</p></div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Twitter / X</p>
            <div className="border rounded-lg overflow-hidden">
              {image && <img src={image} alt="" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div className="p-2"><p className="text-sm font-semibold truncate">{title}</p><p className="text-xs text-muted-foreground line-clamp-2">{desc}</p></div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex justify-between mb-2"><span className="font-medium text-sm">HTML Meta Tags</span><Button size="sm" variant="ghost" onClick={copyHtml}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">{metaHtml}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}

function LabelInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="text-sm text-muted-foreground block mb-1">{label}</label><Input value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
