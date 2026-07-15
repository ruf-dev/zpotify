import { useEffect, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import cls from '@/widgets/TrackList/TrackListWidget.module.css';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';
import { toQueueTracks } from '@/widgets/MusicPlayer/toQueueTracks.ts';
import { SongListPermissions } from '@/shared/model/User.ts';
import TrackRow from '@/widgets/PlaylistScreen/components/TrackRow/TrackRow.tsx';
import { useLikedSongs } from '@/entities/song/useLikedSongs.ts';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

type SongListWidgetProps = {
    songs: SongBase[];
    permissions?: SongListPermissions;
    audioPlayer: AudioPlayer;
    coverUrl?: string;
    queueSourceId: string;
};

export default function SongListWidget({ songs, audioPlayer, coverUrl, queueSourceId }: SongListWidgetProps) {
    const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);

    const toaster = useToaster();
    const likedPlaylistId = useUser((s) => s.userData?.likedPlaylistId);
    const likedSongIds = useLikedSongs((s) => s.likedSongIds);
    const fetchLikedSongs = useLikedSongs((s) => s.fetchLikedSongs);
    const likeSong = useLikedSongs((s) => s.likeSong);
    const unlikeSong = useLikedSongs((s) => s.unlikeSong);

    useEffect(() => {
        if (!likedPlaylistId) return;
        void fetchLikedSongs(likedPlaylistId);
    }, [likedPlaylistId, fetchLikedSongs]);

    useEffect(() => {
        if (audioPlayer.queueSourceId !== queueSourceId) return;
        const queueTracks = toQueueTracks(songs, coverUrl);
        const idx = queueTracks.findIndex((t) => t.filePath === audioPlayer.trackPath);
        if (idx === -1) return;
        audioPlayer.setQueue(queueTracks, idx, queueSourceId);
    }, [audioPlayer.trackPath, audioPlayer.queueSourceId, songs]);

    function playSongAtIndex(idx: number) {
        const song = songs[idx];

        if (!song) return;

        if (!song.filePath) throw 'No song url path';

        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }

        const queueTracks = toQueueTracks(songs, coverUrl);
        const queueIdx = queueTracks.findIndex((t) => t.filePath === song.filePath);
        const target = queueTracks[queueIdx];
        if (!target) return;
        audioPlayer.setQueue(queueTracks, queueIdx, queueSourceId);
        audioPlayer.setSongInfo(target.info.title, target.info.artist, target.info.cover);
        audioPlayer.play(target.filePath);
    }

    function handleToggleLike(songId: string) {
        const toggle = likedSongIds.has(songId) ? unlikeSong : likeSong;
        void toggle(songId).catch((e: unknown) => toaster.catch(e as never));

        setAnimatingHeartId(songId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    return (
        <div className={cls.SongListWidgetContainer}>
            {songs.map((s: SongBase, idx: number) => (
                <TrackRow
                    key={s.id}
                    song={s}
                    index={idx + 1}
                    isCurrent={audioPlayer.trackPath === s.filePath}
                    isPlaying={audioPlayer.isPlaying}
                    isLiked={likedSongIds.has(s.id ?? '')}
                    isHeartAnimating={animatingHeartId === s.id}
                    onPlay={() => playSongAtIndex(idx)}
                    onToggleLike={() => handleToggleLike(s.id ?? '')}
                />
            ))}
        </div>
    );
}
