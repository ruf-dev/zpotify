import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Playlist } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export interface UsePlaylistInfoSegmentParams {
    playlist: Playlist;
    editMode: boolean;
    onExitEditMode: () => void;
}

export function usePlaylistInfoSegment({ playlist, editMode, onExitEditMode }: UsePlaylistInfoSegmentParams) {
    const coverUrl = buildCoverUrl(playlist.coverFilePath);
    const artistName = playlist.artists?.[0]?.name ?? 'Unknown Artist';
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
        if (!editMode) return;
        setEditName(playlist.name ?? '');
        setEditDesc(playlist.description ?? '');
        setEditYear(playlist.year ?? undefined);
        setEditArtists(
            (playlist.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! })),
        );
        setEditCover(undefined);
        setCoverPreviewUrl(undefined);
    }, [editMode]);

    const loadArtistOptions = useCallback(
        (query: string): Promise<ArtistItem[]> =>
            artistsService
                .ListArtist(query, 0, 8)
                .then((res) =>
                    (res.artists ?? []).filter((a) => a.name && a.uuid).map((a) => ({ id: a.uuid!, name: a.name! })),
                ),
        [],
    );

    const handleCreateArtist = useCallback(async function handleCreateArtist(_name: string): Promise<ArtistItem> {
        alert('TODO: create artist');
        throw new Error('not implemented');
    }, []);

    async function handleSave() {
        if (saving) return;
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

    const playlistIsAlbum = isAlbum(playlist);
    const displayCoverUrl = coverPreviewUrl ?? coverUrl;

    return {
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
    };
}
