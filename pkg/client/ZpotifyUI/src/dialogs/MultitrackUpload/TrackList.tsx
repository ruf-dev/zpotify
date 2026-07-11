import { createPortal } from 'react-dom';

import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import DropZone from '@/features/upload/DropZone';
import TrackRow from '@/dialogs/MultitrackUpload/TrackRow';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { useTrackDrag } from '@/dialogs/MultitrackUpload/useTrackDrag';
import cls from '@/dialogs/MultitrackUpload/TrackList.module.css';

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

function noop() {}

export default function TrackList(props: TrackListProps) {
    const drag = useTrackDrag(props.tracks.length, props.onReorder);

    const count = props.tracks.length;
    const headerLabel = count === 1 ? 'TRACK · 1' : `TRACKS · ${count}`;
    const ghostTrack = drag.draggedIdx !== null ? props.tracks[drag.draggedIdx] : undefined;

    return (
        <div className={cls.TrackListContainer}>
            <div className={cls.ListHeader}>
                <span className={cls.HeaderLabel}>{headerLabel}</span>
                <span className={cls.HeaderHint}>drag rows to reorder · click name to rename</span>
            </div>

            <div className={cls.RowsWrapper}>
                {props.tracks.map((track, idx) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        albumArtists={props.albumArtists}
                        rowRef={(el) => {
                            if (el) drag.rowRefs.current[track.id] = el;
                            else delete drag.rowRefs.current[track.id];
                        }}
                        onHandlePointerDown={(e) => drag.startDrag(track.id, idx, e)}
                        dragStyle={drag.getRowStyle(idx)}
                        isDragging={drag.draggedIdx === idx}
                        anyDragging={drag.isActive}
                        onTitleChange={props.onTitleChange}
                        onArtistsChange={props.onArtistsChange}
                        onRemove={props.onRemove}
                        loadArtistOptions={props.loadArtistOptions}
                        onCreateArtist={props.onCreateArtist}
                    />
                ))}
            </div>

            {ghostTrack &&
                createPortal(
                    <TrackRow
                        track={ghostTrack}
                        index={drag.draggedIdx!}
                        albumArtists={props.albumArtists}
                        rowRef={noop}
                        onHandlePointerDown={noop}
                        dragStyle={drag.getGhostStyle()}
                        isDragging
                        anyDragging
                        onTitleChange={props.onTitleChange}
                        onArtistsChange={props.onArtistsChange}
                        onRemove={props.onRemove}
                        loadArtistOptions={props.loadArtistOptions}
                        onCreateArtist={props.onCreateArtist}
                    />,
                    document.body,
                )}

            <DropZone onFiles={props.onAddFiles} className={cls.EmptyStateWrapper}>
                <div className={cls.EmptyStateContent}>
                    {count == 0 ? 'no tracks left — drop more files or close' : 'drop more tracks here'}
                </div>
            </DropZone>
        </div>
    );
}
