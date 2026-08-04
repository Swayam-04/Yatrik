"use client";

import { useState, useEffect } from "react";

export interface SearchHistoryItem {
  id: string;
  query: string;
  description: string;
  lat?: number;
  lng?: number;
  isPinned?: boolean;
  isFavorite?: boolean;
  timestamp: number;
}

const STORAGE_KEY = "yatrik_search_history_v1";

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load search history from localStorage:", err);
    }
  }, []);

  const saveHistory = (items: SearchHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save search history:", err);
    }
  };

  const addSearch = (query: string, description?: string, lat?: number, lng?: number) => {
    if (!query.trim()) return;

    const existingIndex = history.findIndex(
      (item) => item.query.toLowerCase() === query.toLowerCase()
    );

    let updated = [...history];

    if (existingIndex > -1) {
      // Move to top and update timestamp
      const existing = updated[existingIndex];
      updated.splice(existingIndex, 1);
      updated.unshift({
        ...existing,
        description: description || existing.description,
        lat: lat ?? existing.lat,
        lng: lng ?? existing.lng,
        timestamp: Date.now(),
      });
    } else {
      // Add new item
      updated.unshift({
        id: `search-${Date.now()}`,
        query,
        description: description || query,
        lat,
        lng,
        isPinned: false,
        isFavorite: false,
        timestamp: Date.now(),
      });
    }

    // Keep max 20 recent non-pinned searches
    const pinned = updated.filter((item) => item.isPinned);
    const unpinned = updated.filter((item) => !item.isPinned).slice(0, 20);

    saveHistory([...pinned, ...unpinned]);
  };

  const removeSearch = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const togglePin = (id: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    saveHistory(updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(updated);
  };

  const clearHistory = () => {
    // Keep only pinned items when clearing general history
    const pinnedOnly = history.filter((item) => item.isPinned);
    saveHistory(pinnedOnly);
  };

  const pinnedItems = history.filter((item) => item.isPinned);
  const recentItems = history.filter((item) => !item.isPinned);
  const favoriteItems = history.filter((item) => item.isFavorite);

  return {
    history,
    pinnedItems,
    recentItems,
    favoriteItems,
    addSearch,
    removeSearch,
    togglePin,
    toggleFavorite,
    clearHistory,
  };
}
