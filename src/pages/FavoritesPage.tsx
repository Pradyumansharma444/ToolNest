import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Wrench, Trash2, Clock, Shield, Search, FileCode } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useFileHistory } from '@/hooks/useFileHistory';
import { tools } from '@/data/tools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatBytes } from '@/lib/utils';
import { IconRenderer } from '@/components/tools/IconRenderer';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { history, clearHistory, removeHistoryItem } = useFileHistory();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  useEffect(() => {
    document.title = activeTab === 'favorites' 
      ? 'My Favorites | ToolNest' 
      : 'Local History | ToolNest';
  }, [activeTab]);

  const favoriteTools = favorites
    .map(f => tools.find(t => t.id === f.id))
    .filter(Boolean);

  const filteredHistory = history.filter(item => {
    const q = historySearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.toolName && item.toolName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header & Tabs Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your saved tools and view your local processing activity.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorites ({favoriteTools.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            History ({history.length})
          </button>
        </div>
      </div>

      {/* --- FAVORITES TAB --- */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favoriteTools.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-card">
              <Heart className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Heart your favorite tools to access them quickly from your dashboard.
              </p>
              <Button asChild>
                <Link to="/tools">
                  <Wrench className="w-4 h-4 mr-2" />
                  Browse All Tools
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteTools.map((tool) => (
                <div
                  key={tool!.id}
                  className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all flex items-start justify-between gap-4 text-left"
                >
                  <Link to={tool!.path} className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <IconRenderer name={tool!.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="truncate">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-0.5 truncate">
                        {tool!.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{tool!.description}</p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(tool!.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- HISTORY TAB --- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Privacy Disclaimer Banner */}
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 text-sm text-emerald-800 dark:text-emerald-300">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Your data never leaves your computer</h4>
              <p className="text-emerald-700 dark:text-emerald-400">
                This log displays files processed entirely within your browser. 
                Everything is stored locally on your device in your browser\'s localStorage. 
                We never upload, track, or share your files or search queries.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl bg-card">
              <Clock className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Local History</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Files you process, compress, or generate will appear here once processed.
              </p>
              <Button asChild>
                <Link to="/tools">
                  <Wrench className="w-4 h-4 mr-2" />
                  Try a Tool
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* History Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search history..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All History
                </Button>
              </div>

              {/* History List */}
              <div className="border rounded-2xl bg-card overflow-hidden">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No matching history items found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="p-4 font-semibold text-muted-foreground">File Name</th>
                          <th className="p-4 font-semibold text-muted-foreground">Tool Used</th>
                          <th className="p-4 font-semibold text-muted-foreground">Size</th>
                          <th className="p-4 font-semibold text-muted-foreground">Date Processed</th>
                          <th className="p-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-medium max-w-xs truncate">
                              <span className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate" title={item.name}>{item.name}</span>
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {item.toolId && item.toolName ? (
                                <Link
                                  to={tools.find(t => t.id === item.toolId)?.path || '/'}
                                  className="text-primary hover:underline font-medium flex items-center gap-1.5"
                                >
                                  {item.toolName}
                                </Link>
                              ) : (
                                <span className="text-xs italic">Unknown Tool</span>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                              {formatBytes(item.size)}
                            </td>
                            <td className="p-4 text-muted-foreground whitespace-nowrap">
                              {new Date(item.timestamp).toLocaleString()}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeHistoryItem(item.id)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                aria-label="Delete entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
