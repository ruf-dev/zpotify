import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@vervstack/chures';

import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { SongBase } from '@/app/api/zpotify';
import DropZone from '@/features/upload/DropZone';
import SongSearchBox from '@/widgets/SongSearchBox/SongSearchBox';
import TrackRow from '@/dialogs/MultitrackUpload/TrackRow';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { useTrackDrag } from '@/dialogs/MultitrackUpload/useTrackDrag';
import { canCleanTrackNumbers } from '@/dialogs/MultitrackUpload/utils';
import { groupTracksByFolder, folderProgress } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import cls from '@/dialogs/MultitrackUpload/TrackList.module.css';

interface TrackListProps {
    tracks: TrackDraft[];
    albumArtists: ArtistItem[];
    onTitleChange: (id: string, title: string) => void;
    onArtistsChange: (id: string, artists: ArtistItem[]) => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => void;
    onReorder: (fromIdx: number, toIdx: number) => void;
    onAddFiles: (files: File[]) => void;
    onCleanNames: () => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
    showSearchBox: boolean;
    excludedSongIds: Set<string>;
    onAddSong: (song: SongBase) => void;
    flatList?: boolean;
}

const CLEAN_NUMBERS_ANIMATION_MS = 220;

function noop() {}

export default function TrackList(props: TrackListProps) {
    const drag = useTrackDrag(props.tracks.length, props.onReorder);
    const [isHoveringClean, setIsHoveringClean] = useState(false);
    const [isCleaningNumbers, setIsCleaningNumbers] = useState(false);
    const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

    const count = props.tracks.length;
    const headerLabel = count === 1 ? 'TRACK · 1' : `TRACKS · ${count}`;
    const ghostTrack = drag.draggedIdx !== null ? props.tracks[drag.draggedIdx] : undefined;
    const canCleanNames = canCleanTrackNumbers(props.tracks.map((t) => t.title));
    const previewCleanNumbers = canCleanNames && isHoveringClean;
    const cleaningNumbers = canCleanNames && isCleaningNumbers;
    const segments = props.flatList ? undefined : groupTracksByFolder(props.tracks);

    function handleCleanNamesClick() {
        setIsHoveringClean(false);
        setIsCleaningNumbers(true);
        window.setTimeout(() => {
            props.onCleanNames();
            setIsCleaningNumbers(false);
        }, CLEAN_NUMBERS_ANIMATION_MS);
    }

    function toggleFolder(folderName: string) {
        setCollapsedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderName)) next.delete(folderName);
            else next.add(folderName);
            return next;
        });
    }

    function renderTrackRow(track: TrackDraft, idx: number) {
        return (
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
                onRetry={props.onRetry}
                loadArtistOptions={props.loadArtistOptions}
                onCreateArtist={props.onCreateArtist}
                previewCleanNumbers={previewCleanNumbers}
                isCleaningNumbers={cleaningNumbers}
            />
        );
    }

    return (
        <div className={cls.TrackListContainer}>
            <div className={cls.ListHeader}>
                <span className={cls.HeaderLabel}>{headerLabel}</span>
                <div className={cls.HeaderRight}>
                    <span className={cls.HeaderHint}>drag rows to reorder · click name to rename</span>
                    {canCleanNames && (
                        <Button
                            type="button"
                            variant="ghost"
                            className={cls.CleanNamesButton}
                            onClick={handleCleanNamesClick}
                            onMouseEnter={() => setIsHoveringClean(true)}
                            onMouseLeave={() => setIsHoveringClean(false)}
                            disabled={isCleaningNumbers}
                        >
                            clean names
                        </Button>
                    )}
                </div>
            </div>

            <div className={cls.RowsWrapper}>
                {props.flatList
                    ? props.tracks.map((track, idx) => renderTrackRow(track, idx))
                    : segments!.flatMap((segment) => {
                          if (segment.folderName === undefined) {
                              return [renderTrackRow(segment.tracks[0], segment.startIndex)];
                          }

                          const folderName = segment.folderName;
                          const collapsed = collapsedFolders.has(folderName);
                          const nodes = [
                              <FolderGroupHeader
                                  key={`folder-header-${folderName}-${segment.startIndex}`}
                                  name={folderName}
                                  trackCount={segment.tracks.length}
                                  progress={folderProgress(segment.tracks)}
                                  collapsed={collapsed}
                                  onToggle={() => toggleFolder(folderName)}
                              />,
                          ];

                          if (!collapsed) {
                              nodes.push(
                                  <div
                                      key={`folder-tracks-${folderName}-${segment.startIndex}`}
                                      className={cls.FolderTrackIndent}
                                  >
                                      {segment.tracks.map((track, i) => renderTrackRow(track, segment.startIndex + i))}
                                  </div>,
                              );
                          }

                          return nodes;
                      })}
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
                        onRetry={props.onRetry}
                        loadArtistOptions={props.loadArtistOptions}
                        onCreateArtist={props.onCreateArtist}
                        previewCleanNumbers={previewCleanNumbers}
                        isCleaningNumbers={cleaningNumbers}
                    />,
                    document.body,
                )}

            {props.showSearchBox && <SongSearchBox excludedIds={props.excludedSongIds} onAddSong={props.onAddSong} />}

            <DropZone onFiles={props.onAddFiles} className={cls.EmptyStateWrapper}>
                <div className={cls.EmptyStateContent}>
                    {count == 0 ? 'no tracks left — drop more files or close' : 'drop more tracks here'}
                </div>
            </DropZone>
        </div>
    );
}
