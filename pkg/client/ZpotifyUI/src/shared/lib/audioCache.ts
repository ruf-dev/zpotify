export const AUDIO_CACHE_NAME = 'zpotify-audio-cache-v1';

export function getTrackUrl(trackPath: string): string {
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string) || '';
    const rawUrl = base + (trackPath.startsWith('/') ? trackPath : '/' + trackPath);

    return new URL(rawUrl, window.location.origin).href;
}

export async function getCachedAudio(url: string): Promise<Blob | null> {
    if (!('caches' in window)) return null;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    if (!response) return null;

    return response.blob();
}

const inFlightCacheRequests = new Map<string, Promise<boolean>>();

export async function cacheAudio(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const inFlight = inFlightCacheRequests.get(url);
    if (inFlight) return inFlight;

    const request = cacheAudioUncoordinated(url).finally(() => {
        inFlightCacheRequests.delete(url);
    });
    inFlightCacheRequests.set(url, request);
    return request;
}

async function cacheAudioUncoordinated(url: string): Promise<boolean> {
    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const existing = await cache.match(url);
        if (existing) return true;

        const response = await fetch(url);
        if (!response.ok) return false;

        await cache.put(url, response);
        return true;
    } catch (err) {
        console.error('Failed to cache audio', err);
        return false;
    }
}

export async function uncacheAudio(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    return cache.delete(url);
}

export async function clearAudioCache(): Promise<void> {
    if (!('caches' in window)) return;

    await caches.delete(AUDIO_CACHE_NAME);
}

export async function listCachedUrls(): Promise<string[]> {
    if (!('caches' in window)) return [];

    const cache = await caches.open(AUDIO_CACHE_NAME);
    const requests = await cache.keys();
    return requests.map((r) => r.url);
}

const CACHE_TRACKS_CONCURRENCY = 4;

export async function cacheTracks(
    trackUrls: string[],
    onProgress: (completed: number, total: number) => void,
): Promise<{ succeeded: string[]; failed: string[] }> {
    const total = trackUrls.length;
    const succeeded: string[] = [];
    const failed: string[] = [];
    let completed = 0;
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (nextIndex < trackUrls.length) {
            const url = trackUrls[nextIndex];
            nextIndex += 1;

            const cached = await cacheAudio(url);
            if (cached) {
                succeeded.push(url);
            } else {
                failed.push(url);
            }

            completed += 1;
            onProgress(completed, total);
        }
    }

    const workers = Array.from({ length: Math.min(CACHE_TRACKS_CONCURRENCY, trackUrls.length) }, worker);
    await Promise.all(workers);

    return { succeeded, failed };
}
