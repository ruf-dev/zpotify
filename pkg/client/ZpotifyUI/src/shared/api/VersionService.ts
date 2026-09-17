import { apiPrefix } from '@/shared/api/Api.ts';
import { ZpotifyAPI } from '@/app/api/zpotify';

export interface ServerVersion {
    version: string;
    startedAt?: string;
    devMode: boolean;
}

export function fetchServerVersion(): Promise<ServerVersion> {
    return ZpotifyAPI.Version({}, apiPrefix()).then((resp) => ({
        version: resp.version ?? '',
        startedAt: resp.startedAt as unknown as string | undefined,
        devMode: resp.devMode ?? false,
    }));
}
