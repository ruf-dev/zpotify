import { lazy, Suspense, useState } from 'react';
import cn from 'classnames';
import { Button, ModalClose } from '@vervstack/chures';

import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';
import { RetryAllIcon } from '@/assets/icons/RetryAllIcon';
import TrackList from '@/dialogs/MultitrackUpload/TrackList';
import PlaylistDetailsPanel from '@/dialogs/MultitrackUpload/PlaylistDetailsPanel';
import PlaylistToggleRow from '@/dialogs/MultitrackUpload/PlaylistToggleRow';
import { useTrackDrafts } from '@/dialogs/MultitrackUpload/useTrackDrafts';
import { useMultitrackSubmit } from '@/dialogs/MultitrackUpload/useMultitrackSubmit';
import { useMultitrackSummary } from '@/dialogs/MultitrackUpload/useMultitrackSummary';
import { useArtistLookup } from '@/dialogs/MultitrackUpload/useArtistLookup';
import { formatBytes } from '@/dialogs/MultitrackUpload/utils';
import { useEagerFileUpload } from '@/shared/lib/useEagerFileUpload.ts';
import { useBackGuard } from '@/shared/lib/useBackGuard';
import type { DroppedFolder } from '@/features/upload/resolveDroppedEntries.ts';
import BackButton from '@/shared/ui/BackButton';
import cls from '@/dialogs/MultitrackUpload/MultitrackUploadModal.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';

const AddTrackDialog = lazy(() => import('@/dialogs/AddTrack/AddTrackDialog'));

interface TargetPlaylist {
    uuid: string;
    artists: ArtistItem[];
    existingSongIds: string[];
}

interface MultitrackUploadModalProps {
    files: File[];
    folders?: DroppedFolder[];
    targetPlaylist?: TargetPlaylist;
    initialPlaylistName?: string;
}

