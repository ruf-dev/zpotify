import {useState} from "react";
import cn from "classnames";
import {useNavigate} from "react-router-dom";

import cls from "@/pages/home/segments/PlaylistHomeSegment.module.css";
import Pen from "@/assets/pen.svg";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {playlistPath} from "@/app/routing/Router.tsx";

import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";
import IconButton from "@/components/shared/IconButton.tsx";
import GhostSong from "@/components/song/GhostSong.tsx";

interface DisplayPlaylistSegmentProps {
    audioPlayer: AudioPlayer;
    user: User;

    playlistUuid: string
}

export default function PlaylistHomeSegment({audioPlayer, user, playlistUuid}: DisplayPlaylistSegmentProps) {
    const navigate = useNavigate();
    const [isEditing, setEditing] = useState(false);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    return (
        <div className={cls.PlaylistSegmentContainer}>
            <div className={cls.Header}>
                <span className={cls.Title} onClick={() => navigate(playlistPath(playlistUuid))}>Global queue</span>
                <div className={cls.HeaderRight}>
                    {totalCount !== null && (
                        <span className={cls.TrackCount}>{totalCount} tracks</span>
                    )}
                    <IconButton
                        onClick={() => setEditing(!isEditing)}
                        iconPath={Pen}/>
                </div>
            </div>

            <LazyLoadSongsList
                audioPlayer={audioPlayer}
                user={user}
                playlistId={playlistUuid}
                onTotal={setTotalCount}
            />

            <div className={
                cn(cls.GhostButtonWrapper, {
                    [cls.hidden]: !isEditing,
                })}>
                <GhostSong
                    user={user}
                />
            </div>
        </div>
    )
}
