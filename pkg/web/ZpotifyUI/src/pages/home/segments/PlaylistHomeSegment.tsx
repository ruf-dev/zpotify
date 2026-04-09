import cls from "@/pages/home/segments/PlaylistHomeSegment.module.css";

import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

interface DisplayPlaylistSegmentProps {
    audioPlayer: AudioPlayer;
    user: User;

    playlistUuid: string
}

export default function PlaylistHomeSegment({audioPlayer, user, playlistUuid}: DisplayPlaylistSegmentProps) {

    return (
        <div>
            <div className={cls.Tittle}>{"Global queue"}</div>
            <LazyLoadSongsList
                audioPlayer={audioPlayer}
                user={user}
                playlistId={playlistUuid}
            />
        </div>
    )
}
