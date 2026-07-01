import type { Playlist } from '@/app/api/zpotify';

// An album is a playlist that has at least one attached artist.
// A regular user playlist has no artists.
export function isAlbum(playlist: Playlist): boolean {
    return (playlist.artists?.length ?? 0) > 0;
}
