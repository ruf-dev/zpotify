import { create } from 'zustand';

import type { SongBase } from '@/app/api/zpotify';
import { getTrackUrl, listCachedUrls } from '@/shared/lib/audioCache.ts';

interface DownloadProgress {
    completed: number;
    total: number;
}

interface AudioCacheState {
    cachedUrls: Set<string>;
    addCachedUrl: (url: string) => void;
    refresh: () => Promise<void>;
    downloadProgress: Record<string, DownloadProgress>;
    setDownloadProgress: (key: string, completed: number, total: number) => void;
    clearDownloadProgress: (key: string) => void;
}

export const useAudioCacheStore = create<AudioCacheState>((set) => ({
    cachedUrls: new Set(),
    addCachedUrl: (url: string) => set((state) => ({ cachedUrls: new Set(state.cachedUrls).add(url) })),
    refresh: async () => {
        const urls = await listCachedUrls();
        set({ cachedUrls: new Set(urls) });
    },
    downloadProgress: {},
    setDownloadProgress: (key: string, completed: number, total: number) =>
        set((state) => ({ downloadProgress: { ...state.downloadProgress, [key]: { completed, total } } })),
    clearDownloadProgress: (key: string) =>
        set((state) => {
            const next = { ...state.downloadProgress };
            delete next[key];
            return { downloadProgress: next };
        }),
}));

useAudioCacheStore.getState().refresh();

export function useIsSongCached(trackPath: string | null | undefined): boolean {
    const cachedUrls = useAudioCacheStore((state) => state.cachedUrls);
    if (!trackPath) return false;

    return cachedUrls.has(getTrackUrl(trackPath));
}

export function useDownloadProgress(key: string | undefined): DownloadProgress | null {
    const progress = useAudioCacheStore((state) => (key ? state.downloadProgress[key] : undefined));
    return progress ?? null;
}

export function useCachedCount(songs: SongBase[]): { cached: number; total: number } {
    const cachedUrls = useAudioCacheStore((state) => state.cachedUrls);
    const paths = songs.map((s) => s.filePath).filter((p): p is string => !!p);
    const cached = paths.filter((p) => cachedUrls.has(getTrackUrl(p))).length;

    return { cached, total: paths.length };
}
