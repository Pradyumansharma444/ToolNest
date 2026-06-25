import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

export default function WhatsMyIp() {
  const tool = getToolById('whats-my-ip')!;
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState('');
  const [isp, setIsp] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchIp = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIp(data.ip);
      try {
        const geo = await fetch(`https://ip-api.com/json/${data.ip}?fields=country,regionName,city,isp,query`);
        const geoData = await geo.json();
        setIsp(geoData.isp || 'N/A');
        setLocation(`${geoData.city || ''}, ${geoData.regionName || ''}, ${geoData.country || ''}`);
      } catch { /* geo lookup failed */ }
    } catch { setIp('Could not detect IP. Check your network connection.'); }
    setLoading(false);
  };

  useEffect(() => { fetchIp(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <ToolLayout tool={tool} resultVisible={!!ip}>
      <div className="space-y-4">
        <Button onClick={fetchIp} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        {ip && (
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div><span className="text-sm text-muted-foreground">IP Address:</span><p className="text-lg font-mono font-bold">{ip}</p></div>
            {location && <div><span className="text-sm text-muted-foreground">Location:</span><p className="text-sm">{location}</p></div>}
            {isp && <div><span className="text-sm text-muted-foreground">ISP:</span><p className="text-sm">{isp}</p></div>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
