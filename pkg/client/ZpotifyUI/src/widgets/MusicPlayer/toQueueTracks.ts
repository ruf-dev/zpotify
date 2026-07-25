import type { SongBase } from '@/app/api/zpotify';
import { ArtistNamePart, QueueTrack } from '@/widgets/MusicPlayer/usePlayer.ts';

function joinArtistNames(artists: SongBase['artists']): string {
    return (
        artists
            ?.map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ') || ''
    );
}

function toArtistNameParts(artists: SongBase['artists']): ArtistNamePart[] {
    return (artists ?? []).filter((a) => a.name).map((a) => ({ uuid: a.uuid, name: a.name ?? '' }));
}

export function toQueueTracks(songs: SongBase[], coverUrl: string | undefined): QueueTrack[] {
    return songs
        .filter((s): s is SongBase & { filePath: string } => !!s.filePath)
        .map((s) => ({
            filePath: s.filePath,
            info: {
                title: s.title ?? null,
                artist: joinArtistNames(s.artists) || null,
                artists: toArtistNameParts(s.artists),
                cover: coverUrl ?? null,
            },
        }));
}
