import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { tools, categories } from '@/data/tools';
import type { ToolCategory } from '@/types';
import { IconRenderer } from '@/components/tools/IconRenderer';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    document.title = 'Search Tools | ToolNest';
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const q = query.toLowerCase().trim();
    const matchesQuery = !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some(k => k.includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Tools</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search for tools..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredTools.length === 0 && (query || selectedCategory !== 'all') && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tools found matching your criteria.</p>
          </div>
        )}

        {filteredTools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className="group flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/30 hover:scale-[1.005] transition-all text-left animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <IconRenderer name={tool.icon} className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-primary transition-colors text-base">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{tool.description}</p>
              <div className="flex gap-2 mt-1.5">
                {tool.keywords.slice(0, 3).map(k => (
                  <span key={k} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
