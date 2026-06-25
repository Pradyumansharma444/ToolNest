import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Heart,
  ChevronDown,
  FileText,
  Image,
  Type,
  Table,
  Calculator,
  Maximize,
  Sparkles,
  Home,
  Wrench,
  Code,
  Video,
  Music,
  Palette,
  Calendar,
  Lock,
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
  Plane,
  FlaskConical,
  Map,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDarkMode } from '@/hooks/useDarkMode';
import { categories, tools, searchTools } from '@/data/tools';
import { cn } from '@/lib/utils';
import type { ToolCategory } from '@/types';

const categoryIconMap: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  spreadsheet: <Table className="w-4 h-4" />,
  calculator: <Calculator className="w-4 h-4" />,
  resize: <Maximize className="w-4 h-4" />,
  enhancer: <Sparkles className="w-4 h-4" />,
  developer: <Code className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  color: <Palette className="w-4 h-4" />,
  datetime: <Calendar className="w-4 h-4" />,
  security: <Lock className="w-4 h-4" />,
  document: <BookOpen className="w-4 h-4" />,
  archive: <FolderArchive className="w-4 h-4" />,
  network: <Globe className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  design: <Paintbrush className="w-4 h-4" />,
  productivity: <Briefcase className="w-4 h-4" />,
  fun: <Dices className="w-4 h-4" />,
  viral: <Rocket className="w-4 h-4" />,
  games: <Gamepad2 className="w-4 h-4" />,
  language: <Languages className="w-4 h-4" />,
  math: <Pi className="w-4 h-4" />,
  health: <HeartPulse className="w-4 h-4" />,
  finance: <IndianRupee className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  household: <Home className="w-4 h-4" />,
  travel: <Plane className="w-4 h-4" />,
  science: <FlaskConical className="w-4 h-4" />,
  geography: <Map className="w-4 h-4" />,
  wellness: <Heart className="w-4 h-4" />,
  planning: <ClipboardList className="w-4 h-4" />,
};

export function Navbar() {
  const { isDark, toggleTheme } = useDarkMode();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof tools>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchTools(searchQuery)); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setSearchResults([]); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToolClick = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setToolsDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/logo.png" alt="ToolNest Logo" className="w-8 h-8 object-contain" />
            <span>ToolNest</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* All Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="gap-1"
              >
                Tools
                <ChevronDown className={cn('w-4 h-4 transition-transform', toolsDropdownOpen && 'rotate-180')} />
              </Button>

              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-[480px] bg-popover border rounded-xl shadow-lg p-4 z-50">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          to={`/${cat.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                          onClick={() => setToolsDropdownOpen(false)}
                        >
                          {categoryIconMap[cat.id]}
                          {cat.name}
                        </Link>
                        <div className="ml-6 mt-0.5">
                          {tools.filter(t => t.category === cat.id).slice(0, 3).map(tool => (
                            <button
                              key={tool.id}
                              onClick={() => handleToolClick(tool.path)}
                              className="block w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                            >
                              {tool.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/favorites">
                <Heart className="w-4 h-4 mr-1" />
                Favorites
              </Link>
            </Button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div ref={searchRef} className="relative mr-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border rounded-lg hover:bg-accent/50 hover:text-foreground transition-all w-44 text-left font-normal"
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Search tools...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-100">
                  <span>⌘</span>K
                </kbd>
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-xl shadow-lg p-2 z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }
                      }}
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      ESC
                    </kbd>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {searchResults.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.path)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="font-medium text-sm">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.description.slice(0, 60)}...</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No tools found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && searchResults.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                {searchResults.slice(0, 5).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.path)}
                    className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-0 text-sm"
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Categories */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/${cat.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  {categoryIconMap[cat.id]}
                  {cat.name}
                </Link>
              ))}
            </div>

            <Link
              to="/favorites"
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent"
              onClick={() => setMenuOpen(false)}
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
