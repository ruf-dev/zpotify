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
        if (!first?.id) return;
        const artistName = first.artists?.[0]?.name ?? null;
        audioPlayer.setSongInfo(first.title ?? null, artistName);
        audioPlayer.play(first.id);
    }

    function handlePlaySong(song: SongBase) {
        if (!song.id) return;
        const artistName = song.artists?.[0]?.name ?? null;
        audioPlayer.setSongInfo(song.title ?? null, artistName);
        audioPlayer.play(song.id);
    }

    const totalDuration = computeTotalDuration(songs);

    return (
        <div className={cls.AlbumPageContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                <AlbumSidebar
                    playlist={playlist}
                    totalDuration={totalDuration}
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
