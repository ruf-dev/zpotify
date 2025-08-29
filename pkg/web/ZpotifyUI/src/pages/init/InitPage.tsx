import cn from 'classnames';
import {useEffect, useState} from "react";
import cls from '@/pages/init/InitPage.module.css';

import api from "@/app/api/api.ts";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/user.ts";
import AuthMethodsWidget from "@/widgets/AuthMethods/AuthMethodsWidget.tsx";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";

interface InitPageProps {
    AudioPlayer: AudioPlayer

    UserState: User
}

export default function InitPage({AudioPlayer, UserState}: InitPageProps) {
    const trackUrl = `${api()}/wapi/audio?fileId=AgADBGcAAscmoEg`;

    const [isClickedOnLogo, setIsClickedOnLogo] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (UserState.userData) {
            navigate(Path.HomePage)
        }
    }, [UserState.userData]);

    useEffect(() => {
        AudioPlayer.preload(trackUrl)
    }, []);

    useEffect(() => {
        if (isFirstClick) {
            // TODO
            // AudioPlayer.togglePlay()
        }
        setIsFirstClick(true)
    }, [isClickedOnLogo]);

    return (
        <div className={cls.InitPage}>
            <div className={cn(cls.Player, {
                [cls.open]: isClickedOnLogo,
            })}>
                <div className={
                    cn(cls.PlayerControls, {
                        [cls.open]: isClickedOnLogo,
                    })}>
                    <PlayerControls
                        isPlaying={AudioPlayer.isPlaying}
                        togglePlay={() => AudioPlayer.togglePlay()}
                    />
                </div>

                <div
                    className={cn(cls.Logo, {
                        [cls.playing]: isClickedOnLogo
                    })}
                    onClick={() => setIsClickedOnLogo(true)}>
                    <AnimatedZ/>
                </div>
            </div>

            <AuthMethodsWidget
                UserState={UserState}
            />

            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
