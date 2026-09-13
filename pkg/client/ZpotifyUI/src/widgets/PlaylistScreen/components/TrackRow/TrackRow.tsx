import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { ConfirmDialog } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/components/TrackRow/TrackRow.module.css';
import type { SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { artistPath } from '@/app/routing/paths.ts';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';
import { PlayTriangleIcon } from '@/assets/icons/PlayTriangleIcon.tsx';
import { SpinnerIcon } from '@/assets/icons/SpinnerIcon.tsx';
import { GripIcon } from '@/assets/icons/GripIcon.tsx';
import MoreButton from '@/entities/song/more/MoreButton.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import EditTrackDialog from '@/dialogs/EditTrack/EditTrackDialog.tsx';
import { useIsSongCached, useAudioCacheStore } from '@/shared/model/audioCacheStore.ts';
import CachedIndicator from '@/shared/ui/CachedIndicator.tsx';
import { cacheAudio, getTrackUrl } from '@/shared/lib/audioCache.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { songsService } from '@/shared/api/Songs.ts';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { ServiceError } from '@/shared/api/Errors.ts';

const TELEGRAM_NOT_LINKED_MESSAGE = 'telegram account is not linked';

function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ArtistNamePart {
    uuid?: string;
    name: string;
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
    isLoading: boolean;
    isLiked: boolean;
    isHeartAnimating: boolean;
    isHighlighted?: boolean;
    showCover?: boolean;
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
    isLoading,
    isLiked,
    isHeartAnimating,
    isHighlighted,
    showCover,
    onPlay,
    onToggleLike,
    canReorder,
    onHandlePointerDown,
    dragStyle,
    anyDragging,
    rowRef,
}: TrackRowProps) {
    const navigate = useNavigate();
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
                    filePath: song.filePath,
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

    function handleSendToTelegram() {
        if (!song.id) return;

        songsService
            .SendToTelegram(song.id)
            .then(() => {
                toaster.bake({
                    title: 'Sent to Telegram',
                    description: `${song.title || 'Track'} was sent to your Telegram chat`,
                    level: 'Info',
                });
            })
            .catch((e: unknown) => {
                if (e instanceof ServiceError && e.title === TELEGRAM_NOT_LINKED_MESSAGE) {
                    toaster.bake({
                        title: 'Telegram not linked',
                        description: 'Link your Telegram account first',
                        level: 'Error',
                    });
                    return;
                }

                toaster.catch(e as never);
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
        {
            label: 'Send to Telegram',
            onClick: handleSendToTelegram,
        },
        ...(canReorder ? [{ label: 'Delete', onClick: handleDelete }] : []),
    ];

    function computeArtistParts(): { prefix: string; parts: ArtistNamePart[] } {
        if (!playlistIsAlbum) {
            const parts = (song.artists ?? []).filter((a) => a.name).map((a) => ({ uuid: a.uuid, name: a.name ?? '' }));
            return { prefix: '', parts: parts.length > 0 ? parts : [{ name: 'Unknown' }] };
        }

        if ((playlistArtists?.length ?? 0) > 1) {
            return { prefix: '', parts: [] };
        }

        const albumArtistIds = new Set((playlistArtists ?? []).map((a) => a.id));
        const featuredParts = (song.artists ?? [])
            .filter((a) => a.uuid && !albumArtistIds.has(a.uuid) && a.name)
            .map((a) => ({ uuid: a.uuid, name: a.name ?? '' }));

        return featuredParts.length > 0 ? { prefix: 'feat: ', parts: featuredParts } : { prefix: '', parts: [] };
    }

    function handleArtistClick(e: MouseEvent, artistUuid?: string) {
        e.stopPropagation();
        if (artistUuid) navigate(artistPath(artistUuid));
    }

    const artistParts = computeArtistParts();
    const duration = formatDuration(song.durationSec ?? 0);
    const coverUrl = showCover ? buildCoverUrl(song.coverFilePath) : undefined;

    return (
        <div
            className={cn(
                cls.TrackRow,
                showCover && cls.TrackRowWithCover,
                isCurrent && cls.TrackRowPlaying,
                canReorder && cls.TrackRowReorderable,
                isHighlighted && cls.TrackRowHighlight,
            )}
            onClick={handleRowClick}
            style={dragStyle}
            ref={rowRef}
            role="row"
        >
            <div className={cls.TrackNumCell}>
                {isCurrent && isLoading ? (
                    <span className={cls.LoadingSpinner}>
                        <SpinnerIcon />
                    </span>
                ) : isCurrent && isPlaying ? (
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

            {showCover && (
                <div className={cls.CoverCell} data-testid="track-row-cover">
                    <CoverWithFallback
                        coverUrl={coverUrl}
                        coverFilePath={song.coverFilePath}
                        uuid={song.id}
                        name={song.title}
                        className={cls.CoverImage}
                    />
                </div>
            )}

            <div className={cls.TrackTitleCell}>
                <span className={cn(cls.TrackTitle, isCurrent && cls.TrackTitlePlaying)}>
                    {song.title}
                    {isCached && <CachedIndicator />}
                </span>
                <span className={cls.TrackArtist}>
                    {artistParts.prefix}
                    {artistParts.parts.map((a, idx) => (
                        <span key={a.uuid ?? `${a.name}-${idx}`}>
                            {idx > 0 && ', '}
                            {a.uuid ? (
                                <span className={cls.ArtistLink} onClick={(e) => handleArtistClick(e, a.uuid)}>
                                    {a.name}
                                </span>
                            ) : (
                                a.name
                            )}
                        </span>
                    ))}
                </span>
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
