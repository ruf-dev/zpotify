import cn from 'classnames';

import EditableTitle from '@/components/EditableTitle/EditableTitle';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { formatDuration } from '@/shared/lib/time';
import cls from '@/dialogs/MultitrackUpload/TrackRow.module.css';
import { DragHandleIcon } from '@/assets/icons/DragHandleIcon';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon';
import UploadStatusChip from '@/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip';

export interface TrackDraft {
    id: string;
    // Absent for existing songs added via search (no local file to upload).
    file?: File;
    title: string;
    artists: ArtistItem[];
    duration: number;
    size?: number;
    uploadStatus: 'pending' | 'uploading' | 'done' | 'error';
    uploadProgress: number;
    fileId?: string;
    isExisting?: boolean;
    linkedSongId?: string;
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
    // TODO: Make editable here and send update name for such files if changed
    const isLinked = !!track.linkedSongId;

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
                <EditableTitle
                    value={track.title}
                    onChange={(title) => onTitleChange(track.id, title)}
                    readOnly={isLinked}
                />
                <ArtistChipsField
                    artists={track.artists.filter((a) => !albumArtists.some((la) => la.id === a.id))}
                    onChange={(artists) => onArtistsChange(track.id, artists)}
                    lockedArtists={albumArtists}
                    dense
                    placeholder="add artist…"
                    loadOptions={loadArtistOptions}
                    onCreateArtist={onCreateArtist}
                    readOnly={isLinked}
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
