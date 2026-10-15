import type { Playlist } from '@/app/api/zpotify';
import { PlaylistKind } from '@/shared/api/PlaylistKind.ts';

export function isSingle(playlist: Playlist): boolean {
    return playlist.kind === PlaylistKind.PLAYLIST_KIND_SINGLE;
}
