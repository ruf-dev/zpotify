import {JSX} from "react";

import PlayPauseButton from "@/components/player/buttons/PlayPauseButton.tsx";
import TrackRewindButton from "@/components/player/buttons/TrackRewindButton.tsx";

import cls from "@/components/player/PlayerControls.module.css"

export interface PlayerProps {
    isPlaying: boolean
    togglePlay: () => void
}

export default function PlayerControls({isPlaying, togglePlay}: PlayerProps): JSX.Element {
    return (
        <div className={cls.PlayerControlsWrapper}>
            <TrackRewindButton
                previous
            />
            <PlayPauseButton
                isPlaying={isPlaying}
                onClick={() => togglePlay()}
            />
            <TrackRewindButton
                next
            />
        </div>
    )
}
