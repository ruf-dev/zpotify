import cn from "classnames";
import {useEffect, useState} from "react";

import cls from "@/components/player/MusicPlayerWithLogo.module.css";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import VolumeControls from "@/components/player/buttons/VolumeControls.tsx";

interface MusicPlayerProps {
    audioPlayer: AudioPlayer
}

export default function MusicPlayerWithLogo({audioPlayer}: MusicPlayerProps) {
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        if (audioPlayer.isPlaying) {
            setIsOpened(true)
        }
    }, [audioPlayer.isPlaying]);

    return (
        <div className={cn(cls.Player, {
            [cls.open]: isOpened,
        })}>
            <div className={
                cn(cls.PlayerControls, {
                    [cls.open]: isOpened,
                })}>
                <PlayerControls
                    isPlaying={audioPlayer.isPlaying}
                    togglePlay={() => audioPlayer.togglePlay()}
                />

                <div className={cls.VolumeControl}>
                    <VolumeControls
                        audioPlayer={audioPlayer}/>
                </div>
            </div>

            <div
                className={cn(cls.Logo, {
                    [cls.playing]: isOpened
                })}
                onClick={() => setIsOpened(!isOpened)}>
                <AnimatedZ/>
            </div>
        </div>
    )
}
