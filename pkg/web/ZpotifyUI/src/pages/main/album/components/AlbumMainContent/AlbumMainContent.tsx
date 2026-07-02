import { useEffect, useRef, useState } from 'react';

import cls from '@/pages/main/album/components/AlbumMainContent/AlbumMainContent.module.css';
import type { SongBase } from '@/app/api/zpotify';
import { selectFlagEnabled, useFeatureFlags } from '@/entities/feature-flags/useFeatureFlags.ts';
import { ClockIcon } from '@/assets/icons/ClockIcon.tsx';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import AlbumTrackRow from '@/pages/main/album/components/AlbumTrackRow/AlbumTrackRow.tsx';
import CommentsSection from '@/pages/main/album/components/CommentsSection/CommentsSection.tsx';

type Drag = {
    id: string;
    fromIdx: number;
    startY: number;
    dy: number;
    height: number;
    settling: boolean;
} | null;

export interface AlbumMainContentProps {
    songs: SongBase[];
    currentTrackPath: string | null;
    onPlaySong: (song: SongBase) => void;
    onReorder: (songs: SongBase[]) => void;
    username: string;
    canEdit?: boolean;
    editMode?: boolean;
    playlistUuid?: string;
}

export default function AlbumMainContent({
    songs,
    currentTrackPath,
    onPlaySong,
    onReorder,
    username,
    canEdit,
    editMode,
    playlistUuid,
}: AlbumMainContentProps) {
    const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
    const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
    const [drag, setDrag] = useState<Drag>(null);
    const [dropIdx, setDropIdx] = useState<number | null>(null);
    const commentsEnabled = useFeatureFlags((s) => selectFlagEnabled(s, 'IS_COMMENTS_ON_ALBUM_ENABLED'));
    const toaster = useToaster();

    const dropIdxRef = useRef<number | null>(null);
    const rowRefs = useRef<Record<string, HTMLDivElement>>({});

    useEffect(() => {
        dropIdxRef.current = dropIdx;
    }, [dropIdx]);

    function handleToggleLike(songId: string) {
        setLikedSongIds((prev) => {
            const next = new Set(prev);
            if (next.has(songId)) {
                next.delete(songId);
            } else {
                next.add(songId);
            }
            return next;
        });
        setAnimatingHeartId(songId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    function startDrag(id: string, idx: number, e: React.PointerEvent) {
        if (drag !== null) return;
        e.preventDefault();
        const el = rowRefs.current[id];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const height = rect.height + 6;
        setDrag({ id, fromIdx: idx, startY: e.clientY, dy: 0, height, settling: false });
        setDropIdx(idx);
    }

    useEffect(() => {
        if (!drag || drag.settling) return;
        const { fromIdx, startY, height } = drag;

        function handleMove(e: PointerEvent) {
            const dy = e.clientY - startY;
            const delta = Math.round(dy / height);
            const next = Math.max(0, Math.min(songs.length - 1, fromIdx + delta));
            setDrag((d) => (d ? { ...d, dy } : d));
            setDropIdx(next);
        }

        window.addEventListener('pointermove', handleMove);
        return () => window.removeEventListener('pointermove', handleMove);
    }, [drag?.id, drag?.settling, songs.length]);

    useEffect(() => {
        if (!drag || drag.settling) return;
        const { fromIdx, height } = drag;

        function handleUp() {
            const finalDrop = dropIdxRef.current ?? fromIdx;
            const targetDy = (finalDrop - fromIdx) * height;
            setDrag((d) => (d ? { ...d, dy: targetDy, settling: true } : d));
            setTimeout(() => {
                setDrag(null);
                setDropIdx(null);
                handleReorder(fromIdx, finalDrop);
            }, 230);
        }

        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        return () => {
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [drag?.id, drag?.settling]);

    function handleReorder(fromIdx: number, toIdx: number) {
        if (fromIdx === toIdx) return;
        const next = [...songs];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        if (playlistUuid) {
            const songIds = next.map((s) => Number(s.id ?? 0));
            void playlistService.ChangeSongsOrder(playlistUuid, songIds).catch((e: unknown) => {
                toaster.catch(e as never);
            });
        }
        onReorder(next);
    }

    function getRowDragStyle(id: string, idx: number): React.CSSProperties {
        if (!drag) return {};
        const { fromIdx, dy, height, settling } = drag;
        const drop = dropIdx ?? fromIdx;

        if (drag.id === id) {
            return {
                transform: `translateY(${dy}px) rotate(2.2deg) scale(1.025)`,
                boxShadow:
                    '0 18px 40px rgba(0,0,0,0.7), 0 0 0 1px var(--color-accent-border), 0 0 32px var(--color-accent-shadow)',
                background: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-accent-border)',
                zIndex: 20,
                cursor: 'grabbing',
                willChange: 'transform',
                userSelect: 'none',
                transition: settling
                    ? 'transform 0.23s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.23s ease, border-color 0.23s ease'
                    : 'box-shadow 0.15s ease, border-color 0.15s ease',
            };
        }
        if (fromIdx < drop && idx > fromIdx && idx <= drop) {
            return {
                transform: `translateY(-${height}px)`,
                transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'transform',
            };
        }
        if (fromIdx > drop && idx >= drop && idx < fromIdx) {
            return {
                transform: `translateY(${height}px)`,
                transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'transform',
            };
        }
        return {};
    }

    return (
        <div className={cls.MainContentContainer}>
            <div className={cls.TrackListHeader}>
                <span className={cls.ColNum}>#</span>
                <span className={cls.ColTitle}>title</span>
                <span />
                <span className={cls.ColDuration}>
                    <ClockIcon />
                </span>
                <span />
                {editMode && canEdit && <span />}
            </div>

            <div className={cls.TrackList}>
                {songs.map((song, i) => {
                    const id = song.id ?? String(i);
                    return (
                        <AlbumTrackRow
                            key={song.id}
                            song={song}
                            index={i + 1}
                            isPlaying={currentTrackPath === song.filePath}
                            isLiked={likedSongIds.has(song.id ?? '')}
                            isHeartAnimating={animatingHeartId === song.id}
                            onPlay={() => onPlaySong(song)}
                            onToggleLike={() => handleToggleLike(song.id ?? '')}
                            canReorder={editMode && canEdit}
                            onHandlePointerDown={(e) => startDrag(id, i, e)}
                            dragStyle={getRowDragStyle(id, i)}
                            anyDragging={drag !== null}
                            rowRef={(el) => {
                                if (el) rowRefs.current[id] = el;
                                else delete rowRefs.current[id];
                            }}
                        />
                    );
                })}
            </div>

            {commentsEnabled && <CommentsSection username={username} />}
        </div>
    );
}
