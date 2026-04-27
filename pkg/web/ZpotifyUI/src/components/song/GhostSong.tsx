import cls from "@/components/song/GhostSong.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import AddTrackModal from "@/dialogs/AddTrack/AddTrackModal.tsx";

export default function GhostSong() {
    const {OpenDialog} = useDialog();

    function handleOnClick(e: React.MouseEvent) {
        e.stopPropagation();
        OpenDialog(<AddTrackModal/>);
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
