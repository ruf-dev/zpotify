import cls from "@/pages/home/segments/PlaylistHomeSegment.module.css";

import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {useEffect, useState} from "react";
import {Playlist} from "@/model/Playlist.ts";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";

interface DisplayPlaylistSegmentProps {
    audioPlayer: AudioPlayer;
    user: User;

    playlistUuid: string
}

export default function PlaylistHomeSegment({audioPlayer, user, playlistUuid}: DisplayPlaylistSegmentProps) {
    const [playlist, setPlaylist] = useState<Playlist | undefined>()

    const toast = useToaster()

    useEffect(() => {
        user.Services().Playlist()
            .GetPlaylist(playlistUuid)
            .then(setPlaylist)
            .catch(toast.catch)
    }, []);

    if (!playlist) {
        // TODO loader
        return (<div>loading</div>)
    }

    return (
        <div>
            <div className={cls.Tittle}>{playlist?.title}</div>
            <LazyLoadSongsList
                audioPlayer={audioPlayer}
                user={user}
                playlistId={playlistUuid}
            />
        </div>
    )
}
