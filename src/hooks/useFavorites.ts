import { useState, useEffect, useCallback } from 'react';
import type { FavoriteTool } from '@/types';

const STORAGE_KEY = 'toolnest-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteTool[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((toolId: string): boolean => {
    return favorites.some(f => f.id === toolId);
  }, [favorites]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === toolId);
      if (exists) {
        return prev.filter(f => f.id !== toolId);
      }
      return [...prev, { id: toolId, addedAt: Date.now() }];
    });
  }, []);

  const addFavorite = useCallback((toolId: string) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === toolId)) return prev;
      return [...prev, { id: toolId, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((toolId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== toolId));
  }, []);

  const favoriteToolIds = favorites.map(f => f.id);

  return {
    favorites,
    favoriteToolIds,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
