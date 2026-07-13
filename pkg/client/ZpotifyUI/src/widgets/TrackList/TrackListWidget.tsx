import { useEffect, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import cls from '@/widgets/TrackList/TrackListWidget.module.css';
import { AudioPlayer, TrackInfo } from '@/widgets/MusicPlayer/usePlayer.ts';
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
};

export default function SongListWidget({ songs, audioPlayer, coverUrl }: SongListWidgetProps) {
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

    function getNext(currentIdx: number): SongBase | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return;
        }

        if (currentIdx < 0 || currentIdx + 1 >= songs.length) {
            return songs[0];
        }

        return songs[currentIdx + 1];
    }

    function getPrev(currentIdx: number): SongBase | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return;
        }

        if (currentIdx === 0) {
            return songs[songs.length - 1];
        }

        return songs[currentIdx - 1];
    }

    function toTrackInfo(song: SongBase | undefined): TrackInfo | undefined {
        if (!song) return undefined;
        return { title: song.title || null, artist: song.artists?.[0]?.name || null, cover: coverUrl ?? null };
    }

    useEffect(() => {
        const currentSongIdx = songs.findIndex((s) => s.filePath == audioPlayer.trackPath);
        const next = getNext(currentSongIdx);
        const prev = getPrev(currentSongIdx);
        audioPlayer.setNext(next?.filePath, toTrackInfo(next));
        audioPlayer.setPrev(prev?.filePath, toTrackInfo(prev));
    }, [audioPlayer.trackPath, songs]);

    function playSongAtIndex(idx: number) {
        const song = songs[idx];

        if (!song) return;

        if (!song.filePath) throw 'No song url path';

        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }

        audioPlayer.setSongInfo(song.title || null, song.artists?.[0]?.name || null, coverUrl);
        audioPlayer.play(song.filePath);
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
