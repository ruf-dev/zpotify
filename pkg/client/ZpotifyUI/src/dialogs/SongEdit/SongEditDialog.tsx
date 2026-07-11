import React, { useState } from 'react';
import { Input, ModalActions, ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/SongEdit/SongEditDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster, Toast } from '@/shared/lib/toaster/ToasterZ.ts';
import BackButton from '@/shared/ui/BackButton';
import Chip from '@/shared/ui/Chip.tsx';
import MultiSelect, { Option } from '@/shared/ui/MultiSelect.tsx';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { songsService } from '@/shared/api/Songs.ts';

interface SongEditDialogProps {
    fileId: string;
    path: string;
    initialTitle?: string;
    duration?: string;
    size?: string;
    previousScreen?: React.JSX.Element;
}

export default function SongEditDialog({
    fileId,
    path,
    initialTitle = 'Espresso',
    duration = '2:54',
    size = '6.7 MB',
    previousScreen,
}: SongEditDialogProps) {
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();

    const [title, setTitle] = useState(initialTitle);
    const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

    function doListArtists(query: string): Promise<Option[]> {
        return artistsService.ListArtist(query, 0, 20).then((resp) => {
            const artists = resp.artists || [];
            return artists
                .filter((a) => !!a.uuid && !!a.name)
                .map((a) => ({ id: a.uuid as string, label: a.name as string }));
        });
    }

    function handleSave() {
        songsService
            .CreateSong(title, selectedArtistIds, fileId)
            .then(() => {
                toaster.bake({ title: 'Song created successfully' } as Toast);
                CloseDialog();
            })
            .catch(toaster.catch);
    }

    return (
        <div className={cls.SongEditDialogContainer}>
            <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />

            <div className={cls.Header}>
                {previousScreen && <BackButton onClick={() => OpenDialog(previousScreen)} />}
                <div className={cls.PathContainer}>{path}</div>
            </div>

            <div className={cls.Form}>
                <Input label="Title" value={title} setValue={setTitle} />
                <MultiSelect
                    label="Artists"
                    selectedIds={selectedArtistIds}
                    onChange={setSelectedArtistIds}
                    doList={doListArtists}
                />

                <div className={cls.Chips}>
                    <Chip value={duration} label="duration" />
                    <Chip value={size} label="size" />
                    <Chip value={'hit'} />
                </div>
            </div>

            <ModalActions
                buttons={[{ label: 'Save', onClick: handleSave, className: cls.SaveButton }]}
                containerClassName={cls.Footer}
            />
        </div>
    );
}
