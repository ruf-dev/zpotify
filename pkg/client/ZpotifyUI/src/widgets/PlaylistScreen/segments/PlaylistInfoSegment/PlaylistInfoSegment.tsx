import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/PlaylistInfoSegment.module.css';
import type { Playlist, SongBase } from '@/app/api/zpotify';
import BackButton from '@/shared/ui/BackButton.tsx';
import EditableCoverWithFallback from '@/widgets/PlaylistScreen/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx';
import EditableAlbumName from '@/widgets/PlaylistScreen/components/EditableAlbumName/EditableAlbumName.tsx';
import EditableYear from '@/widgets/PlaylistScreen/components/EditableYear/EditableYear.tsx';
import TrackCountLabel from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.tsx';
import EditableArtistPicker from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import PlaylistOwnerLabel from '@/widgets/PlaylistScreen/components/PlaylistOwnerLabel/PlaylistOwnerLabel.tsx';
import PlaylistControls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.tsx';
import { usePlaylistInfoSegment } from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/usePlaylistInfoSegment.ts';

const SECTION_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;

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

export default function PlaylistInfoSegment(props: PlaylistInfoSegmentProps) {
    const { playlist, totalDuration, onBack, editMode } = props;
    const context = usePlaylistInfoSegment(props);

    return (
        <div className={cls.PlaylistInfoContainer}>
            <BackButton onClick={onBack} />

            <EditableCoverWithFallback {...context.coverProps} />

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>{context.playlistIsAlbum ? 'album' : 'playlist'}</span>

                <EditableAlbumName {...context.albumNameProps} />

                {context.playlistIsAlbum ? (
                    <EditableArtistPicker {...context.artistPicker} />
                ) : (
                    <PlaylistOwnerLabel {...context.ownerLabelProps} />
                )}

                <div className={cls.MetaRow}>
                    {context.showYear && (
                        <>
                            <EditableYear {...context.yearProps} />
                            <span>·</span>
                        </>
                    )}
                    <TrackCountLabel {...context.trackCountProps} />
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

            <PlaylistControls {...context.controlsProps} />

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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
