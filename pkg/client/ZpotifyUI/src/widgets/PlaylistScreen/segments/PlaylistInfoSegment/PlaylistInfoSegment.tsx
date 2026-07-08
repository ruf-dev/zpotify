import {AnimatePresence, motion} from 'framer-motion';
import {Button} from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/PlaylistInfoSegment.module.css';
import type {Playlist, SongBase} from '@/app/api/zpotify';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import {UploadArrowIcon} from '@/assets/icons/UploadArrowIcon.tsx';
import EditableText from '@/widgets/PlaylistScreen/components/EditableText/EditableText.tsx';
import EditableArtistPicker from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import PlaylistControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.tsx';
import {usePlaylistInfoSegment} from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/usePlaylistInfoSegment.ts';

const SECTION_TRANSITION = {duration: 0.2, ease: [0.4, 0, 0.2, 1]} as const;

export interface PlaylistInfoSegmentProps {
    playlist: Playlist;
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

export default function PlaylistInfoSegment(
    {
        playlist, songs, totalDuration, trackCount,
        saved, onToggleSave, onBack, onPlay,
        editMode, onEnterEditMode, onExitEditMode,
    }: PlaylistInfoSegmentProps) {
    const context = usePlaylistInfoSegment({playlist, editMode, onExitEditMode});

    return (
        <div className={cls.PlaylistInfoContainer}>
            <BackButton onClick={onBack}/>

            <div
                className={cn(cls.CoverWrapper,
                    {
                        [cls.CoverWrapperEditing]: editMode
                    })}
                onMouseEnter={context.handleCoverMouseEnter}
                onMouseLeave={context.handleCoverMouseLeave}
                onClick={context.handleCoverClick}
            >
                <CoverWithFallback {...playlist} coverUrl={context.displayCoverUrl} />
                {editMode && context.coverHover && (
                    <div className={cls.CoverChangeOverlay}>
                        <UploadArrowIcon/>
                        <span>Change</span>
                    </div>
                )}
                <input
                    ref={context.coverInputRef}
                    type="file"
                    accept="image/*"
                    className={cls.HiddenInput}
                    onChange={context.handleCoverFileChange}
                />
            </div>

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>{context.playlistIsAlbum ? 'album' : 'playlist'}</span>

                <EditableText
                    displayValue={playlist.name ?? ''}
                    editValue={context.editName}
                    isEditing={editMode}
                    onChange={context.setEditName}
                    displayAs="h1"
                    displayClassName={cls.AlbumName}
                    inputClassName={cls.EditInputTitle}
                    placeholder="name…"
                />

                {context.playlistIsAlbum ? (
                    <EditableArtistPicker
                        displayName={context.artistName}
                        displayClassName={cls.ArtistName}
                        artists={context.editArtists}
                        isEditing={editMode}
                        onChange={context.setEditArtists}
                        loadOptions={context.loadArtistOptions}
                        onCreateArtist={context.handleCreateArtist}
                        preloadedArtists={context.editArtists}
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
                                editValue={String(context.editYear ?? '')}
                                isEditing={editMode}
                                onChange={(v) => context.setEditYear(v ? Number(v) : undefined)}
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
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
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
                playlist={playlist}
                songs={songs}
                onPlay={onPlay}
                saved={saved}
                onToggleSave={onToggleSave}
                editMode={editMode}
                saving={context.saving}
                onSave={context.handleSave}
                onCancel={context.handleCancel}
                onEnterEditMode={onEnterEditMode}
            />

            <AnimatePresence mode="sync" initial={false}>
                {editMode ? (
                    <motion.div
                        key="desc-edit"
                        layout
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={SECTION_TRANSITION}
                        className={cls.EditSection}
                    >
                        <span className={cls.EditSectionLabel}>description</span>
                        <textarea
                            className={cls.EditTextarea}
                            value={context.editDesc}
                            onChange={(e) => context.setEditDesc(e.target.value)}
                            placeholder="add a description…"
                            rows={3}
                        />
                    </motion.div>
                ) : playlist.description ? (
                    <motion.div
                        key="desc-view"
                        layout
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={SECTION_TRANSITION}
                        className={cls.AboutSection}
                    >
                        <span className={cls.SectionLabel}>about</span>
                        <p className={cn(cls.AboutBody, !context.aboutExpanded && cls.AboutBodyClamped)}>
                            {playlist.description}
                        </p>
                        <Button variant="ghost" className={cls.ReadMoreToggle} onClick={context.handleToggleAbout}>
                            {context.aboutExpanded ? 'show less' : 'read more'}
                        </Button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* TODO: restore credits and label sections after release — requires GetAlbum metadata endpoint */}
        </div>
    );
}
