import cls from "@/components/song/GhostSong.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import {User} from "@/hooks/user/User.ts";
import AddTrackModal from "@/dialogs/AddTrack/AddTrackModal.tsx";

interface GhostSongProps {
    user: User;

}

export default function GhostSong({user}: GhostSongProps) {
    const {OpenDialog} = useDialog();

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        OpenDialog(<AddTrackModal playlists={[]} artistOptions={[]} services={user.Services()}/>);
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
