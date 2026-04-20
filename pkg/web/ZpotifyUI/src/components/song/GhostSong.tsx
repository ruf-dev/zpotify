
import cls from "@/components/song/GhostSong.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import AddSongDialog from "@/components/song/AddSongDialog.tsx";

interface GhostSongProps {
    onClick?: () => void;
}

export default function GhostSong({onClick}: GhostSongProps) {
    const {OpenDialog} = useDialog();

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        OpenDialog(<AddSongDialog />);
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
