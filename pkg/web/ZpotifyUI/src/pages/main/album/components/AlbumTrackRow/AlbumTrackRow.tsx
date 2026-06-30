import { type MouseEvent } from 'react';
import cn from 'classnames';

import cls from '@/pages/main/album/components/AlbumTrackRow/AlbumTrackRow.module.css';
import type { SongBase } from '@/app/api/zpotify';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';
import { PlayTriangleIcon } from '@/assets/icons/PlayTriangleIcon.tsx';

function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function GripIcon() {
    return (
        <svg
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill="currentColor"
        >
            <rect x="0" y="1" width="4" height="2" rx="1" />
            <rect x="8" y="1" width="4" height="2" rx="1" />
            <rect x="0" y="6" width="4" height="2" rx="1" />
            <rect x="8" y="6" width="4" height="2" rx="1" />
            <rect x="0" y="11" width="4" height="2" rx="1" />
            <rect x="8" y="11" width="4" height="2" rx="1" />
        </svg>
    );
}

export interface AlbumTrackRowProps {
    song: SongBase;
    index: number;
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

export default function AlbumTrackRow({
    song,
    index,
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
}: AlbumTrackRowProps) {
    function handleRowClick() {
        if (anyDragging) return;
        onPlay();
    }

    function handleHeartClick(e: MouseEvent) {
        e.stopPropagation();
        onToggleLike();
    }

    function handleOverflowClick(e: MouseEvent) {
        e.stopPropagation();
    }

    const artistName = song.artists?.[0]?.name ?? 'Unknown';
    const duration = formatDuration(song.durationSec ?? 0);

    return (
        <div
            className={cn(cls.TrackRow, isPlaying && cls.TrackRowPlaying, canReorder && cls.TrackRowReorderable)}
            onClick={handleRowClick}
            style={dragStyle}
            ref={rowRef}
            role="row"
        >
            <div className={cls.TrackNumCell}>
                {isPlaying ? (
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
                <span className={cn(cls.TrackTitle, isPlaying && cls.TrackTitlePlaying)}>{song.title}</span>
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

            <button type="button" className={cls.OverflowBtn} onClick={handleOverflowClick} aria-label="More options">
                ···
            </button>

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
