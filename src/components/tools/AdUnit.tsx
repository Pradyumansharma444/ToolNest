import { useEffect } from 'react';

interface AdUnitProps {
  className?: string;
}

export function AdUnit({ className = '' }: AdUnitProps) {
  useEffect(() => {
    try {
      if ((window as unknown as Record<string, unknown>).adsbygoogle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle.push({});
      }
    } catch {
      // AdSense not loaded - silently ignore
    }
  }, []);

  return (
    <div className={`my-6 ${className}`}>
      <div className="text-xs text-muted-foreground text-center mb-2">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
