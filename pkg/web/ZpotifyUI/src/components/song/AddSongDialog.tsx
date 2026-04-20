import cls from "@/components/song/AddSongDialog.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import {User} from "@/hooks/user/User.ts";

import Button from "@/components/shared/Button.tsx";
import FilesList from "@/components/song/FilesList.tsx";

interface AddSongDialogProps {
    user: User;
}

export default function AddSongDialog({user}: AddSongDialogProps) {
    const {OpenDialog} = useDialog();

    return (
        <div className={cls.AddSongDialog}>
            <Button
                className={cls.DialogButton}
                title="choose from uploaded"
                onClick={() => OpenDialog(
                    <FilesList user={user}/>
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
