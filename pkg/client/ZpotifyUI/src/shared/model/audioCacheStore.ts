import { create } from 'zustand';

import { getTrackUrl, listCachedUrls } from '@/shared/lib/audioCache.ts';

interface AudioCacheState {
    cachedUrls: Set<string>;
    addCachedUrl: (url: string) => void;
    refresh: () => Promise<void>;
}

export const useAudioCacheStore = create<AudioCacheState>((set) => ({
    cachedUrls: new Set(),
    addCachedUrl: (url: string) => set((state) => ({ cachedUrls: new Set(state.cachedUrls).add(url) })),
    refresh: async () => {
        const urls = await listCachedUrls();
        set({ cachedUrls: new Set(urls) });
    },
}));

useAudioCacheStore.getState().refresh();

export function useIsSongCached(trackPath: string | null | undefined): boolean {
    const cachedUrls = useAudioCacheStore((state) => state.cachedUrls);
    if (!trackPath) return false;

    return cachedUrls.has(getTrackUrl(trackPath));
}
