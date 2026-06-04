import cls from "@/components/song/GhostSong.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import AddTrackDialog from "@/dialogs/AddTrack/AddTrackDialog.tsx";

export default function GhostSong() {
    const {OpenDialog} = useDialog();

    function handleOnClick(e: React.MouseEvent) {
        e.stopPropagation();
        OpenDialog(<AddTrackDialog/>);
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
