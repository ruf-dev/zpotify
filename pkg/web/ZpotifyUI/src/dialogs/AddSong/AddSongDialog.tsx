import React from "react";

import cls from "@/dialogs/AddSong/AddSongDialog.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import {User} from "@/hooks/user/User.ts";

import Button from "@/components/shared/Button.tsx";
import Chip from "@/components/shared/Chip.tsx";
import FilesList from "@/dialogs/FileList/FilesList.tsx";

interface AddSongDialogProps {
    user: User;
    previousScreen?: React.JSX.Element;
}

export default function AddSongDialog({user, previousScreen}: AddSongDialogProps) {
    const {OpenDialog, CloseDialog} = useDialog();

    return (
        <div className={cls.AddSongDialog}>
            <div className={cls.CloseButton}>
                <Chip value="×" onClick={CloseDialog}/>
            </div>
            {previousScreen && (
                <div className={cls.Header}>
                    <Button
                        title="<"
                        onClick={() => OpenDialog(previousScreen)}
                    />
                </div>
            )}
            <Button
                className={cls.DialogButton}
                title="choose from uploaded"
                onClick={() => OpenDialog(
                    <FilesList user={user} previousScreen={<AddSongDialog user={user} previousScreen={previousScreen}/>}/>
                )}
            />
            <Button
                className={cls.DialogButton}
                title="upload new"
                onClick={() => {
                }}
            />
        </div>
    )
}
