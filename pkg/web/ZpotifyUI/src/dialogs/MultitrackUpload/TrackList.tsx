import { useEffect, useRef, useState } from 'react';

import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import DropZone from '@/features/upload/DropZone';

import TrackRow from '@/dialogs/MultitrackUpload/TrackRow';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

import cls from '@/dialogs/MultitrackUpload/TrackList.module.css';

type Drag = {
    id: string;
    fromIdx: number;
    startY: number;
    dy: number;
    height: number;
    settling: boolean;
} | null;

interface TrackListProps {
    tracks: TrackDraft[];
    albumArtists: ArtistItem[];
    onTitleChange: (id: string, title: string) => void;
    onArtistsChange: (id: string, artists: ArtistItem[]) => void;
    onRemove: (id: string) => void;
    onReorder: (fromIdx: number, toIdx: number) => void;
    onAddFiles: (files: File[]) => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

export default function TrackList({
    tracks,
    albumArtists,
    onTitleChange,
    onArtistsChange,
    onRemove,
    onReorder,
    onAddFiles,
    loadArtistOptions,
    onCreateArtist,
}: TrackListProps) {
    const [drag, setDrag] = useState<Drag>(null);
    const [dropIdx, setDropIdx] = useState<number | null>(null);
    const dropIdxRef = useRef<number | null>(null);
    const rowRefs = useRef<Record<string, HTMLElement>>({});

    useEffect(() => {
        dropIdxRef.current = dropIdx;
    }, [dropIdx]);

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
            const next = Math.max(0, Math.min(tracks.length - 1, fromIdx + delta));
            setDrag((d) => (d ? { ...d, dy } : d));
            setDropIdx(next);
        }

        window.addEventListener('pointermove', handleMove);
        return () => window.removeEventListener('pointermove', handleMove);
    }, [drag?.id, drag?.settling, tracks.length]);

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
                onReorder(fromIdx, finalDrop);
            }, 230);
        }

        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        return () => {
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [drag?.id, drag?.settling]);

    function getRowDragStyle(idx: number): React.CSSProperties {
        if (!drag) return {};
        const { fromIdx, dy, height, settling } = drag;
        const drop = dropIdx ?? fromIdx;

        if (idx === fromIdx) {
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

    const count = tracks.length;
    const headerLabel = count === 1 ? 'TRACK · 1' : `TRACKS · ${count}`;

    return (
        <div className={cls.TrackListContainer}>
            <div className={cls.ListHeader}>
                <span className={cls.HeaderLabel}>{headerLabel}</span>
                <span className={cls.HeaderHint}>drag rows to reorder · click name to rename</span>
            </div>

            <div className={cls.RowsWrapper}>
                {tracks.map((track, idx) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        albumArtists={albumArtists}
                        rowRef={(el) => {
                            if (el) rowRefs.current[track.id] = el;
                            else delete rowRefs.current[track.id];
                        }}
                        onHandlePointerDown={(e) => startDrag(track.id, idx, e)}
                        dragStyle={getRowDragStyle(idx)}
                        isDragging={drag !== null && drag.fromIdx === idx}
                        anyDragging={drag !== null}
                        onTitleChange={onTitleChange}
                        onArtistsChange={onArtistsChange}
                        onRemove={onRemove}
                        loadArtistOptions={loadArtistOptions}
                        onCreateArtist={onCreateArtist}
                    />
                ))}
            </div>
            <DropZone onFiles={onAddFiles} className={cls.EmptyStateWrapper}>
                <div className={cls.EmptyStateContent}>
                    {count == 0 ? 'no tracks left — drop more files or close' : 'drop more tracks here'}
                </div>
            </DropZone>
        </div>
    );
}
