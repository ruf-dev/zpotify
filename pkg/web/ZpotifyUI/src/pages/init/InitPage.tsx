import cn from 'classnames';
import {useEffect, useState} from "react";
import cls from '@/pages/init/InitPage.module.css';

import api from "@/app/api/api.ts";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {AudioPlayer} from "@/processes/player/player.ts";

interface InitPageProps {
    AudioPlayer: AudioPlayer
}

export default function InitPage({AudioPlayer}: InitPageProps) {
    const trackUrl = `${api()}/wapi/audio?fileId=AgADBGcAAscmoEg`;

    const [isClickedOnLogo, setIsClickedOnLogo] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(false);


    useEffect(() => {
        AudioPlayer.preload(trackUrl)
    }, []);

    useEffect(() => {
        if (isFirstClick) {
            AudioPlayer.togglePlay()
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


            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
