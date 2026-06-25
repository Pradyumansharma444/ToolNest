import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

const QUALITIES = [
  { label: 'Max Resolution', suffix: 'maxresdefault.jpg' },
  { label: 'High Quality', suffix: 'hqdefault.jpg' },
  { label: 'Medium Quality', suffix: 'mqdefault.jpg' },
  { label: 'Default', suffix: 'default.jpg' },
];

function extractId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function YoutubeThumbnail() {
  const tool = getToolById('youtube-thumbnail')!;
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const load = () => {
    const id = extractId(url);
    if (id) { setVideoId(id); } else { toast({ title: 'Invalid YouTube URL', variant: 'destructive' }); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={!!videoId}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="https://youtube.com/watch?v=..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          <Button onClick={load}>Load</Button>
        </div>
        {videoId && (
          <div className="grid grid-cols-2 gap-4">
            {QUALITIES.map((q) => (
              <div key={q.suffix} className="rounded-xl border bg-card p-3">
                <img src={`https://img.youtube.com/vi/${videoId}/${q.suffix}`} alt={q.label} className="w-full rounded-lg mb-2" onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }} />
                <p className="text-sm font-medium">{q.label}</p>
                <a href={`https://img.youtube.com/vi/${videoId}/${q.suffix}`} download={`thumbnail-${q.suffix}`} className="text-xs text-primary hover:underline">Download</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
