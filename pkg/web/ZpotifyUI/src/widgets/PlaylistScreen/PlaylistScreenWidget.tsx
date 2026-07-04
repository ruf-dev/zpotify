import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import { Path } from '@/app/routing/paths.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import Sidebar from '@/widgets/PlaylistScreen/components/Sidebar/Sidebar.tsx';
import MainContent from '@/widgets/PlaylistScreen/components/MainContent/MainContent.tsx';
import cls from '@/widgets/PlaylistScreen/PlaylistScreenWidget.module.css';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

function computeTotalDuration(songs: SongBase[]): string {
    const totalSec = songs.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    const m = Math.floor(totalSec / 60);
    return `${m} min`;
}

interface Props {
    playlist: Playlist | null;
    songs: SongBase[];
    username: string;
    isListEnded?: boolean;
    onLoadMore?: () => void;
}

export default function PlaylistScreenWidget({ playlist, songs, username, isListEnded, onLoadMore }: Props) {
    const navigate = useNavigate();
    const audioPlayer = useAudioPlayer();
    const toaster = useToaster();
    const [saved, setSaved] = useState(playlist?.isSaved ?? false);
    const [editMode, setEditMode] = useState(false);
    const [orderedSongs, setOrderedSongs] = useState<SongBase[]>(songs);

    useEffect(() => {
        setOrderedSongs(songs);
    }, [songs]);

    useEffect(() => {
        setSaved(playlist?.isSaved ?? false);
    }, [playlist?.uuid, playlist?.isSaved]);

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handleToggleSave() {
        const uuid = playlist?.uuid;
        if (!uuid) return;

        const next = !saved;
        setSaved(next);

        const request = next ? playlistService.FollowPlaylist(uuid) : playlistService.UnfollowPlaylist(uuid);
        void request.catch((e: unknown) => {
            setSaved(!next);
            toaster.catch(e as never);
        });
    }

    const coverUrl = buildCoverUrl(playlist?.coverFilePath);

    function handlePlay() {
        const first = orderedSongs[0];
        if (!first?.filePath) return;
        audioPlayer.setSongInfo(first.title ?? null, first.artists?.[0]?.name ?? null, coverUrl);
        audioPlayer.play(first.filePath);
    }

    function handlePlaySong(song: SongBase) {
        if (!song.filePath) return;
        audioPlayer.setSongInfo(song.title ?? null, song.artists?.[0]?.name ?? null, coverUrl);
        audioPlayer.play(song.filePath);
    }

    useEffect(() => {
        const idx = orderedSongs.findIndex((s) => s.filePath === audioPlayer.trackPath);
        if (idx === -1) return;
        audioPlayer.setNext(orderedSongs[idx + 1]?.filePath);
        audioPlayer.setPrev(idx > 0 ? orderedSongs[idx - 1]?.filePath : undefined);
    }, [orderedSongs, audioPlayer.trackPath]);

    const totalDuration = computeTotalDuration(songs);
    const trackCount = songs.length > 0 ? songs.length : (playlist?.songCount ?? 0);

    return (
        <div className={cls.PlaylistScreenContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                <Sidebar
                    playlist={playlist}
                    totalDuration={totalDuration}
                    trackCount={trackCount}
                    saved={saved}
                    onToggleSave={handleToggleSave}
                    onBack={handleBack}
                    onPlay={handlePlay}
                    editMode={editMode}
                    onEnterEditMode={() => setEditMode(true)}
                    onExitEditMode={() => setEditMode(false)}
                />
                <MainContent
                    songs={orderedSongs}
                    currentTrackPath={audioPlayer.trackPath}
                    onPlaySong={handlePlaySong}
                    onReorder={setOrderedSongs}
                    username={username}
                    canEdit={playlist?.canEdit ?? false}
                    editMode={editMode}
                    playlistUuid={playlist?.uuid}
                    isListEnded={isListEnded}
                    onLoadMore={onLoadMore}
                />
            </div>
        </div>
    );
}
