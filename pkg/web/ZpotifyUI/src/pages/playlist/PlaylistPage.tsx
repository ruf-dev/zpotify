import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import cls from "@/pages/playlist/PlaylistPage.module.css";

import {AudioPlayer} from "@/widgets/MusicPlayer/usePlayer.ts";
import useUser from "@/entities/user/useUser.ts";
import {Path} from "@/app/routing/Router.tsx";

import LazyLoadSongsList from "@/widgets/TrackList/LazyLoadSongsList.tsx";
import HeaderPart from "@/widgets/Header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx";
import {usePlaylist} from "@/pages/playlist/usePlaylist.ts";

interface PlaylistPageProps {
    audioPlayer: AudioPlayer
}

export default function PlaylistPage({audioPlayer}: PlaylistPageProps) {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState<number | null>(null);

    const userData = useUser(state => state.userData);
    const auth = useUser(state => state.auth);
    const {playlistName} = usePlaylist(id);

    useEffect(() => {
        if (!userData) {
            if (!auth.session) navigate(Path.IntiPage);
        }
    }, [userData, auth.session]);

    if (!id || !userData) return null;

    return (
        <div className={cls.PlaylistPageContainer}>
            <div className={cls.Header}>
                <HeaderPart/>
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
