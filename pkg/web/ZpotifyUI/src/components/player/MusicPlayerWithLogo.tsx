import cn from "classnames";
import {useEffect, useState} from "react";

import cls from "@/components/player/MusicPlayerWithLogo.module.css";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import AnimatedZ from "@/assets/AnimatedZ.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import VolumeControls from "@/components/player/buttons/VolumeControls.tsx";
import TrackProgressControls from "@/components/player/buttons/TrackProgressControls.tsx";
import ShuffleTracksButton from "@/components/player/buttons/ShuffleTracksButton.tsx";

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

    const logoSizeEm = 4;
    const controlsSizeEm = 8;
    const shuffleSizeEm = 2;
    const volumeSizeEm = 4.25;

    return (
        <div
            className={cls.Player}
            style={{
                "width": `${isOpened ? `${logoSizeEm + controlsSizeEm + shuffleSizeEm + volumeSizeEm}` : '4'}em`
            }}
        >

            <div className={cn(cls.TrackProgressControlsWrapper,
                {[cls.open]: isOpened})}>
                <TrackProgressControls audioPlayer={audioPlayer}/>
            </div>

            <div className={cn(cls.PlayerControls,
                {[cls.open]: isOpened,})}>

                <PlayerControls audioPlayer={audioPlayer}/>

                <div className={cls.ShuffleWrapper}>
                    <ShuffleTracksButton
                        onClick={() => {
                        }}/>
                </div>

                <div className={cls.VolumeControlWrapper}>
                    <VolumeControls audioPlayer={audioPlayer}/>
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
