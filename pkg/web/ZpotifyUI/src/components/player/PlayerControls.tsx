import {JSX, useEffect} from "react";
import useAudioPlayer from "@/processes/player/player.ts";

import PlayPauseButton from "@/components/player/buttons/PlayPauseButton.tsx";
import TrackRewindButton from "@/components/player/buttons/TrackRewindButton.tsx";

import cls from "@/components/player/PlayerControls.module.css"

export interface PlayerProps {
    trackUrl: string
    onPlayToggle?: (isPlaying: boolean) => void
}

export default function PlayerControls({trackUrl, onPlayToggle}: PlayerProps): JSX.Element {
    if (!onPlayToggle) {
        onPlayToggle = (_: boolean) => {}
    }

    const {isPlaying, togglePlay} = useAudioPlayer();

    useEffect(() => {
        onPlayToggle(isPlaying);
    }, [isPlaying]);

    return (
        <div className={cls.PlayerControlsWrapper}>
            <TrackRewindButton
                previous
            />
            <PlayPauseButton
                isPlaying={isPlaying}
                onClick={() => togglePlay(trackUrl)}
            />
            <TrackRewindButton
                next
            />
        </div>
    )
}
