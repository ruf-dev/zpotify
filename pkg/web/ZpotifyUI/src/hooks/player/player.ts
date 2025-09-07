import {useEffect, useState} from "react";
import api from "@/app/api/api.ts";

export interface AudioPlayer {
    isPlaying: boolean;

    togglePlay: () => boolean;
    preload: (trackUniqueId: string) => void;
    play: (trackUniqueId: string) => void;

    setVolume: (volume: number) => void;
    volume: number;
    toggleMute: () => void;
    isMuted: boolean;

    songUniqueId: string | null;
}

export default function useAudioPlayer(): AudioPlayer {
    const [audio] = useState(() => new Audio());

    const [volume, setVolume] = useState(36);
    const [isMuted, setIsMuted] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    const [songUniqueId, setSongUniqueId] = useState<string | null>(null);

    useEffect(() => {
        audio.volume = volume / 100;
    }, [volume]);

    function startPlay() {
        audio.play()
        setIsPlaying(true);
    }

    function togglePlay(): boolean {
        if (!audio.src) {
            return false
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            startPlay()
        }

        return isPlaying
    }

    function toggleMute() {
        audio.muted = !isMuted
        setIsMuted(!isMuted)
    }

    function preload(trackUniqueId: string): void {
        audio.src = `${api()}/wapi/audio?fileId=${trackUniqueId}`
        audio.load()
        setSongUniqueId(trackUniqueId)
    }

    function play(trackUniqueId: string): void {
        audio.src = `${api()}/wapi/audio?fileId=${trackUniqueId}`
        audio.load()

        // setIsPlaying(false);
        startPlay()
        setSongUniqueId(trackUniqueId)
    }

    return {
        isPlaying,

        togglePlay,
        preload,
        play,

        volume,
        setVolume,
        toggleMute,
        isMuted,

        songUniqueId
    }
}
