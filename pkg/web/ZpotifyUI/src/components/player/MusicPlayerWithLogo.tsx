import cn from "classnames";
import {useEffect, useState} from "react";

import cls from "@/components/player/MusicPlayerWithLogo.module.css";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";

interface MusicPlayerProps {
    audioPlayer: AudioPlayer
}

export default function MusicPlayerWithLogo({audioPlayer}: MusicPlayerProps) {
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        console.log(123)
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
