import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { EditableArtistPickerContext } from '@/widgets/PlaylistScreen/components/EditableArtistPicker/EditableArtistPicker.tsx';
import type { EditableCoverWithFallbackProps } from '@/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx';
import type { EditableAlbumNameProps } from '@/widgets/PlaylistScreen/components/EditableAlbumName/EditableAlbumName.tsx';
import type { EditableYearProps } from '@/widgets/PlaylistScreen/components/EditableYear/EditableYear.tsx';
import type { TrackCountLabelProps } from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.tsx';
import type { PlaylistOwnerLabelProps } from '@/widgets/PlaylistScreen/components/PlaylistOwnerLabel/PlaylistOwnerLabel.tsx';
import type { PlaylistControlsProps } from '@/widgets/PlaylistScreen/widgets/PlaylistControls/PlaylistControls.tsx';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useEagerFileUpload } from '@/shared/lib/useEagerFileUpload.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export interface UsePlaylistInfoSegmentParams {
    playlist: Playlist;
    songs: SongBase[];
    trackCount: number;
    totalDuration: string;
    onPlay: () => void;
    isPlaying: boolean;
    editMode: boolean;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
}

export function usePlaylistInfoSegment(params: UsePlaylistInfoSegmentParams) {
    const { playlist, editMode } = params;
    const artistName = playlist.artists?.[0]?.name ?? 'Unknown Artist';
    const artistUuid = playlist.artists?.[0]?.uuid;
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const queryClient = useQueryClient();
    const toaster = useToaster();
    const refreshPlaylists = usePlaylistListRefresh((s) => s.refresh);

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editYear, setEditYear] = useState<number | undefined>();
    const [editArtists, setEditArtists] = useState<ArtistItem[]>([]);
    const [editCover, setEditCover] = useState<File | undefined>();
    const coverUpload = useEagerFileUpload();

    useEffect(() => {
        if (!editMode) return;
        setEditName(playlist.name ?? '');
        setEditDesc(playlist.description ?? '');
        setEditYear(playlist.year ?? undefined);
        setEditArtists(
            (playlist.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! })),
        );
        setEditCover(undefined);
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
            const coverFileId = editCover ? await coverUpload.resolveFileId() : undefined;
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
            await queryClient.invalidateQueries({ queryKey: ['playlist', playlist.uuid] });
            refreshPlaylists();
            params.onExitEditMode();
        } catch (e) {
            toaster.catch(e as never);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        coverUpload.cancel();
        params.onExitEditMode();
    }

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    function handleCoverFileSelect(file: File) {
        setEditCover(file);
        coverUpload.startUpload(file);
    }

    function handleYearChange(value: string) {
        setEditYear(value ? Number(value) : undefined);
    }

    const playlistIsAlbum = isAlbum(playlist);
    const showYear = playlist.year != null || editMode;

    const coverProps: EditableCoverWithFallbackProps = {
        coverFilePath: playlist.coverFilePath,
        uuid: playlist.uuid,
        name: playlist.name,
        isEditing: editMode,
        onFileSelect: handleCoverFileSelect,
        uploadProgress: coverUpload.progress,
        disabled: saving,
    };

    const albumNameProps: EditableAlbumNameProps = {
        displayValue: editMode ? editName : (playlist.name ?? ''),
        isEditing: editMode,
        onChange: setEditName,
    };

    const yearProps: EditableYearProps = {
        displayValue: editMode ? String(editYear ?? '') : String(playlist.year ?? ''),
        isEditing: editMode,
        onChange: handleYearChange,
    };

    const trackCountProps: TrackCountLabelProps = {
        displayValue: `${params.trackCount} tracks`,
        totalDuration: params.totalDuration,
    };

    const ownerLabelProps: PlaylistOwnerLabelProps = {
        ownerUsername: playlist.ownerUsername,
    };

    const artistPicker: EditableArtistPickerContext = {
        displayName: artistName,
        displayUuid: artistUuid,
        isEditing: editMode,
        artists: editArtists,
        onChange: setEditArtists,
        loadOptions: loadArtistOptions,
        onCreateArtist: handleCreateArtist,
    };

    const controlsProps: PlaylistControlsProps = {
        playlist,
        songs: params.songs,
        onPlay: params.onPlay,
        isPlaying: params.isPlaying,
        editMode,
        saving,
        onSave: handleSave,
        onCancel: handleCancel,
        onEnterEditMode: params.onEnterEditMode,
    };

    return {
        playlistIsAlbum,
        showYear,

        aboutExpanded,
        handleToggleAbout,

        coverProps,
        albumNameProps,
        yearProps,
        trackCountProps,
        ownerLabelProps,
        artistPicker,
        controlsProps,

        editDesc,
        setEditDesc,
    };
}
