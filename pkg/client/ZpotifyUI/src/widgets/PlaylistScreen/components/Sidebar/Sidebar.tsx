import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/components/Sidebar/Sidebar.module.css';
import type { Playlist, SongBase } from '@/app/api/zpotify';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import EditableText from '@/widgets/PlaylistScreen/components/EditableText/EditableText.tsx';
import EditableArtistPicker from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import PlaylistControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.tsx';
import { useSidebar } from '@/widgets/PlaylistScreen/components/Sidebar/useSidebar.tsx';

const SECTION_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;

export interface SidebarProps {
    playlist: Playlist | null;
    songs: SongBase[];
    totalDuration: string;
    trackCount: number;
    saved: boolean;
    onToggleSave: () => void;
    onBack: () => void;
    onPlay: () => void;
    editMode: boolean;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
}

export default function Sidebar({
    playlist,
    songs,
    totalDuration,
    trackCount,
    saved,
    onToggleSave,
    onBack,
    onPlay,
    editMode,
    onEnterEditMode,
    onExitEditMode,
}: SidebarProps) {
    const {
        seed,
        artistName,
        playlistIsAlbum,
        displayCoverUrl,

        aboutExpanded,
        handleToggleAbout,

        saving,
        coverHover,
        coverInputRef,
        handleCoverMouseEnter,
        handleCoverMouseLeave,
        handleCoverClick,
        handleCoverFileChange,

        editName,
        setEditName,
        editDesc,
        setEditDesc,
        editYear,
        setEditYear,
        editArtists,
        setEditArtists,
        loadArtistOptions,
        handleCreateArtist,

        handleSave,
        handleCancel,

        downloadProgress,
        allCached,
        downloadButtonStyle,
        handleDownloadPlaylist,
        handleUnloadCache,
    } = useSidebar({ playlist, songs, editMode, onExitEditMode });

    if (!playlist) {
        return (
            <div className={cls.SidebarContainer}>
                <BackButton onClick={onBack} />
                <div className={cls.ErrorState}>
                    <span className={cls.ErrorIcon}>!</span>
                    <p className={cls.ErrorTitle}>Playlist not found</p>
                    <p className={cls.ErrorHint}>This playlist may have been removed or is unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cls.SidebarContainer}>
            <BackButton onClick={onBack} />

            <div
                className={cn(cls.CoverWrapper, editMode && cls.CoverWrapperEditing)}
                onMouseEnter={handleCoverMouseEnter}
                onMouseLeave={handleCoverMouseLeave}
                onClick={handleCoverClick}
            >
                {displayCoverUrl ? (
                    <img src={displayCoverUrl} alt={playlist.name} className={cls.CoverImage} />
                ) : (
                    <GenerativeCover seed={seed} size={220} borderRadius="0" />
                )}
                {editMode && coverHover && (
                    <div className={cls.CoverChangeOverlay}>
                        <UploadArrowIcon />
                        <span>Change</span>
                    </div>
                )}
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className={cls.HiddenInput}
                    onChange={handleCoverFileChange}
                />
            </div>

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>{playlistIsAlbum ? 'album' : 'playlist'}</span>

                <EditableText
                    displayValue={playlist.name ?? ''}
                    editValue={editName}
                    isEditing={editMode}
                    onChange={setEditName}
                    displayAs="h1"
                    displayClassName={cls.AlbumName}
                    inputClassName={cls.EditInputTitle}
                    placeholder="name…"
                />

                {playlistIsAlbum ? (
                    <EditableArtistPicker
                        displayName={artistName}
                        displayClassName={cls.ArtistName}
                        artists={editArtists}
                        isEditing={editMode}
                        onChange={setEditArtists}
                        loadOptions={loadArtistOptions}
                        onCreateArtist={handleCreateArtist}
                        preloadedArtists={editArtists}
                    />
                ) : (
                    <span
                        className={cls.ArtistName}
                        data-tooltip-id="root-tooltip"
                        data-tooltip-content="The user who created this playlist"
                    >
                        Author: {playlist.ownerUsername || 'Unknown'}
                    </span>
                )}

                <div className={cls.MetaRow}>
                    {(playlist.year != null || editMode) && (
                        <>
                            <EditableText
                                displayValue={String(playlist.year ?? '')}
                                editValue={String(editYear ?? '')}
                                isEditing={editMode}
                                onChange={(v) => setEditYear(v ? Number(v) : undefined)}
                                displayClassName={cls.MetaText}
                                inputClassName={cls.EditInputMeta}
                                type="number"
                                placeholder="year…"
                            />
                            <span>·</span>
                        </>
                    )}
                    <EditableText
                        displayValue={`${trackCount} tracks`}
                        editValue={String(trackCount)}
                        isEditing={editMode}
                        onChange={() => undefined}
                        displayClassName={cls.MetaText}
                        inputClassName={cls.EditInputMeta}
                        type="number"
                        readOnly
                    />
                    {editMode && <span>tracks</span>}
                    <span>·</span>
                    <span>{totalDuration}</span>
                </div>
            </div>

            {/* TODO: add tag editing row after release — ChipsField overflows the sidebar container in edit mode */}
            <AnimatePresence mode="sync" initial={false}>
                {!editMode && (playlist.chips?.length ?? 0) > 0 ? (
                    <motion.div
                        key="genre-view"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={SECTION_TRANSITION}
                        className={cls.GenreChipsRow}
                    >
                        {playlist.chips!.map((chip) => (
                            <span key={`${chip.kind}:${chip.value}`} className={cls.GenreChip}>
                                {chip.value}
                            </span>
                        ))}
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <PlaylistControls
                onPlay={onPlay}
                saved={saved}
                onToggleSave={onToggleSave}
                allCached={allCached}
                downloadDisabled={!!downloadProgress}
                downloadButtonStyle={downloadButtonStyle}
                onDownloadClick={allCached ? handleUnloadCache : handleDownloadPlaylist}
                canEdit={!!playlist.canEdit}
                editMode={editMode}
                saving={saving}
                onSave={handleSave}
                onCancel={handleCancel}
                onEnterEditMode={onEnterEditMode}
            />

            <AnimatePresence mode="sync" initial={false}>
                {editMode ? (
                    <motion.div
                        key="desc-edit"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={SECTION_TRANSITION}
                        className={cls.EditSection}
                    >
                        <span className={cls.EditSectionLabel}>description</span>
                        <textarea
                            className={cls.EditTextarea}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="add a description…"
                            rows={3}
                        />
                    </motion.div>
                ) : playlist.description ? (
                    <motion.div
                        key="desc-view"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={SECTION_TRANSITION}
                        className={cls.AboutSection}
                    >
                        <span className={cls.SectionLabel}>about</span>
                        <p className={cn(cls.AboutBody, !aboutExpanded && cls.AboutBodyClamped)}>
                            {playlist.description}
                        </p>
                        <Button variant="ghost" className={cls.ReadMoreToggle} onClick={handleToggleAbout}>
                            {aboutExpanded ? 'show less' : 'read more'}
                        </Button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* TODO: restore credits and label sections after release — requires GetAlbum metadata endpoint */}
        </div>
    );
}
