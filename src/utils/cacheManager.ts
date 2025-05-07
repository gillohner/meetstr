// src/utils/cacheManager.ts
'use client';

const CACHE_TTL = 60 * 60 * 1000;
const memoryCache = new Map<string, { data: any; timestamp: number }>();

export const cache = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const entry = memoryCache.get(key);
    return entry && Date.now() - entry.timestamp < CACHE_TTL ? entry.data : null;
  },
  
  set: (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    memoryCache.set(key, { data, timestamp: Date.now() });
  },

  persistToStorage: async () => {
    if (typeof window === 'undefined') return;
    const cacheData = Array.from(memoryCache.entries());
    localStorage.setItem('locationCache', JSON.stringify(cacheData));
  },

  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('locationCache');
    if (saved) JSON.parse(saved).forEach(([k, v]) => memoryCache.set(k, v));
  }
};

// Client-side initialization
if (typeof window !== 'undefined') {
  cache.hydrateFromStorage();
  setInterval(cache.persistToStorage, 30_000);
}