export default function MultitrackUploadModal({
    files,
    folders,
    targetPlaylist,
    initialPlaylistName,
}: MultitrackUploadModalProps) {
    const { CloseDialog, OpenDialog, LockClosing, UnlockClosing } = useDialog();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);
    const refreshPlaylists = usePlaylistListRefresh((s) => s.refresh);

    const trackDrafts = useTrackDrafts(files, folders ?? []);

    const [playlistMode, setPlaylistMode] = useState(true);
    const [playlistName, setPlaylistName] = useState(initialPlaylistName ?? '');
    const [albumArtists, setAlbumArtists] = useState<ArtistItem[]>(targetPlaylist?.artists ?? []);
    const [year, setYear] = useState<number | undefined>();
    const [tags, setTags] = useState<ChipEntry[]>([]);
    const [cover, setCover] = useState<File | undefined>();
    const coverUpload = useEagerFileUpload();

    useBackGuard(!targetPlaylist, handleBack);

    function handleCoverChange(file: File) {
        setCover(file);
        coverUpload.startUpload(file);
    }

    function handleBack() {
        CloseDialog();
        OpenDialog(
            <Suspense fallback={null}>
                <AddTrackDialog />
            </Suspense>,
        );
    }

    const submitState = useMultitrackSubmit({
        tracks: trackDrafts.tracks,
        playlistMode,
        playlistName,
        albumArtists,
        year,
        tags,
        hasCover: cover !== undefined,
        resolveCoverFileId: coverUpload.resolveFileId,
        targetPlaylistUuid: targetPlaylist?.uuid,
        CloseDialog,
        LockClosing,
        UnlockClosing,
        refreshActive,
        refreshPlaylists,
    });

    const summary = useMultitrackSummary({
        tracks: trackDrafts.tracks,
        playlistMode,
        playlistName,
        albumArtists,
        targetPlaylistUuid: targetPlaylist?.uuid,
    });

    const excludedSongIds = new Set([...summary.linkedSongIds, ...(targetPlaylist?.existingSongIds ?? [])]);
    const failedCount = trackDrafts.tracks.filter((t) => t.uploadStatus === 'error').length;

    const { loadArtistOptions, onCreateArtist } = useArtistLookup();

    return (
        <div className={cls.PanelContainer} role="dialog" aria-modal="true" aria-labelledby="multitrack-title">
            <div className={cls.PanelHeader}>
                <div className={cls.HeaderLeft}>
                    {!targetPlaylist && <BackButton onClick={handleBack} />}
                    <span id="multitrack-title" className={cls.PanelTitle}>
                        {summary.titleText}
                    </span>
                    <span className={cls.PanelMeta}>
                        {trackDrafts.tracks.length} {trackDrafts.tracks.length === 1 ? 'file' : 'files'} ·{' '}
                        {formatBytes(summary.totalBytes)}
                    </span>
                </div>
                <ModalClose
                    className={modalCloseCls.ModalCloseButton}
                    onClick={CloseDialog}
                    disabled={submitState.submitting}
                />
            </div>

            <div className={cls.PanelBody}>
                {!targetPlaylist && <PlaylistToggleRow checked={playlistMode} onChange={setPlaylistMode} />}

                {playlistMode && !targetPlaylist && (
                    <PlaylistDetailsPanel
                        onCoverChange={handleCoverChange}
                        coverUploadProgress={coverUpload.progress}
                        disabled={submitState.submitting}
                        playlistName={playlistName}
                        onNameChange={setPlaylistName}
                        albumArtists={albumArtists}
                        onAlbumArtistsChange={setAlbumArtists}
                        totalDurationSec={summary.totalDuration}
                        trackCount={trackDrafts.tracks.length}
                        year={year}
                        onYearChange={setYear}
                        loadArtistOptions={loadArtistOptions}
                        onCreateArtist={onCreateArtist}
                        tags={tags}
                        onTagsChange={setTags}
                    />
                )}

                <TrackList
                    tracks={trackDrafts.tracks}
                    albumArtists={playlistMode ? albumArtists : []}
                    onTitleChange={trackDrafts.handleTitleChange}
                    onArtistsChange={trackDrafts.handleArtistsChange}
                    onRemove={trackDrafts.handleRemove}
                    onRetry={trackDrafts.handleRetry}
                    onReorder={trackDrafts.handleReorder}
                    onAddFiles={trackDrafts.handleAddFiles}
                    onCleanNames={trackDrafts.handleCleanNumbers}
                    loadArtistOptions={loadArtistOptions}
                    onCreateArtist={onCreateArtist}
                    showSearchBox={playlistMode}
                    excludedSongIds={excludedSongIds}
                    onAddSong={trackDrafts.handleAddSong}
                    onAddPendingFile={trackDrafts.handleAddPendingFile}
                    excludedFileIds={
                        new Set(trackDrafts.tracks.map((t) => t.fileId).filter((id): id is string => !!id))
                    }
                />
            </div>

            <div className={cls.PanelFooter}>
                <span className={cls.ValidationHint}>{summary.validationHint}</span>
                {failedCount > 0 && (
                    <Button
                        type="button"
                        variant="danger"
                        className={cls.RetryAllButton}
                        onClick={trackDrafts.handleRetryAll}
                        aria-label={`retry ${failedCount} failed ${failedCount === 1 ? 'track' : 'tracks'}`}
                    >
                        <RetryAllIcon />
                        {failedCount}
                    </Button>
                )}
                <Button
                    type="button"
                    variant="primary"
                    className={cn(
                        cls.SubmitButton,
                        summary.isValid && !submitState.submitting ? cls.SubmitReady : cls.SubmitDisabled,
                    )}
                    onClick={submitState.handleSubmit}
                    disabled={!summary.isValid || submitState.submitting}
                >
                    {submitState.submitting ? 'uploading…' : summary.submitLabel}
                    {!submitState.submitting && <ChevronRightIcon />}
                </Button>
            </div>
        </div>
    );
}
