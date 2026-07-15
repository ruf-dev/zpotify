import type { SongBase } from '@/app/api/zpotify';
import { QueueTrack } from '@/widgets/MusicPlayer/usePlayer.ts';

function joinArtistNames(artists: SongBase['artists']): string {
    return (
        artists
            ?.map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ') || ''
    );
}

export function toQueueTracks(songs: SongBase[], coverUrl: string | undefined): QueueTrack[] {
    return songs
        .filter((s): s is SongBase & { filePath: string } => !!s.filePath)
        .map((s) => ({
            filePath: s.filePath,
            info: { title: s.title ?? null, artist: joinArtistNames(s.artists) || null, cover: coverUrl ?? null },
        }));
}
