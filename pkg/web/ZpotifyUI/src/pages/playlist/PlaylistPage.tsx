import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import cls from "@/pages/playlist/PlaylistPage.module.css";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import {Path} from "@/app/routing/Router.tsx";

import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";
import HeaderPart from "@/parts/header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";

interface PlaylistPageProps {
    audioPlayer: AudioPlayer
    user: User
}

export default function PlaylistPage({audioPlayer, user}: PlaylistPageProps) {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const toaster = useToaster();
    const [playlistName, setPlaylistName] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number | null>(null);

    useEffect(() => {
        if (!user.userData) {
            if (!user.session) navigate(Path.IntiPage);
            return;
        }
        if (!id) return;

        user.Services().Playlist().GetPlaylist(id)
            .then(res => setPlaylistName(res.playlist?.name ?? "Playlist"))
            .catch(toaster.catch);
    }, [id, user.userData, user.session]);

    if (!id || !user.userData) return null;

    return (
        <div className={cls.PlaylistPageContainer}>
            <div className={cls.Header}>
                <HeaderPart user={user}/>
            </div>

            <div className={cls.Content}>
                <div className={cls.TitleRow}>
                    <button className={cls.BackButton} onClick={() => navigate(Path.HomePage)}>←</button>
                    <h1 className={cls.Title}>{playlistName}</h1>
                    {totalCount !== null && (
                        <span className={cls.TrackCount}>{totalCount} tracks</span>
                    )}
                </div>

                <div className={cls.TrackList}>
                    <LazyLoadSongsList
                        audioPlayer={audioPlayer}
                        user={user}
                        playlistId={id}
                        fixedSize
                        onTotal={setTotalCount}
                    />
                </div>
            </div>

            <div className={cls.Player}>
                <MusicPlayerWithLogo audioPlayer={audioPlayer}/>
            </div>
        </div>
    );
}