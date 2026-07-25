import { useEffect, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import CardRow from '@/components/CardRow/CardRow.tsx';
import TrackRow from '@/widgets/PlaylistScreen/components/TrackRow/TrackRow.tsx';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { toQueueTracks } from '@/widgets/MusicPlayer/toQueueTracks.ts';
import { useLikedSongs } from '@/entities/song/useLikedSongs.ts';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import cls from '@/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.module.css';

export interface ArtistSongsRowProps {
    title: string;
    songs: SongBase[];
    queueSourceId: string;
}

export default function ArtistSongsRow({ title, songs, queueSourceId }: ArtistSongsRowProps) {
    const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
    const audioPlayer = useAudioPlayer();
    const toaster = useToaster();
    const likedSongIds = useLikedSongs((s) => s.likedSongIds);
    const likeSong = useLikedSongs((s) => s.likeSong);
    const unlikeSong = useLikedSongs((s) => s.unlikeSong);
    const fetchLikedSongs = useLikedSongs((s) => s.fetchLikedSongs);
    const likedPlaylistId = useUser((s) => s.userData?.likedPlaylistId);

    useEffect(() => {
        if (!likedPlaylistId) return;
        void fetchLikedSongs(likedPlaylistId);
    }, [likedPlaylistId, fetchLikedSongs]);

    useEffect(() => {
        if (audioPlayer.queueSourceId !== queueSourceId) return;
        const queueTracks = toQueueTracks(songs, undefined);
        const idx = queueTracks.findIndex((t) => t.filePath === audioPlayer.trackPath);
        if (idx === -1) return;
        audioPlayer.setQueue(queueTracks, idx, queueSourceId);
    }, [audioPlayer.trackPath, audioPlayer.queueSourceId, songs]);

    function playSongAtIndex(idx: number) {
        const song = songs[idx];
        if (!song?.filePath) return;

        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }

        const queueTracks = toQueueTracks(songs, undefined);
        const queueIdx = queueTracks.findIndex((t) => t.filePath === song.filePath);
        const target = queueTracks[queueIdx];
        if (!target) return;
        audioPlayer.setQueue(queueTracks, queueIdx, queueSourceId);
        audioPlayer.setSongInfo(target.info.title, target.info.artist, target.info.cover, target.info.artists);
        audioPlayer.play(target.filePath);
    }

    function handleToggleLike(songId: string) {
        const toggle = likedSongIds.has(songId) ? unlikeSong : likeSong;
        toggle(songId).catch((e: unknown) => toaster.catch(e as never));

        setAnimatingHeartId(songId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    return (
        <CardRow title={title}>
            {songs.map((song, idx) => (
                <div key={song.id} className={cls.TrackCardWrapper}>
                    <TrackRow
                        song={song}
                        index={idx + 1}
                        isCurrent={audioPlayer.trackPath === song.filePath}
                        isPlaying={audioPlayer.isPlaying}
                        isLoading={audioPlayer.isLoading}
                        isLiked={likedSongIds.has(song.id ?? '')}
                        isHeartAnimating={animatingHeartId === song.id}
                        onPlay={() => playSongAtIndex(idx)}
                        onToggleLike={() => handleToggleLike(song.id ?? '')}
                    />
                </div>
            ))}
        </CardRow>
    );
}
