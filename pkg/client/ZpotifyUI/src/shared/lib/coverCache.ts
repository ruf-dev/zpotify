export const COVER_CACHE_NAME = 'zpotify-cover-cache-v1';

export async function getCachedCover(url: string): Promise<Blob | null> {
    if (!('caches' in window)) return null;

    const cache = await caches.open(COVER_CACHE_NAME);
    const response = await cache.match(url);
    if (!response) return null;

    return response.blob();
}

const inFlightCacheRequests = new Map<string, Promise<boolean>>();

export async function cacheCover(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const inFlight = inFlightCacheRequests.get(url);
    if (inFlight) return inFlight;

    const request = cacheCoverUncoordinated(url).finally(() => {
        inFlightCacheRequests.delete(url);
    });
    inFlightCacheRequests.set(url, request);
    return request;
}

async function cacheCoverUncoordinated(url: string): Promise<boolean> {
    try {
        const cache = await caches.open(COVER_CACHE_NAME);
        const existing = await cache.match(url);
        if (existing) return true;

        const response = await fetch(url);
        if (!response.ok) return false;

        await cache.put(url, response);
        return true;
    } catch (err) {
        console.error('Failed to cache cover', err);
        return false;
    }
}

export async function uncacheCover(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const cache = await caches.open(COVER_CACHE_NAME);
    return cache.delete(url);
}

export async function clearCoverCache(): Promise<void> {
    if (!('caches' in window)) return;

    await caches.delete(COVER_CACHE_NAME);
}

export async function listCachedCoverUrls(): Promise<string[]> {
    if (!('caches' in window)) return [];

    const cache = await caches.open(COVER_CACHE_NAME);
    const requests = await cache.keys();
    return requests.map((r) => r.url);
}
