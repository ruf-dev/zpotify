import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import cls from '@/pages/init/InitPage.module.css';

import AuthMethodsWidget from "@/widgets/AuthMethods/AuthMethodsWidget.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";
import {Path} from "@/app/routing/Router.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

interface InitPageProps {
    AudioPlayer: AudioPlayer

    UserState: User
}

export default function InitPage({AudioPlayer, UserState}: InitPageProps) {
    const trackId = `AgADBGcAAscmoEg`;

    const navigate = useNavigate();

    useEffect(() => {
        if (UserState.userData) {
            navigate(Path.HomePage)
            AudioPlayer.unload()
        }
    }, [UserState.userData]);

    useEffect(() => {
        AudioPlayer.preload(trackId)
    }, []);


    return (
        <div className={cls.InitPage}>
            <MusicPlayerWithLogo
                audioPlayer={AudioPlayer}
            />
            <AuthMethodsWidget
                UserState={UserState}
            />

            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
