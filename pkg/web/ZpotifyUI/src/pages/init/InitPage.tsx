import cn from 'classnames';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import api from "@/app/api/api.ts";
import {AudioPlayer} from "@/processes/player/player.ts";

import cls from '@/pages/init/InitPage.module.css';

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {Path} from "@/app/routing/Router.tsx";

interface InitPageProps {
    AudioPlayer: AudioPlayer
}

export default function InitPage({AudioPlayer}: InitPageProps) {
    const trackUrl = `${api()}/wapi/audio?fileId=AgADBGcAAscmoEg`;

    const navigate = useNavigate();

    const [isClickedOnLogo, setIsClickedOnLogo] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            if (isClickedOnLogo) {
                console.log(isClickedOnLogo);
                navigate(Path.HomePage)
            }
        }, 2000)
    }, [isClickedOnLogo]);

    return (
        <div className={cls.InitPage}>
            <div className={
                cn(cls.Player, {
                    [cls.open]: isClickedOnLogo,
                })}>

                <div className={
                    cn(cls.PlayerControls, {
                        [cls.open]: isClickedOnLogo,
                    })}>
                    <PlayerControls
                        isPlaying={AudioPlayer.isPlaying}
                        togglePlay={() => AudioPlayer.togglePlay(trackUrl)}
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
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
