import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

function parseUA(ua: string) {
  const isChrome = ua.includes('Chrome') && !ua.includes('Edg');
  const isFirefox = ua.includes('Firefox');
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome');
  const isEdge = ua.includes('Edg');
  const isMobile = /Mobi|Android/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const os = /Windows NT (\d+)/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iOS|iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
  const browser = isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown';
  const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  return { os, browser, device, ua };
}

export default function UserAgentParser() {
  const tool = getToolById('user-agent-parser')!;
  const info = parseUA(navigator.userAgent);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Row label="Operating System" value={info.os} />
          <Row label="Browser" value={info.browser} />
          <Row label="Device Type" value={info.device} />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <span className="text-sm text-muted-foreground">Raw User-Agent:</span>
          <p className="text-xs font-mono mt-1 break-all">{info.ua}</p>
        </div>
      </div>
    </ToolLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
