import cls from "@/pages/home/HomePage.module.css"

import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

import {Path} from "@/app/routing/Router.tsx";
import HeaderPart from "@/parts/header/HeaderPart.tsx";
import LazyLoadSongsList from "@/parts/InfiniteSongList/LazyLoadSongsList.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";
import cn from "classnames";

interface HomePageProps {
    audioPlayer: AudioPlayer
    user: User
}

export default function HomePage({user, audioPlayer}: HomePageProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.userData) {
            navigate(Path.IntiPage)
        }
    }, [user.userData]);

    return (
        <div className={cls.HomePage}>
            <div className={cls.MainBody}>
                <div className={cn(cls.Section, cls.center)}>
                    <div className={cls.Tittle}>Global queue</div>
                    <LazyLoadSongsList
                        audioPlayer={audioPlayer}
                        user={user}
                    />
                </div>

                {user.userData?.permissions.canCreatePlaylist && (
                    <div className={cn(cls.Section, cls.right)}>
                        <div className={cls.Tittle}>Create playlist</div>
                    </div>
                )}
            </div>

            <div className={cls.Header}>
                <HeaderPart
                    user={user}/>
            </div>

            <div className={cls.Player}>
                <MusicPlayerWithLogo
                    audioPlayer={audioPlayer}
                />
            </div>
        </div>
    )
}
