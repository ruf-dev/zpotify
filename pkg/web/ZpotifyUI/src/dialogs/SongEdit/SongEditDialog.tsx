import React, { useState } from 'react';

import cls from '@/dialogs/SongEdit/SongEditDialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import useUser from '@/entities/user/useUser.ts';
import { Toast, useToaster } from '@/hooks/toaster/ToasterZ.ts';
import Button from '@/shared/ui/Button.tsx';
import Input from '@/shared/ui/Input.tsx';
import Chip from '@/shared/ui/Chip.tsx';
import MultiSelect, { Option } from '@/shared/ui/MultiSelect.tsx';

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
    const user = useUser();
    const toaster = useToaster();

    const [title, setTitle] = useState(initialTitle);
    const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

    const doListArtists = async (query: string): Promise<Option[]> => {
        const resp = await user.Services().Artists().ListArtist(query, 0, 20);

        const artists = resp.artists || [];
        return artists
            .filter((a) => !!a.uuid && !!a.name)
            .map((a) => ({ id: a.uuid as string, label: a.name as string }));
    };

    return (
        <div className={cls.SongEditDialog}>
            <div className={cls.CloseButton}>
                <Chip value="×" onClick={CloseDialog} />
            </div>

            <div className={cls.Header}>
                {previousScreen && <Button title="<" onClick={() => OpenDialog(previousScreen)} />}
                <div className={cls.PathContainer}>{path}</div>
            </div>

            <div className={cls.Form}>
                <Input label="Title" inputValue={title} onChange={setTitle} />
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

            <div className={cls.Footer}>
                <Button
                    title="Save"
                    onClick={() => {
                        user.Services()
                            .Songs()
                            .CreateSong(title, selectedArtistIds, fileId)
                            .then(() => {
                                toaster.bake({ title: 'Song created successfully' } as Toast);
                                CloseDialog();
                            })
                            .catch(toaster.catch);
                    }}
                />
            </div>
        </div>
    );
}
