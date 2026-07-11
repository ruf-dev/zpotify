import { useCallback } from 'react';

import { artistsService } from '@/shared/api/ArtistsService.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';

export interface ArtistLookup {
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

// Shared artist search/create logic used by both the playlist details panel
// and the track list rows.
export function useArtistLookup(): ArtistLookup {
    const loadArtistOptions = useCallback(
        (query: string): Promise<ArtistItem[]> =>
            artistsService
                .ListArtist(query, 0, 8)
                .then((res) =>
                    (res.artists ?? []).filter((a) => a.name && a.uuid).map((a) => ({ id: a.uuid!, name: a.name! })),
                ),
        [],
    );

    const onCreateArtist = useCallback(function onCreateArtist(name: string): Promise<ArtistItem> {
        return artistsService.CreateArtist(name);
    }, []);

    return { loadArtistOptions, onCreateArtist };
}
