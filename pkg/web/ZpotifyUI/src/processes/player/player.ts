import {useState} from "react";

export interface AudioPlayer {
    isPlaying: boolean;
    togglePlay: () => boolean;
    preload: (trackUrl: string) => void;
}

export default function useAudioPlayer(): AudioPlayer {
    const [audio] = useState(() => new Audio());

    const [isPlaying, setIsPlaying] = useState(false);


    function togglePlay(): boolean {
        if (!audio.src) {
            return false
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            audio.play().catch((err) => {
                console.log(err)
            });
        }

        return isPlaying
    }

    function preload(trackUrl: string): void {
        audio.src = trackUrl
        audio.load()
    }


    return {
        isPlaying,
        togglePlay,
        preload
    }
}
