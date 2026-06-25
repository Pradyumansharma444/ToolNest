import { useState, useEffect, useCallback } from 'react';

export interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  timestamp: number;
  toolId?: string;
  toolName?: string;
}

const STORAGE_KEY = 'toolnest-file-history';
const MAX_HISTORY_ITEMS = 50;

export function useFileHistory() {
  const [history, setHistory] = useState<ProcessedFile[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Event handler for new files processed
  const handleFileProcessed = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{
      name: string;
      size: number;
      mimeType: string;
      timestamp: number;
    }>;

    const { name, size, mimeType, timestamp } = customEvent.detail;
    const currentTool = (window as Window & { __currentTool?: { id: string; name: string } }).__currentTool;

    const newRecord: ProcessedFile = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      size,
      mimeType,
      timestamp,
      toolId: currentTool?.id,
      toolName: currentTool?.name,
    };

    setHistory(prev => {
      // Avoid duplicates if the exact same file is logged twice in the same millisecond
      if (prev.some(item => item.name === name && item.timestamp === timestamp)) {
        return prev;
      }
      const updated = [newRecord, ...prev];
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Listen to the custom file processed event
  useEffect(() => {
    window.addEventListener('toolnest-file-processed', handleFileProcessed);
    return () => {
      window.removeEventListener('toolnest-file-processed', handleFileProcessed);
    };
  }, [handleFileProcessed]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    history,
    clearHistory,
    removeHistoryItem,
  };
}
