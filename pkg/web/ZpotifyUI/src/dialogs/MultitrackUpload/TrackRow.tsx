import cn from 'classnames';

import EditableTitle from '@/components/EditableTitle/EditableTitle';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { formatDuration } from '@/shared/lib/time';

import cls from './TrackRow.module.css';

export interface TrackDraft {
    id: string;
    file: File;
    title: string;
    artists: ArtistItem[];
    duration: number;
    size: number;
    uploadStatus: 'pending' | 'uploading' | 'done' | 'error';
    uploadProgress: number;
    fileId?: string;
    isExisting?: boolean;
}

interface TrackRowProps {
    track: TrackDraft;
    index: number;
    albumArtists: ArtistItem[];
    rowRef: (el: HTMLElement | null) => void;
    onHandlePointerDown: (e: React.PointerEvent) => void;
    dragStyle: React.CSSProperties | null;
    isDragging: boolean;
    anyDragging: boolean;
    onTitleChange: (id: string, title: string) => void;
    onArtistsChange: (id: string, artists: ArtistItem[]) => void;
    onRemove: (id: string) => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

function DragHandleIcon() {
    return (
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.2" />
            <circle cx="2" cy="7" r="1.2" />
            <circle cx="2" cy="12" r="1.2" />
            <circle cx="8" cy="2" r="1.2" />
            <circle cx="8" cy="7" r="1.2" />
            <circle cx="8" cy="12" r="1.2" />
        </svg>
    );
}

function RemoveTrackIcon() {
    return (
        <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <line x1="1.5" y1="1.5" x2="9.5" y2="9.5" />
            <line x1="9.5" y1="1.5" x2="1.5" y2="9.5" />
        </svg>
    );
}

function UploadArrowIcon() {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="5" y1="9" x2="5" y2="1" />
            <polyline points="2,4 5,1 8,4" />
        </svg>
    );
}

function UploadDoneIcon() {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="1.5,5.5 4,8 8.5,2" />
        </svg>
    );
}

function UploadStatusChip({
    uploadStatus,
    isExisting,
}: {
    uploadStatus: TrackDraft['uploadStatus'];
    isExisting?: boolean;
}) {
    if (uploadStatus === 'error') return null;
    const isUploading = uploadStatus === 'uploading' || uploadStatus === 'pending';
    return (
        <span
            className={cn(
                cls.StatusChip,
                isUploading ? cls.StatusChipUploading : cls.StatusChipDone,
                isExisting && cls.StatusChipExisting,
            )}
            title={isExisting ? 'already on server' : undefined}
        >
            {isUploading ? <UploadArrowIcon /> : <UploadDoneIcon />}
        </span>
    );
}

export default function TrackRow({
    track,
    index,
    albumArtists,
    rowRef,
    onHandlePointerDown,
    dragStyle,
    isDragging,
    anyDragging,
    onTitleChange,
    onArtistsChange,
    onRemove,
    loadArtistOptions,
    onCreateArtist,
}: TrackRowProps) {
    const durationLabel = track.duration > 0 ? formatDuration(Math.round(track.duration)) : '—';

    return (
        <div
            ref={rowRef}
            className={cn(cls.TrackRowContainer, isDragging && cls.IsDragging, anyDragging && cls.AnyDragging)}
            style={
                {
                    ...(dragStyle ?? {}),
                    '--upload-pct': String(track.uploadProgress / 100),
                } as React.CSSProperties
            }
        >
            <div
                className={cn(
                    cls.ProgressFill,
                    track.uploadStatus === 'done' && cls.UploadDone,
                    track.uploadStatus === 'error' && cls.UploadError,
                )}
            />
            <span className={cls.DragHandle} onPointerDown={onHandlePointerDown} aria-label="drag to reorder">
                <DragHandleIcon />
            </span>

            <span className={cls.TrackNumber}>{String(index + 1).padStart(2, '0')}</span>

            <div className={cls.TitleArtistCell}>
                <EditableTitle value={track.title} onChange={(title) => onTitleChange(track.id, title)} />
                <ArtistChipsField
                    artists={track.artists}
                    onChange={(artists) => onArtistsChange(track.id, artists)}
                    lockedArtists={albumArtists}
                    dense
                    placeholder="add artist…"
                    loadOptions={loadArtistOptions}
                    onCreateArtist={onCreateArtist}
                />
            </div>

            <span className={cls.DurationBadge}>{durationLabel}</span>

            <UploadStatusChip uploadStatus={track.uploadStatus} isExisting={track.isExisting} />

            <button
                type="button"
                className={cls.RemoveButton}
                onClick={() => onRemove(track.id)}
                aria-label={`remove ${track.title}`}
            >
                <RemoveTrackIcon />
            </button>
        </div>
    );
}
