import {JSX} from "react";

import PlayPauseButton from "@/components/player/buttons/PlayPauseButton.tsx";
import TrackRewindButton from "@/components/player/buttons/TrackRewindButton.tsx";

import cls from "@/components/player/PlayerControls.module.css"
import {AudioPlayer} from "@/hooks/player/player.ts";

export interface PlayerProps {
    audioPlayer: AudioPlayer
}

export default function PlayerControls({audioPlayer}: PlayerProps): JSX.Element {
    return (
        <div className={cls.PlayerControlsContainer}>
            <TrackRewindButton
                onClick={() => audioPlayer.playPrev()}
                isDisabled={audioPlayer.songUniqueId == null}
                previous
            />
            <PlayPauseButton
                isPlaying={audioPlayer.isPlaying}
                isDisabled={audioPlayer.songUniqueId == null}
                onClick={() => audioPlayer.togglePlay()}
            />
            <TrackRewindButton
                onClick={() => audioPlayer.playNext()}
                isDisabled={audioPlayer.songUniqueId == null}
                next
            />
        </div>
    )
}
