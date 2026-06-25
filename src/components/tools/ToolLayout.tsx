import { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowLeft, Clock, Maximize2, Minimize2, Share2, Check, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PrivacyBadge } from './PrivacyBadge';
import { AdUnit } from './AdUnit';
import type { Tool } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { categories, tools } from '@/data/tools';
import { IconRenderer } from './IconRenderer';

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
  resultVisible?: boolean;
  showAd?: boolean;
  className?: string;
}

const ACCENTS = [
  { id: 'default', name: 'Default', class: 'bg-zinc-800 dark:bg-zinc-200' },
  { id: 'violet', name: 'Violet', class: 'bg-violet-600' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', class: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', class: 'bg-rose-500' },
];

export function ToolLayout({ tool, children, resultVisible = false, showAd = true, className }: ToolLayoutProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { usage, recordUsage, getUsageCount } = useToolUsage();
  const { toast } = useToast();

  const fav = isFavorite(tool.id);
  const usageCount = getUsageCount(tool.id);

  // Load Accent Theme state
  const [accent, setAccent] = useState<string>(() => {
    if (typeof window === 'undefined') return 'default';
    return localStorage.getItem(`toolnest-accent-${tool.id}`) || 'default';
  });

  // Focus Mode state
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Feedback/rating state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`toolnest-feedback-${tool.id}`) === 'true';
  });

  // Find category and related tools
  const category = categories.find(c => c.id === tool.category);
  const relatedTools = tools
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  // Extract usage metadata
  const currentUsage = usage.find(u => u.toolId === tool.id);
  const lastUsedDate = currentUsage ? new Date(currentUsage.lastUsed).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : null;

  // Handle setting Accent Theme attribute
  useEffect(() => {
    const root = window.document.documentElement;
    if (accent && accent !== 'default') {
      root.setAttribute('data-theme-accent', accent);
      localStorage.setItem(`toolnest-accent-${tool.id}`, accent);
    } else {
      root.removeAttribute('data-theme-accent');
      localStorage.removeItem(`toolnest-accent-${tool.id}`);
    }
  }, [accent, tool.id]);

  // Handle Focus Mode layout modifications
  useEffect(() => {
    const root = window.document.documentElement;
    if (isFocusMode) {
      root.classList.add('toolnest-focus-mode');
    } else {
      root.classList.remove('toolnest-focus-mode');
    }
    return () => {
      root.classList.remove('toolnest-focus-mode');
    };
  }, [isFocusMode]);

  // Record usage once on mount
  useEffect(() => {
    document.title = tool.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', tool.metaDescription);
    }
    recordUsage(tool.id);
    (window as Window & { __currentTool?: typeof tool }).__currentTool = tool; // Store current tool globally
  }, [tool, recordUsage]);

  // Share Tool functionality
  const handleShare = useCallback(() => {
    const shareData = {
      title: tool.name,
      text: tool.description,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied!',
        description: 'The direct link to this tool has been copied to your clipboard.',
      });
    }
  }, [tool, toast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + F -> Toggle Focus Mode
      if (e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
      // Escape -> Exit Focus Mode
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        setIsFocusMode(false);
      }
      // Shift + S -> Share Tool
      if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleShare();
      }
      // Shift + A -> Cycle accent themes
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAccent(prev => {
          const currentIndex = ACCENTS.findIndex(acc => acc.id === prev);
          const nextIndex = (currentIndex + 1) % ACCENTS.length;
          return ACCENTS[nextIndex].id;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, tool.id, handleShare]);

  // Clear usage statistics
  const handleResetStats = () => {
    try {
      const stored = localStorage.getItem('toolnest-usage');
      if (stored) {
        const usageData = JSON.parse(stored);
        const filtered = usageData.filter((u: { toolId: string }) => u.toolId !== tool.id);
        localStorage.setItem('toolnest-usage', JSON.stringify(filtered));
        toast({
          title: 'Usage Stats Cleared',
          description: 'Statistics for this tool have been reset.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      console.error('Failed to reset usage stats', err);
    }
  };

  // Submit Feedback rating
  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedbackSubmitted(true);
    localStorage.setItem(`toolnest-feedback-${tool.id}`, 'true');
    toast({
      title: type === 'helpful' ? 'Thank You!' : 'Feedback Received',
      description: type === 'helpful' 
        ? 'We are thrilled that this tool was useful to you!' 
        : 'Thank you for your rating. We will use this to improve the tool.',
    });
  };

  return (
    <div className={cn('max-w-5xl mx-auto px-4 py-6 transition-all duration-300', isFocusMode && 'pt-20 max-w-7xl', className)}>
      
      {/* Sticky Focus Mode Toolbar */}
      {isFocusMode && (
        <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur border-b flex items-center justify-between px-6 animate-in slide-in-from-top duration-300 shadow-xs select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <IconRenderer name={tool.icon} className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm tracking-tight">{tool.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted">Focus Mode</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Color Accent Picker */}
            <div className="hidden sm:flex items-center gap-1.5 border rounded-lg p-1 bg-muted/40">
              {ACCENTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccent(acc.id)}
                  className={cn(
                    "w-4 h-4 rounded-full border transition-all cursor-pointer relative",
                    acc.class,
                    accent === acc.id ? "ring-2 ring-primary ring-offset-1 border-foreground scale-110" : "border-muted/30 opacity-70 hover:opacity-100"
                  )}
                  title={`${acc.name} theme`}
                />
              ))}
            </div>

            {/* Actions */}
            <Button variant="ghost" size="icon" onClick={handleShare} className="w-8 h-8 rounded-lg" title="Share Tool (Shift+S)">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(tool.id)}
              className={cn("w-8 h-8 rounded-lg", fav && "text-red-500")}
              title={fav ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={cn("w-4 h-4", fav && "fill-current")} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFocusMode(false)} className="gap-1 h-8 rounded-lg">
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Focus</span>
            </Button>
          </div>
        </div>
      )}

      {/* Navigation & Back Action */}
      {!isFocusMode && (
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm select-none">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1 text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg border-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Button>
          <span className="text-muted-foreground/30 hidden sm:inline">|</span>
          <nav className="flex items-center gap-1.5 text-muted-foreground overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            {category && (
              <>
                <Link to={`/${category.id}`} className="hover:text-foreground transition-colors">
                  {category.name}
                </Link>
                <span className="text-muted-foreground/50">/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate">{tool.name}</span>
          </nav>
        </div>
      )}

      {/* Header */}
      {!isFocusMode && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{tool.name}</h1>
              
              {/* Dynamic Accent selector inline */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/40" title="Select Accent Theme (Shift+A)">
                {ACCENTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccent(acc.id)}
                    className={cn(
                      "w-4 h-4 rounded-full border transition-all cursor-pointer relative",
                      acc.class,
                      accent === acc.id ? "ring-2 ring-primary ring-offset-1 border-foreground" : "border-muted/30 opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm md:text-base leading-normal">{tool.description}</p>
            
            {/* Stats row */}
            {usageCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground select-none">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Used {usageCount} {usageCount === 1 ? 'time' : 'times'}</span>
                </div>
                {lastUsedDate && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <span>Last used: {lastUsedDate}</span>
                  </>
                )}
                <span className="text-muted-foreground/30">•</span>
                <button
                  onClick={handleResetStats}
                  className="hover:underline text-destructive font-medium flex items-center gap-0.5"
                  title="Clear Usage History"
                >
                  <Trash2 className="w-3 h-3" />
                  Reset Stats
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0 select-none">
            {/* Share Tool */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              title="Share Tool"
              aria-label="Share tool link"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            {/* Favorite Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleFavorite(tool.id)}
              className={cn(
                fav && 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40'
              )}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={cn('w-5 h-5', fav && 'fill-current')} />
            </Button>

            {/* Focus Mode Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFocusMode(true)}
              title="Toggle Focus Mode (Shift+F)"
              aria-label="Enter focus mode"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Privacy Badge */}
      {!isFocusMode && (
        <div className="mb-6 select-none">
          <PrivacyBadge />
        </div>
      )}

      {/* Tool Content Container */}
      <div className={cn("space-y-6", isFocusMode && "min-h-[calc(100vh-180px)]")}>
        {children}
      </div>

      {/* Feedback Widget */}
      <div className="select-none">
        {!feedbackSubmitted ? (
          <div className="rounded-xl border bg-muted/20 p-5 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm">Was this tool helpful?</h3>
              <p className="text-xs text-muted-foreground">Your feedback helps us continuously improve our tools.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('helpful')}
                className="gap-1.5 h-9 rounded-lg border-muted rating-button-pop"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Yes, helpful</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('not-helpful')}
                className="gap-1.5 h-9 rounded-lg border-muted rating-button-pop"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                <span>No</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-emerald-500/5 dark:bg-emerald-500/10 p-5 mt-10 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 animate-in fade-in duration-300">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Thank you for your rating! Your feedback has been recorded.</span>
          </div>
        )}
      </div>

      {/* Ad after result */}
      {resultVisible && showAd && (
        <div className="select-none">
          <AdUnit />
        </div>
      )}

      {/* Similar Tools */}
      {!isFocusMode && relatedTools.length > 0 && (
        <div className="mt-16 pt-8 border-t select-none">
          <h2 className="text-xl font-bold mb-4">Similar Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((t) => (
              <Link
                key={t.id}
                to={t.path}
                className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <IconRenderer name={t.icon} className="w-4 h-4 text-primary" />
                </div>
                <div className="truncate">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {t.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {t.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
