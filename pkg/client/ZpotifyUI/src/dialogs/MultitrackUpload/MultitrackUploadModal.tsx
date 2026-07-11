import { useState } from 'react';
import cn from 'classnames';
import { Button, ModalClose } from '@vervstack/chures';

import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';
import TrackList from '@/dialogs/MultitrackUpload/TrackList';
import PlaylistDetailsPanel from '@/dialogs/MultitrackUpload/PlaylistDetailsPanel';
import PlaylistToggleRow from '@/dialogs/MultitrackUpload/PlaylistToggleRow';
import SongSearchBox from '@/dialogs/MultitrackUpload/SongSearchBox/SongSearchBox';
import { useTrackDrafts } from '@/dialogs/MultitrackUpload/useTrackDrafts';
import { useMultitrackSubmit } from '@/dialogs/MultitrackUpload/useMultitrackSubmit';
import { useMultitrackSummary } from '@/dialogs/MultitrackUpload/useMultitrackSummary';
import { useArtistLookup } from '@/dialogs/MultitrackUpload/useArtistLookup';
import { formatBytes } from '@/dialogs/MultitrackUpload/utils';
import cls from '@/dialogs/MultitrackUpload/MultitrackUploadModal.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';

interface MultitrackUploadModalProps {
    files: File[];
}

export default function MultitrackUploadModal({ files }: MultitrackUploadModalProps) {
    const { CloseDialog, LockClosing, UnlockClosing } = useDialog();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);
    const refreshPlaylists = usePlaylistListRefresh((s) => s.refresh);

    const trackDrafts = useTrackDrafts(files);

    const [playlistMode, setPlaylistMode] = useState(true);
    const [playlistName, setPlaylistName] = useState('');
    const [albumArtists, setAlbumArtists] = useState<ArtistItem[]>([]);
    const [year, setYear] = useState<number | undefined>();
    const [chips, setChips] = useState<ChipEntry[]>([]);
    const [cover, setCover] = useState<File | undefined>();

    const submitState = useMultitrackSubmit({
        tracks: trackDrafts.tracks,
        playlistMode,
        playlistName,
        albumArtists,
        year,
        chips,
        cover,
        CloseDialog,
        LockClosing,
        UnlockClosing,
        refreshActive,
        refreshPlaylists,
    });

    const summary = useMultitrackSummary({ tracks: trackDrafts.tracks, playlistMode, playlistName, albumArtists });

    const { loadArtistOptions, onCreateArtist } = useArtistLookup();

    return (
        <div className={cls.PanelContainer} role="dialog" aria-modal="true" aria-labelledby="multitrack-title">
            <div className={cls.PanelHeader}>
                <div className={cls.HeaderLeft}>
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
                <PlaylistToggleRow checked={playlistMode} onChange={setPlaylistMode} />

                {playlistMode && (
                    <PlaylistDetailsPanel
                        cover={cover}
                        onCoverChange={setCover}
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
                        chips={chips}
                        onChipsChange={setChips}
                    />
                )}

                {playlistMode && (
                    <SongSearchBox excludedIds={summary.linkedSongIds} onAddSong={trackDrafts.handleAddSong} />
                )}

                <TrackList
                    tracks={trackDrafts.tracks}
                    albumArtists={playlistMode ? albumArtists : []}
                    onTitleChange={trackDrafts.handleTitleChange}
                    onArtistsChange={trackDrafts.handleArtistsChange}
                    onRemove={trackDrafts.handleRemove}
                    onReorder={trackDrafts.handleReorder}
                    onAddFiles={trackDrafts.handleAddFiles}
                    loadArtistOptions={loadArtistOptions}
                    onCreateArtist={onCreateArtist}
                />
            </div>

            <div className={cls.PanelFooter}>
                <span className={cls.ValidationHint}>{summary.validationHint}</span>
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
