import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Heart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/tools', label: 'Tools', icon: Wrench },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t supports-[backdrop-filter]:bg-background/60 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = path === tab.path || (tab.path !== '/' && path.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
