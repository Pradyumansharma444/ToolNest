import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { RotateCcw } from 'lucide-react';

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  cps: number; // cookies per second
  count: number;
  icon: string;
}

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'cursor', name: 'Auto-Clicker Cursor', cost: 15, cps: 0.1, count: 0, icon: '🖱️' },
  { id: 'grandma', name: 'Grandma Baker', cost: 100, cps: 1.0, count: 0, icon: '👵' },
  { id: 'farm', name: 'Cookie Farm', cost: 1100, cps: 8.0, count: 0, icon: '🌾' },
  { id: 'factory', name: 'Cookie Factory', cost: 12000, cps: 47.0, count: 0, icon: '🏭' },
  { id: 'portal', name: 'Cookie Portal', cost: 130000, cps: 260.0, count: 0, icon: '🌀' },
];

export default function CookieClicker() {
  const tool = getToolById('cookie-clicker')!;

  const [cookies, setCookies] = useState<number>(() => {
    const saved = localStorage.getItem('cookie_clicker_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.cookies || 0;
      } catch (e) {
        console.error(e);
      }
    }
    return 0;
  });
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('cookie_clicker_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.upgrades) return parsed.upgrades;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_UPGRADES;
  });

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const getCps = useCallback(() => {
    return upgrades.reduce((total, up) => total + up.cps * up.count, 0);
  }, [upgrades]);

  // Save state every 10s
  useEffect(() => {
    const saveTimer = setInterval(() => {
      localStorage.setItem('cookie_clicker_save', JSON.stringify({ cookies, upgrades }));
    }, 10000);
    return () => clearInterval(saveTimer);
  }, [cookies, upgrades]);

  // Production tick updates (every 100ms)
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const currentCps = getCps();
      if (currentCps > 0) {
        setCookies((c) => c + currentCps / 10);
      }
    }, 100);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [upgrades]);

  const handleCookieClick = () => {
    setCookies((c) => c + 1);
  };

  // Purchase upgrade handler
  const buyUpgrade = (upgrade: Upgrade) => {
    if (cookies < upgrade.cost) return;

    setCookies((c) => c - upgrade.cost);
    setUpgrades((prev) =>
      prev.map((up) => {
        if (up.id === upgrade.id) {
          return {
            ...up,
            count: up.count + 1,
            cost: Math.round(up.cost * 1.15), // exponential cost scale
          };
        }
        return up;
      })
    );
  };

  const resetGame = () => {
    setCookies(0);
    setUpgrades(INITIAL_UPGRADES);
    localStorage.removeItem('cookie_clicker_save');
  };

  const currentCps = getCps();

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-2 select-none">
        
        {/* Left column: giant clicking cookie */}
        <div className="md:col-span-1 flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <h3 className="text-3xl font-black">{Math.floor(cookies).toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground font-semibold">cookies baked</p>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">per second: {currentCps.toFixed(1)}</div>
          </div>

          <button
            onClick={handleCookieClick}
            className="w-48 h-48 rounded-full bg-amber-600 text-8xl flex items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer select-none hover:rotate-12 duration-200 border-8 border-amber-800"
          >
            🍪
          </button>
        </div>

        {/* Right column: Upgrade Shop list */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-extrabold text-sm uppercase text-muted-foreground">Production Upgrades</h4>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={resetGame}>
              <RotateCcw className="w-3 h-3" /> Reset Progress
            </Button>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
            {upgrades.map((up) => {
              const canAfford = cookies >= up.cost;
              return (
                <div
                  key={up.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    canAfford ? 'bg-card border-primary/20' : 'bg-muted/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{up.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{up.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Produces +{up.cps} CPS (Owned: {up.count})
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={canAfford ? 'default' : 'secondary'}
                    disabled={!canAfford}
                    onClick={() => buyUpgrade(up)}
                    className="font-bold font-mono min-w-[80px]"
                  >
                    {up.cost.toLocaleString()} 🍪
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </ToolLayout>
  );
}
