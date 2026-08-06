import { create } from 'zustand';

import { clearCoverCache, listCachedCoverUrls } from '@/shared/lib/coverCache.ts';

interface CoverCacheState {
    cachedUrls: Set<string>;
    addCachedUrl: (url: string) => void;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const useCoverCacheStore = create<CoverCacheState>()((set) => ({
    cachedUrls: new Set(),
    addCachedUrl: (url: string) => set((state) => ({ cachedUrls: new Set(state.cachedUrls).add(url) })),
    clearAll: async () => {
        await clearCoverCache();
        set({ cachedUrls: new Set() });
    },
    refresh: async () => {
        const urls = await listCachedCoverUrls();
        set({ cachedUrls: new Set(urls) });
    },
}));

useCoverCacheStore.getState().refresh();
