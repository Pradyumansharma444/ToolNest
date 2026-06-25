import { useState, useEffect, useCallback } from 'react';
import type { ToolUsage } from '@/types';

const STORAGE_KEY = 'toolnest-usage';

export function useToolUsage() {
  const [usage, setUsage] = useState<ToolUsage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  const recordUsage = useCallback((toolId: string) => {
    setUsage(prev => {
      const existing = prev.find(u => u.toolId === toolId);
      if (existing) {
        return prev.map(u =>
          u.toolId === toolId
            ? { ...u, count: u.count + 1, lastUsed: Date.now() }
            : u
        );
      }
      return [...prev, { toolId, count: 1, lastUsed: Date.now() }];
    });
  }, []);

  const getUsageCount = useCallback((toolId: string): number => {
    return usage.find(u => u.toolId === toolId)?.count || 0;
  }, [usage]);

  const getMostUsed = useCallback((limit = 5): ToolUsage[] => {
    return [...usage]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [usage]);

  return {
    usage,
    recordUsage,
    getUsageCount,
    getMostUsed,
  };
}
