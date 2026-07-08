import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SongBase } from '@/app/api/zpotify';
import { clearAudioCache, getTrackUrl, listCachedUrls, uncacheAudio } from '@/shared/lib/audioCache.ts';

interface DownloadProgress {
    completed: number;
    total: number;
}

export interface CachedSongMeta {
    title: string;
    artist: string;
}

interface AudioCacheState {
    cachedUrls: Set<string>;
    addCachedUrl: (url: string, meta?: CachedSongMeta) => void;
    removeCachedUrl: (url: string) => Promise<void>;
    removeCachedUrls: (urls: string[]) => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
    downloadProgress: Record<string, DownloadProgress>;
    setDownloadProgress: (key: string, completed: number, total: number) => void;
    clearDownloadProgress: (key: string) => void;
    cachedSongMeta: Record<string, CachedSongMeta>;
}

export const useAudioCacheStore = create<AudioCacheState>()(
    persist(
        (set) => ({
            cachedUrls: new Set(),
            cachedSongMeta: {},
            addCachedUrl: (url: string, meta?: CachedSongMeta) =>
                set((state) => ({
                    cachedUrls: new Set(state.cachedUrls).add(url),
                    cachedSongMeta: meta ? { ...state.cachedSongMeta, [url]: meta } : state.cachedSongMeta,
                })),
            removeCachedUrl: async (url: string) => {
                await uncacheAudio(url);
                set((state) => {
                    const nextUrls = new Set(state.cachedUrls);
                    nextUrls.delete(url);
                    const nextMeta = { ...state.cachedSongMeta };
                    delete nextMeta[url];
                    return { cachedUrls: nextUrls, cachedSongMeta: nextMeta };
                });
            },
            removeCachedUrls: async (urls: string[]) => {
                await Promise.all(urls.map((url) => uncacheAudio(url)));
                set((state) => {
                    const nextUrls = new Set(state.cachedUrls);
                    const nextMeta = { ...state.cachedSongMeta };
                    urls.forEach((url) => {
                        nextUrls.delete(url);
                        delete nextMeta[url];
                    });
                    return { cachedUrls: nextUrls, cachedSongMeta: nextMeta };
                });
            },
            clearAll: async () => {
                await clearAudioCache();
                set({ cachedUrls: new Set(), cachedSongMeta: {} });
            },
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
        }),
        {
            name: 'zpotify-audio-cache-meta',
            partialize: (state) => ({ cachedSongMeta: state.cachedSongMeta }),
        },
    ),
);

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

export interface CachedSongEntry {
    url: string;
    title: string;
    artist: string;
}

export function useCachedSongs(): CachedSongEntry[] {
    const cachedUrls = useAudioCacheStore((state) => state.cachedUrls);
    const cachedSongMeta = useAudioCacheStore((state) => state.cachedSongMeta);

    return Array.from(cachedUrls).map((url) => {
        const meta = cachedSongMeta[url];
        return {
            url,
            title: meta?.title ?? decodeURIComponent(url.split('/').pop() || url),
            artist: meta?.artist ?? 'Unknown',
        };
    });
}
