import cn from 'classnames';
import { Button } from '@vervstack/chures';

import EditableTitle from '@/components/EditableTitle/EditableTitle';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { formatDuration } from '@/shared/lib/time';
import { getCleanablePrefixLength } from '@/dialogs/MultitrackUpload/utils';
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
    uploadError?: string;
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
    onRetry: (id: string) => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
    previewCleanNumbers: boolean;
    isCleaningNumbers: boolean;
}

export default function TrackRow(props: TrackRowProps) {
    const { track } = props;
    const durationLabel = track.duration > 0 ? formatDuration(Math.round(track.duration)) : '—';
    // TODO: Make editable here and send update name for such files if changed
    const isLinked = !!track.linkedSongId;
    const highlightPrefixLength =
        props.previewCleanNumbers || props.isCleaningNumbers ? getCleanablePrefixLength(track.title) : 0;

    return (
        <div
            ref={props.rowRef}
            className={cn(
                cls.TrackRowContainer,
                props.isDragging && cls.IsDragging,
                props.anyDragging && cls.AnyDragging,
            )}
            style={
                {
                    ...(props.dragStyle ?? {}),
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
            <span className={cls.DragHandle} onPointerDown={props.onHandlePointerDown} aria-label="drag to reorder">
                <DragHandleIcon />
            </span>

            <span className={cls.TrackNumber}>{String(props.index + 1).padStart(2, '0')}</span>

            <div className={cls.TitleArtistCell}>
                <EditableTitle
                    value={track.title}
                    onChange={(title) => props.onTitleChange(track.id, title)}
                    readOnly={isLinked}
                    highlightPrefixLength={highlightPrefixLength}
                    isRemovingPrefix={props.isCleaningNumbers}
                />
                <ArtistChipsField
                    artists={track.artists.filter((a) => !props.albumArtists.some((la) => la.id === a.id))}
                    onChange={(artists) => props.onArtistsChange(track.id, artists)}
                    lockedArtists={props.albumArtists}
                    dense
                    placeholder="add artist…"
                    loadOptions={props.loadArtistOptions}
                    onCreateArtist={props.onCreateArtist}
                    readOnly={isLinked}
                />
            </div>

            <span className={cls.DurationBadge}>{durationLabel}</span>

            <UploadStatusChip
                uploadStatus={track.uploadStatus}
                isExisting={track.isExisting}
                uploadError={track.uploadError}
                onRetry={() => props.onRetry(track.id)}
            />

            <Button
                variant="iconDanger"
                className={cls.RemoveButton}
                onClick={() => props.onRemove(track.id)}
                aria-label={`remove ${track.title}`}
            >
                <RemoveTrackIcon />
            </Button>
        </div>
    );
}
