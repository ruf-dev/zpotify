import cls from './TrackRow.module.css';
import EditableTitle from '@/components/EditableTitle/EditableTitle';
import ArtistChipsField from '@/components/ArtistChipsField/ArtistChipsField';
import type {ArtistItem} from '@/components/ArtistChipsField/ArtistChipsField';
import {formatDuration} from '@/utils/time';

export interface TrackDraft {
    id: string;
    file: File;
    title: string;
    artists: ArtistItem[];
    duration: number;
    size: number;
}

interface TrackRowProps {
    track: TrackDraft;
    index: number;
    albumArtists: ArtistItem[];
    isDragging: boolean;
    isDragOver: boolean;
    onTitleChange: (id: string, title: string) => void;
    onArtistsChange: (id: string, artists: ArtistItem[]) => void;
    onRemove: (id: string) => void;
    onDragStart: (idx: number) => void;
    onDragOver: (idx: number) => void;
    onDrop: (idx: number) => void;
    onDragEnd: () => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

function DragHandleIcon() {
    return (
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.2"/>
            <circle cx="2" cy="7" r="1.2"/>
            <circle cx="2" cy="12" r="1.2"/>
            <circle cx="8" cy="2" r="1.2"/>
            <circle cx="8" cy="7" r="1.2"/>
            <circle cx="8" cy="12" r="1.2"/>
        </svg>
    );
}

function RemoveTrackIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1.5" y1="1.5" x2="9.5" y2="9.5"/>
            <line x1="9.5" y1="1.5" x2="1.5" y2="9.5"/>
        </svg>
    );
}

export default function TrackRow({
    track,
    index,
    albumArtists,
    isDragging,
    isDragOver,
    onTitleChange,
    onArtistsChange,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    loadArtistOptions,
    onCreateArtist,
}: TrackRowProps) {
    const durationLabel = track.duration > 0 ? formatDuration(Math.round(track.duration)) : '—';

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        onDragOver(index);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        onDrop(index);
    }

    return (
        <div
            className={`${cls.TrackRowContainer} ${isDragging ? cls.Dragging : ''} ${isDragOver ? cls.DragOver : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <span
                className={cls.DragHandle}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnd={onDragEnd}
                aria-label="drag to reorder"
            >
                <DragHandleIcon/>
            </span>

            <span className={cls.TrackNumber}>
                {String(index + 1).padStart(2, '0')}
            </span>

            <div className={cls.TitleArtistCell}>
                <EditableTitle
                    value={track.title}
                    onChange={title => onTitleChange(track.id, title)}
                />
                <ArtistChipsField
                    artists={track.artists}
                    onChange={artists => onArtistsChange(track.id, artists)}
                    lockedArtists={albumArtists}
                    dense
                    placeholder="add artist…"
                    loadOptions={loadArtistOptions}
                    onCreateArtist={onCreateArtist}
                />
            </div>

            <span className={cls.DurationBadge}>{durationLabel}</span>

            <button
                type="button"
                className={cls.RemoveButton}
                onClick={() => onRemove(track.id)}
                aria-label={`remove ${track.title}`}
            >
                <RemoveTrackIcon/>
            </button>
        </div>
    );
}
