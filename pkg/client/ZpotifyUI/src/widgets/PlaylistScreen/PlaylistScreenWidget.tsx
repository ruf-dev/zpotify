import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { Path } from '@/app/routing/paths.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { toQueueTracks } from '@/widgets/MusicPlayer/toQueueTracks.ts';
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
    const queueSourceId = playlist?.uuid;

    const isCurrentTrackInPlaylist = orderedSongs.some((s) => s.filePath === audioPlayer.trackPath);
    const isPlaylistPlaying = isCurrentTrackInPlaylist && audioPlayer.isPlaying;

    function handlePlay() {
        if (!queueSourceId) return;
        const queueTracks = toQueueTracks(orderedSongs, coverUrl);
        const first = queueTracks[0];
        if (!first) return;
        audioPlayer.setQueue(queueTracks, 0, queueSourceId);
        audioPlayer.setSongInfo(first.info.title, first.info.artist, first.info.cover, first.info.artists);
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
        if (!song.filePath || !queueSourceId) return;
        if (song.filePath === audioPlayer.trackPath) {
            audioPlayer.togglePlay();
            return;
        }
        const queueTracks = toQueueTracks(orderedSongs, coverUrl);
        const idx = queueTracks.findIndex((t) => t.filePath === song.filePath);
        const target = queueTracks[idx];
        if (!target) return;
        audioPlayer.setQueue(queueTracks, idx, queueSourceId);
        audioPlayer.setSongInfo(target.info.title, target.info.artist, target.info.cover, target.info.artists);
        audioPlayer.play(target.filePath);
    }

    useEffect(() => {
        if (!queueSourceId || audioPlayer.queueSourceId !== queueSourceId) return;
        const queueTracks = toQueueTracks(orderedSongs, coverUrl);
        const idx = queueTracks.findIndex((t) => t.filePath === audioPlayer.trackPath);
        if (idx === -1) return;
        audioPlayer.setQueue(queueTracks, idx, queueSourceId);
    }, [orderedSongs, audioPlayer.trackPath, audioPlayer.queueSourceId]);

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
                    isAudioLoading={audioPlayer.isLoading}
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
