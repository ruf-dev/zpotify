import cls from "@/components/song/GhostSong.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import {User} from "@/hooks/user/User.ts";

import AddSongDialog from "@/dialogs/AddSong/AddSongDialog.tsx";

interface GhostSongProps {
    user: User;

    onClick?: () => void;
}

export default function GhostSong({onClick, user}: GhostSongProps) {
    const {OpenDialog} = useDialog();

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        OpenDialog(<AddSongDialog user={user}/>);
        onClick?.();
    }

    return (
        <div
            className={cls.GhostSong}
            onClick={handleOnClick}
        >
            + Add song
        </div>
    )
}
