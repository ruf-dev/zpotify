import {useState} from 'react';
import cls from './TrackList.module.css';
import TrackRow from './TrackRow';
import type {TrackDraft} from './TrackRow';
import type {ArtistItem} from '@/components/ArtistChipsField/ArtistChipsField';

interface TrackListProps {
    tracks: TrackDraft[];
    albumArtists: ArtistItem[];
    onTitleChange: (id: string, title: string) => void;
    onArtistsChange: (id: string, artists: ArtistItem[]) => void;
    onRemove: (id: string) => void;
    onReorder: (fromIdx: number, toIdx: number) => void;
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
    loadArtistOptions,
    onCreateArtist,
}: TrackListProps) {
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);

    function handleDragStart(idx: number) {
        setDragIdx(idx);
    }

    function handleDragOver(idx: number) {
        if (overIdx !== idx) setOverIdx(idx);
    }

    function handleDrop(idx: number) {
        if (dragIdx != null && dragIdx !== idx) {
            onReorder(dragIdx, idx);
        }
        setDragIdx(null);
        setOverIdx(null);
    }

    function handleDragEnd() {
        setDragIdx(null);
        setOverIdx(null);
    }

    const count = tracks.length;
    const headerLabel = count === 1 ? 'TRACK · 1' : `TRACKS · ${count}`;

    return (
        <div className={cls.TrackListContainer}>
            <div className={cls.ListHeader}>
                <span className={cls.HeaderLabel}>{headerLabel}</span>
                <span className={cls.HeaderHint}>drag rows to reorder · click name to rename</span>
            </div>

            {count === 0 ? (
                <div className={cls.EmptyState}>
                    no tracks left — drop more files or close
                </div>
            ) : (
                <div className={cls.RowsWrapper}>
                    {tracks.map((track, idx) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            index={idx}
                            albumArtists={albumArtists}
                            isDragging={dragIdx === idx}
                            isDragOver={overIdx === idx}
                            onTitleChange={onTitleChange}
                            onArtistsChange={onArtistsChange}
                            onRemove={onRemove}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            loadArtistOptions={loadArtistOptions}
                            onCreateArtist={onCreateArtist}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
