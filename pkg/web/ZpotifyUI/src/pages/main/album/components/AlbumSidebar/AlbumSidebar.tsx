import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import cn from 'classnames';

import cls from '@/pages/main/album/components/AlbumSidebar/AlbumSidebar.module.css';
import type { Playlist } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';
import { ShareIcon } from '@/assets/icons/ShareIcon.tsx';
import EditIcon from '@/assets/icons/EditIcon.tsx';
import SaveIcon from '@/assets/icons/SaveIcon.tsx';
import { RemoveIcon } from '@/assets/icons/RemoveIcon.tsx';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import EditableText from '@/pages/main/album/components/EditableText/EditableText.tsx';
import EditableArtistPicker from '@/pages/main/album/components/EditableArtistPicker/EditableArtistPicker.tsx';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const SECTION_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;
const LAYOUT_SPRING = { type: 'spring', stiffness: 420, damping: 42, mass: 0.75 } as const;

function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFilePath ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
}

export interface AlbumSidebarProps {
    playlist: Playlist | null;
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

export default function AlbumSidebar({
    playlist,
    totalDuration,
    trackCount,
    saved,
    onToggleSave,
    onBack,
    onPlay,
    editMode,
    onEnterEditMode,
    onExitEditMode,
}: AlbumSidebarProps) {
    const seed = playlist ? resolveCoverSeed(playlist) : 1;
    const coverUrl = buildCoverUrl(playlist?.coverFilePath);
    const artistName = playlist?.artists?.[0]?.name ?? 'Unknown Artist';
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [coverHover, setCoverHover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const toaster = useToaster();

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editYear, setEditYear] = useState<number | undefined>();
    const [editArtists, setEditArtists] = useState<ArtistItem[]>([]);
    const [editCover, setEditCover] = useState<File | undefined>();
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>();

    useEffect(() => {
        if (!editMode || !playlist) return;
        setEditName(playlist.name ?? '');
        setEditDesc(playlist.description ?? '');
        setEditYear(playlist.year ?? undefined);
        setEditArtists(
            (playlist.artists ?? [])
                .filter((a) => a.uuid && a.name)
                .map((a) => ({ id: a.uuid!, name: a.name! })),
        );
        setEditCover(undefined);
        setCoverPreviewUrl(undefined);
    }, [editMode]);

    const loadArtistOptions = useCallback(
        (query: string): Promise<ArtistItem[]> =>
            artistsService
                .ListArtist(query, 0, 8)
                .then((res) =>
                    (res.artists ?? [])
                        .filter((a) => a.name && a.uuid)
                        .map((a) => ({ id: a.uuid!, name: a.name! })),
                ),
        [],
    );

    const handleCreateArtist = useCallback(async function handleCreateArtist(_name: string): Promise<ArtistItem> {
        alert('TODO: create artist');
        throw new Error('not implemented');
    }, []);

    async function handleSave() {
        if (saving || !playlist) return;
        setSaving(true);
        try {
            let coverFileId: string | undefined;
            if (editCover) {
                coverFileId = await webApiService.UploadFile(editCover);
            }
            const artistUuids = editArtists.map((a) => a.id);
            const response = await playlistService.UpdatePlaylist(
                playlist.uuid ?? '',
                editName.trim(),
                editDesc.trim(),
                artistUuids,
                coverFileId,
                editYear,
                [],
            );
            if (response.coverFilePath) {
                queryClient.setQueryData(['playlist', playlist.uuid], (old: Playlist | null | undefined) =>
                    old ? { ...old, coverFilePath: response.coverFilePath } : old,
                );
            }
            setEditCover(undefined);
            setCoverPreviewUrl(undefined);
            await queryClient.invalidateQueries({ queryKey: ['playlist', playlist.uuid] });
            onExitEditMode();
        } catch (e) {
            toaster.catch(e as never);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        onExitEditMode();
    }

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    function handleCoverMouseEnter() {
        setCoverHover(true);
    }

    function handleCoverMouseLeave() {
        setCoverHover(false);
    }

    function handleCoverClick() {
        if (!editMode) return;
        coverInputRef.current?.click();
    }

    function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditCover(file);
        setCoverPreviewUrl(URL.createObjectURL(file));
    }

    if (!playlist) {
        return (
            <div className={cls.SidebarContainer}>
                <BackButton onClick={onBack} />
                <div className={cls.ErrorState}>
                    <span className={cls.ErrorIcon}>!</span>
                    <p className={cls.ErrorTitle}>Album not found</p>
                    <p className={cls.ErrorHint}>This album may have been removed or is unavailable.</p>
                </div>
            </div>
        );
    }

    const isAlbum = (playlist.artists?.length ?? 0) > 0;
    const displayCoverUrl = coverPreviewUrl ?? coverUrl;

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
                <span className={cls.TypeLabel}>{isAlbum ? 'album' : 'playlist'}</span>

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

            <motion.div layout transition={LAYOUT_SPRING} className={cls.ActionRow}>
                <button className={cls.PlayButton} type="button" aria-label="Play album" onClick={onPlay}>
                    <PlayIcon className={cls.PlayIcon} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Shuffle">
                    <RandomArrows />
                </button>
                <button
                    className={cn(cls.IconButton, saved && cls.IconButtonActive)}
                    type="button"
                    aria-label={saved ? 'Remove from library' : 'Save to library'}
                    onClick={onToggleSave}
                >
                    <HeartIcon filled={saved} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Share">
                    <ShareIcon />
                </button>
                {playlist.canEdit && (
                    editMode ? (
                        <>
                            <button
                                className={cls.SaveIconButton}
                                type="button"
                                aria-label="Save changes"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <SaveIcon />
                            </button>
                            <button
                                className={cls.IconButton}
                                type="button"
                                aria-label="Cancel editing"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                <RemoveIcon />
                            </button>
                        </>
                    ) : (
                        <button
                            className={cn(cls.IconButton, cls.EditButton)}
                            type="button"
                            aria-label="Edit"
                            onClick={onEnterEditMode}
                        >
                            <EditIcon />
                        </button>
                    )
                )}
            </motion.div>

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
                        <button className={cls.ReadMoreToggle} type="button" onClick={handleToggleAbout}>
                            {aboutExpanded ? 'show less' : 'read more'}
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* TODO: restore credits and label sections after release — requires GetAlbum metadata endpoint */}
        </div>
    );
}
