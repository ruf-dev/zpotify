import cls from "@/pages/home/segments/PlaylistHomeSegment.module.css";
import Pen from "@/assets/pen.svg";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";
import IconButton from "@/components/shared/IconButton.tsx";
import {useState} from "react";
import GhostSong from "@/components/song/GhostSong.tsx";
import cn from "classnames";

interface DisplayPlaylistSegmentProps {
    audioPlayer: AudioPlayer;
    user: User;

    playlistUuid: string
}

export default function PlaylistHomeSegment({audioPlayer, user, playlistUuid}: DisplayPlaylistSegmentProps) {
    const [isEditing, setEditing] = useState(false);

    function addSongClicked() {
    }

    return (
        <div className={cls.PlaylistSegmentContainer}>
            <div className={cls.Tittle}>{"Global queue"}</div>
            <LazyLoadSongsList
                audioPlayer={audioPlayer}
                user={user}
                playlistId={playlistUuid}
            />


            <div className={
                cn(cls.GhostButtonWrapper, {
                    [cls.hidden]: !isEditing,
                })}>
                <GhostSong
                    onClick={addSongClicked}
                    user={user}
                />
            </div>

            <div className={cls.EditButton}>
                <IconButton
                    onClick={() => setEditing(!isEditing)}
                    iconPath={Pen}/>
            </div>
        </div>
    )
}
