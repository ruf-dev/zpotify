import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Artist, GetArtistPageResponse } from '@/app/api/zpotify';
import type { EditableCoverWithFallbackProps } from '@/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx';
import type { EditControlsProps } from '@/components/EditControls/EditControls.tsx';
import type { EditableArtistNameProps } from '@/widgets/ArtistScreen/components/EditableArtistName/EditableArtistName.tsx';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { useEagerFileUpload } from '@/shared/lib/useEagerFileUpload.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export interface UseArtistHeroSegmentParams {
    artist: Artist;
    editMode: boolean;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
}

export function useArtistHeroSegment(params: UseArtistHeroSegmentParams) {
    const { artist, editMode } = params;
    const [saving, setSaving] = useState(false);
    const queryClient = useQueryClient();
    const toaster = useToaster();

    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState<File | undefined>();
    const [editBackgroundCover, setEditBackgroundCover] = useState<File | undefined>();
    const avatarUpload = useEagerFileUpload();
    const backgroundCoverUpload = useEagerFileUpload();

    useEffect(() => {
        if (!editMode) return;
        setEditName(artist.name ?? '');
        setEditAvatar(undefined);
        setEditBackgroundCover(undefined);
    }, [editMode]);

    function handleAvatarFileSelect(file: File) {
        setEditAvatar(file);
        avatarUpload.startUpload(file);
    }

    function handleBackgroundCoverFileSelect(file: File) {
        setEditBackgroundCover(file);
        backgroundCoverUpload.startUpload(file);
    }

    function handleSave() {
        if (saving) return;
        setSaving(true);

        const uuid = artist.uuid ?? '';

        Promise.all([
            editAvatar ? avatarUpload.resolveFileId() : Promise.resolve(undefined),
            editBackgroundCover ? backgroundCoverUpload.resolveFileId() : Promise.resolve(undefined),
        ])
            .then(([avatarFileId, backgroundCoverFileId]) =>
                artistsService.UpdateArtist(uuid, editName.trim(), avatarFileId, backgroundCoverFileId),
            )
            .then((response) => {
                queryClient.setQueryData(
                    ['artist-page', uuid],
                    (old: GetArtistPageResponse | null | undefined): GetArtistPageResponse | null | undefined => {
                        if (!old?.artist) return old;
                        return {
                            ...old,
                            artist: {
                                ...old.artist,
                                name: editName.trim() || old.artist.name,
                                avatarFilePath: response.avatarFilePath ?? old.artist.avatarFilePath,
                                backgroundCoverFilePath:
                                    response.backgroundCoverFilePath ?? old.artist.backgroundCoverFilePath,
                            },
                        };
                    },
                );
                setEditAvatar(undefined);
                setEditBackgroundCover(undefined);
                params.onExitEditMode();
            })
            .catch((e: unknown) => toaster.catch(e as never))
            .finally(() => setSaving(false));
    }

    function handleCancel() {
        avatarUpload.cancel();
        backgroundCoverUpload.cancel();
        params.onExitEditMode();
    }

    const avatarProps: EditableCoverWithFallbackProps = {
        coverFilePath: artist.avatarFilePath,
        uuid: artist.uuid,
        name: artist.name,
        isEditing: editMode,
        onFileSelect: handleAvatarFileSelect,
        uploadProgress: avatarUpload.progress,
        disabled: saving,
        shape: 'circle',
    };

    const backgroundCoverProps: EditableCoverWithFallbackProps = {
        coverFilePath: artist.backgroundCoverFilePath,
        uuid: artist.uuid,
        name: artist.name,
        isEditing: editMode,
        onFileSelect: handleBackgroundCoverFileSelect,
        uploadProgress: backgroundCoverUpload.progress,
        disabled: saving,
        shape: 'rect',
    };

    const nameProps: EditableArtistNameProps = {
        displayValue: editMode ? editName : (artist.name ?? ''),
        isEditing: editMode,
        onChange: setEditName,
    };

    const editControlsProps: EditControlsProps = {
        canEdit: artist.canEdit,
        editMode,
        saving,
        onSave: handleSave,
        onCancel: handleCancel,
        onEnterEditMode: params.onEnterEditMode,
    };

    return {
        avatarProps,
        backgroundCoverProps,
        nameProps,
        editControlsProps,
    };
}
