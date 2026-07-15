import { type MouseEvent } from 'react';
import cn from 'classnames';
import { ConfirmDialog } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/components/TrackRow/TrackRow.module.css';
import type { SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';
import { PlayTriangleIcon } from '@/assets/icons/PlayTriangleIcon.tsx';
import { GripIcon } from '@/assets/icons/GripIcon.tsx';
import MoreButton from '@/entities/song/more/MoreButton.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import EditTrackDialog from '@/dialogs/EditTrack/EditTrackDialog.tsx';
import { useIsSongCached, useAudioCacheStore } from '@/shared/model/audioCacheStore.ts';
import CachedIndicator from '@/shared/ui/CachedIndicator.tsx';
import { cacheAudio, getTrackUrl } from '@/shared/lib/audioCache.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';

function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface TrackRowProps {
    song: SongBase;
    playlistUuid?: string;
    playlistName?: string;
    playlistIsAlbum?: boolean;
    playlistArtists?: ArtistItem[];
    index: number;
    isCurrent: boolean;
    isPlaying: boolean;
    isLiked: boolean;
    isHeartAnimating: boolean;
    onPlay: () => void;
    onToggleLike: () => void;
    canReorder?: boolean;
    onHandlePointerDown?: (e: React.PointerEvent) => void;
    dragStyle?: React.CSSProperties;
    anyDragging?: boolean;
    rowRef?: (el: HTMLDivElement | null) => void;
}

export default function TrackRow({
    song,
    playlistUuid,
    playlistName,
    playlistIsAlbum,
    playlistArtists,
    index,
    isCurrent,
    isPlaying,
    isLiked,
    isHeartAnimating,
    onPlay,
    onToggleLike,
    canReorder,
    onHandlePointerDown,
    dragStyle,
    anyDragging,
    rowRef,
}: TrackRowProps) {
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);
    const isCached = useIsSongCached(song.filePath);

    function handleRowClick() {
        if (anyDragging) return;
        onPlay();
    }

    function handleHeartClick(e: MouseEvent) {
        e.stopPropagation();
        onToggleLike();
    }

    function handleDownload() {
        if (!song.filePath) return;

        const trackUrl = getTrackUrl(song.filePath);
        cacheAudio(trackUrl).then((cached) => {
            if (cached) {
                useAudioCacheStore.getState().addCachedUrl(trackUrl, {
                    title: song.title || 'Track',
                    artist:
                        song.artists
                            ?.map((a) => a.name ?? '')
                            .filter(Boolean)
                            .join(', ') || 'Unknown',
                    songId: song.id,
                    playlistName,
                    playlistUuid,
                    isAlbum: playlistIsAlbum,
                });
                toaster.bake({
                    title: 'Song downloaded',
                    description: `${song.title || 'Track'} is now available offline`,
                    level: 'Info',
                });
            } else {
                toaster.bake({
                    title: 'Download failed',
                    description: `Could not download ${song.title || 'this track'}`,
                    level: 'Error',
                });
            }
        });
    }

    function handleDelete() {
        if (!playlistUuid || !song.id) return;
        const uuid = playlistUuid;
        const songId = song.id;

        function handleConfirm() {
            return playlistService
                .DeleteSong(uuid, parseInt(songId, 10))
                .then(() => refreshActive())
                .catch((e: unknown) => toaster.catch(e as never));
        }

        OpenDialog(
            <ConfirmDialog
                title="Delete track"
                message={`Remove "${song.title || 'this track'}" from the playlist?`}
                confirmLabel="Delete"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    const menuOps = [
        {
            label: 'Edit',
            onClick: () => OpenDialog(<EditTrackDialog song={song} />),
        },
        {
            label: isCached ? 'Downloaded' : 'Download',
            onClick: handleDownload,
            disabled: isCached,
        },
        ...(canReorder ? [{ label: 'Delete', onClick: handleDelete }] : []),
    ];

    function computeArtistName(): string {
        if (!playlistIsAlbum) {
            return (
                song.artists
                    ?.map((a) => a.name ?? '')
                    .filter(Boolean)
                    .join(', ') || 'Unknown'
            );
        }

        if ((playlistArtists?.length ?? 0) > 1) {
            return '';
        }

        const albumArtistIds = new Set((playlistArtists ?? []).map((a) => a.id));
        const featuredNames = (song.artists ?? [])
            .filter((a) => a.uuid && !albumArtistIds.has(a.uuid))
            .map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ');

        return featuredNames ? `feat: ${featuredNames}` : '';
    }

    const artistName = computeArtistName();
    const duration = formatDuration(song.durationSec ?? 0);

    return (
        <div
            className={cn(cls.TrackRow, isCurrent && cls.TrackRowPlaying, canReorder && cls.TrackRowReorderable)}
            onClick={handleRowClick}
            style={dragStyle}
            ref={rowRef}
            role="row"
        >
            <div className={cls.TrackNumCell}>
                {isCurrent && isPlaying ? (
                    <NowPlayingBars />
                ) : (
                    <>
                        <span className={cls.TrackNum}>{index}</span>
                        <span className={cls.PlayTriangle}>
                            <PlayTriangleIcon />
                        </span>
                    </>
                )}
            </div>

            <div className={cls.TrackTitleCell}>
                <span className={cn(cls.TrackTitle, isCurrent && cls.TrackTitlePlaying)}>
                    {song.title}
                    {isCached && <CachedIndicator />}
                </span>
                <span className={cls.TrackArtist}>{artistName}</span>
            </div>

            <button
                type="button"
                className={cn(cls.HeartIcon, isLiked && cls.HeartIconLiked, isHeartAnimating && cls.HeartPop)}
                onClick={handleHeartClick}
                aria-label={isLiked ? 'Unlike track' : 'Like track'}
            >
                <HeartIcon filled={isLiked} />
            </button>

            <span className={cls.TrackDuration}>{duration}</span>

            <div className={cls.OverflowBtn}>
                <MoreButton ops={menuOps} />
            </div>

            {canReorder && (
                <button
                    type="button"
                    className={cls.DragHandle}
                    onPointerDown={onHandlePointerDown}
                    aria-label="Drag to reorder"
                >
                    <GripIcon />
                </button>
            )}
        </div>
    );
}
