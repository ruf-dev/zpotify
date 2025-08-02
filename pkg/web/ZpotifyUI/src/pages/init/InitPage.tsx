import cn from 'classnames';

import api from "@/app/api/api.ts";

import cls from '@/pages/init/InitPage.module.css';

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {useState} from "react";

export default function InitPage() {
    const trackUrl = `${api()}/wapi/audio?fileId=AgADBGcAAscmoEg`;

    const [isOpen, setIsOpen] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className={cls.InitPage}>
            <div className={
                cn(cls.Player, {
                    [cls.open]: isOpen
                })}>

                <div className={
                    cn(cls.PlayerControls, {
                        [cls.open]: isOpen,
                    })}>
                    <PlayerControls
                        trackUrl={trackUrl}
                        onPlayToggle={setIsPlaying}
                    />
                </div>
                <div
                    className={cn(cls.Logo, {
                        [cls.playing]: isPlaying
                    })}
                    onClick={() => setIsOpen(!isOpen)}>
                    <AnimatedZ/>
                </div>

            </div>
            <p className={cls.WorkInProgressHeader}>
                Soon, There will be some great music. Keep in touch
            </p>
        </div>
    )
}
