import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { Path } from '@/app/routing/paths.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import PlaylistInfoSegment from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/PlaylistInfoSegment.tsx';
import NotFoundPlaylistInfoSegment from '@/widgets/PlaylistScreen/segments/NotFoundPlaylistInfoSegment/NotFoundPlaylistInfoSegment.tsx';
import MainContent from '@/widgets/PlaylistScreen/components/MainContent/MainContent.tsx';
import cls from '@/widgets/PlaylistScreen/PlaylistScreenWidget.module.css';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';

function computeTotalDuration(songs: SongBase[]): string {
    const totalSec = songs.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    const m = Math.floor(totalSec / 60);
    return `${m} min`;
}

function mapPlaylistArtists(playlist: Playlist): ArtistItem[] {
    return (playlist.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! }));
}

function joinArtistNames(artists: SongBase['artists']): string {
    return (
        artists
            ?.map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ') || ''
    );
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
    const [editMode, setEditMode] = useState(false);
    const [orderedSongs, setOrderedSongs] = useState<SongBase[]>(songs);

    useEffect(() => {
        setOrderedSongs(songs);
    }, [songs]);

    function handleBack() {
        navigate(Path.HomePage);
    }

    const coverUrl = buildCoverUrl(playlist?.coverFilePath);

    const isCurrentTrackInPlaylist = orderedSongs.some((s) => s.filePath === audioPlayer.trackPath);
    const isPlaylistPlaying = isCurrentTrackInPlaylist && audioPlayer.isPlaying;

    function handlePlay() {
        const first = orderedSongs[0];
        if (!first?.filePath) return;
        audioPlayer.setSongInfo(first.title ?? null, joinArtistNames(first.artists) || null, coverUrl);
        audioPlayer.play(first.filePath);
    }

    function handlePlayToggle() {
        if (isCurrentTrackInPlaylist) {
            audioPlayer.togglePlay();
            return;
        }
        handlePlay();
    }

    function handlePlaySong(song: SongBase) {
        if (!song.filePath) return;
        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }
        audioPlayer.setSongInfo(song.title ?? null, joinArtistNames(song.artists) || null, coverUrl);
        audioPlayer.play(song.filePath);
    }

    useEffect(() => {
        const idx = orderedSongs.findIndex((s) => s.filePath === audioPlayer.trackPath);
        if (idx === -1) return;
        const next = orderedSongs[idx + 1];
        const prev = idx > 0 ? orderedSongs[idx - 1] : undefined;
        audioPlayer.setNext(
            next?.filePath,
            next
                ? { title: next.title ?? null, artist: joinArtistNames(next.artists) || null, cover: coverUrl ?? null }
                : undefined,
        );
        audioPlayer.setPrev(
            prev?.filePath,
            prev
                ? { title: prev.title ?? null, artist: joinArtistNames(prev.artists) || null, cover: coverUrl ?? null }
                : undefined,
        );
    }, [orderedSongs, audioPlayer.trackPath]);

    const totalDuration = computeTotalDuration(songs);
    const trackCount = songs.length > 0 ? songs.length : (playlist?.songCount ?? 0);

    return (
        <div className={cls.PlaylistScreenContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                {playlist ? (
                    <PlaylistInfoSegment
                        playlist={playlist}
                        songs={orderedSongs}
                        totalDuration={totalDuration}
                        trackCount={trackCount}
                        onBack={handleBack}
                        onPlay={handlePlayToggle}
                        isPlaying={isPlaylistPlaying}
                        editMode={editMode}
                        onEnterEditMode={() => setEditMode(true)}
                        onExitEditMode={() => setEditMode(false)}
                    />
                ) : (
                    <NotFoundPlaylistInfoSegment onBack={handleBack} />
                )}
                <MainContent
                    songs={orderedSongs}
                    currentTrackPath={audioPlayer.trackPath}
                    isAudioPlaying={audioPlayer.isPlaying}
                    onPlaySong={handlePlaySong}
                    onReorder={setOrderedSongs}
                    username={username}
                    canEdit={playlist?.canEdit ?? false}
                    editMode={editMode}
                    playlistUuid={playlist?.uuid}
                    playlistName={playlist?.name}
                    playlistIsAlbum={playlist ? isAlbum(playlist) : false}
                    playlistArtists={playlist ? mapPlaylistArtists(playlist) : []}
                    isListEnded={isListEnded}
                    onLoadMore={onLoadMore}
                />
            </div>
        </div>
    );
}
