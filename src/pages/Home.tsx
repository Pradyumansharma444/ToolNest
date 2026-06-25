import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FileText,
  Image,
  Type,
  Table,
  Calculator,
  Maximize,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  TrendingUp,
  Code,
  Video,
  Music,
  Palette,
  Calendar,
  BookOpen,
  FolderArchive,
  Globe,
  Share2,
  Paintbrush,
  Briefcase,
  Dices,
  Rocket,
  Gamepad2,
  Languages,
  Pi,
  HeartPulse,
  IndianRupee,
  GraduationCap,
  Home as HomeIcon,
  Plane,
  Atom,
  Map,
  Heart,
  ListTodo,
  Search,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, popularTools, tools, searchTools } from '@/data/tools';
import type { ToolCategory } from '@/types';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useFavorites } from '@/hooks/useFavorites';
import { IconRenderer } from '@/components/tools/IconRenderer';

const categoryIconMap: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6" />,
  image: <Image className="w-6 h-6" />,
  text: <Type className="w-6 h-6" />,
  spreadsheet: <Table className="w-6 h-6" />,
  calculator: <Calculator className="w-6 h-6" />,
  resize: <Maximize className="w-6 h-6" />,
  enhancer: <Sparkles className="w-6 h-6" />,
  developer: <Code className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
  audio: <Music className="w-6 h-6" />,
  color: <Palette className="w-6 h-6" />,
  datetime: <Calendar className="w-6 h-6" />,
  security: <Lock className="w-6 h-6" />,
  document: <BookOpen className="w-6 h-6" />,
  archive: <FolderArchive className="w-6 h-6" />,
  network: <Globe className="w-6 h-6" />,
  social: <Share2 className="w-6 h-6" />,
  design: <Paintbrush className="w-6 h-6" />,
  productivity: <Briefcase className="w-6 h-6" />,
  fun: <Dices className="w-6 h-6" />,
  viral: <Rocket className="w-6 h-6" />,
  games: <Gamepad2 className="w-6 h-6" />,
  language: <Languages className="w-6 h-6" />,
  math: <Pi className="w-6 h-6" />,
  health: <HeartPulse className="w-6 h-6" />,
  finance: <IndianRupee className="w-6 h-6" />,
  education: <GraduationCap className="w-6 h-6" />,
  household: <HomeIcon className="w-6 h-6" />,
  travel: <Plane className="w-6 h-6" />,
  science: <Atom className="w-6 h-6" />,
  geography: <Map className="w-6 h-6" />,
  wellness: <Heart className="w-6 h-6" />,
  planning: <ListTodo className="w-6 h-6" />,
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof tools>([]);
  const navigate = useNavigate();
  const { getMostUsed } = useToolUsage();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchTools(searchQuery)); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setSearchResults([]); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [searchQuery]);

  const favoriteTools = favorites
    .map(f => tools.find(t => t.id === f.id))
    .filter(Boolean);

  const recentTools = getMostUsed(4)
    .map(u => tools.find(t => t.id === u.toolId))
    .filter(Boolean);

  return (
    <div className="space-y-16 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background pt-16 pb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            100% Free & Private
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Every Tool You Need,{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              In Your Browser
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {tools.length}+ free online tools for PDF, images, text, spreadsheets, and more. 
            No uploads, no tracking — everything processes locally on your device.
          </p>

          {/* Homepage Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search across 310+ free tools... (e.g. Merge PDF, resize)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="pl-11 pr-24 h-12 rounded-xl shadow-sm text-base bg-background border-muted hover:border-primary/30 focus-visible:ring-primary"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex pointer-events-none h-6 select-none items-center gap-0.5 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground">
                  <span>⌘</span>K
                </kbd>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="rounded-lg h-8 px-3"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Auto-suggestions list */}
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-xl shadow-xl p-2 z-50 text-left max-h-64 overflow-y-auto">
                {searchResults.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(t.path)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <IconRenderer name={t.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-xl shadow-xl p-4 z-50 text-center text-sm text-muted-foreground">
                No tools found matching "{searchQuery}"
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/pdf">
                Explore Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/favorites">View Favorites</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">{tools.length}+</div>
              <div className="text-sm text-muted-foreground">Free Tools</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Lock className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-sm text-muted-foreground">100% Private</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Sign-ups</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-sm text-muted-foreground">No Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard: Favorites & Recently Used */}
      {(favoriteTools.length > 0 || recentTools.length > 0) && (
        <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Favorites */}
          {favoriteTools.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span>Your Favorites</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteTools.slice(0, 4).map((tool) => (
                  <Link
                    key={tool!.id}
                    to={tool!.path}
                    className="group flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <IconRenderer name={tool!.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{tool!.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool!.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : <div />}

          {/* Recently Used */}
          {recentTools.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Recently Used</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentTools.map((tool) => (
                  <Link
                    key={tool!.id}
                    to={tool!.path}
                    className="group flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <IconRenderer name={tool!.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{tool!.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">Last used recently</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : <div />}
        </section>
      )}

      {/* Popular Categories */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span className="relative inline-flex">
              <TrendingUp className="w-7 h-7 text-orange-500 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            </span>
            Popular Tools
          </h2>
          <Link to="/tools" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTools.map((tool, index) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start gap-3 relative">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <IconRenderer name={tool.icon} className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded-full animate-pulse">
                      🔥 HOT
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Tool Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catTools = tools.filter(t => t.category === cat.id);
            return (
              <Link
                key={cat.id}
                to={`/${cat.id}`}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center flex-shrink-0`}>
                    {categoryIconMap[cat.id]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                    <p className="text-xs text-muted-foreground">{catTools.length} tools</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Privacy CTA */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 text-center">
          <Shield className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Your Privacy is Our Priority</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Unlike other online tools, we never upload your files to a server. 
            All processing happens directly in your browser using WebAssembly and client-side technologies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>No file uploads</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>No tracking cookies</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Instant processing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
