import {useState} from "react";
import api from "@/app/api/api.ts";

export interface AudioPlayer {
    isPlaying: boolean;
    togglePlay: () => boolean;
    preload: (trackUniqueId: string) => void;
    play: (trackUniqueId: string) => void;
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

    function preload(trackUniqueId: string): void {
        audio.src = `${api()}/wapi/audio?fileId=${trackUniqueId}`
        audio.load()
    }

    function play(trackUniqueId: string): void {
        audio.src = `${api()}/wapi/audio?fileId=${trackUniqueId}`
        audio.load()

        setIsPlaying(false);
        togglePlay()
    }


    return {
        isPlaying,
        togglePlay,
        preload,
        play,
    }
}
