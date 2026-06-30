import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import { Path } from '@/app/routing/paths.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import AlbumSidebar from '@/pages/main/album/components/AlbumSidebar/AlbumSidebar.tsx';
import AlbumMainContent from '@/pages/main/album/components/AlbumMainContent/AlbumMainContent.tsx';
import cls from '@/pages/main/album/AlbumPage.module.css';

function computeTotalDuration(songs: SongBase[]): string {
    const totalSec = songs.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    const m = Math.floor(totalSec / 60);
    return `${m} min`;
}

interface Props {
    playlist: Playlist | null;
    songs: SongBase[];
    username: string;
}

export default function AlbumPageScreen({ playlist, songs, username }: Props) {
    const navigate = useNavigate();
    const audioPlayer = useAudioPlayer();
    const [saved, setSaved] = useState(false);

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handleToggleSave() {
        setSaved((prev) => !prev);
    }

    function handlePlay() {
        const first = songs[0];
        if (!first?.filePath) return;
        audioPlayer.setSongInfo(first.title ?? null, first.artists?.[0]?.name ?? null);
        audioPlayer.play(first.filePath);
        audioPlayer.setNext(songs[1]?.filePath);
        audioPlayer.setPrev(undefined);
    }

    function handlePlaySong(song: SongBase) {
        if (!song.filePath) return;
        const idx = songs.findIndex(s => s.filePath === song.filePath);
        audioPlayer.setSongInfo(song.title ?? null, song.artists?.[0]?.name ?? null);
        audioPlayer.play(song.filePath);
        audioPlayer.setNext(songs[idx + 1]?.filePath);
        audioPlayer.setPrev(idx > 0 ? songs[idx - 1]?.filePath : undefined);
    }

    const totalDuration = computeTotalDuration(songs);
    const trackCount = songs.length > 0 ? songs.length : (playlist?.songCount ?? 0);

    return (
        <div className={cls.AlbumPageContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                <AlbumSidebar
                    playlist={playlist}
                    totalDuration={totalDuration}
                    trackCount={trackCount}
                    saved={saved}
                    onToggleSave={handleToggleSave}
                    onBack={handleBack}
                    onPlay={handlePlay}
                />
                <AlbumMainContent
                    songs={songs}
                    currentTrackPath={audioPlayer.trackPath}
                    onPlaySong={handlePlaySong}
                    username={username}
                />
            </div>
        </div>
    );
}
