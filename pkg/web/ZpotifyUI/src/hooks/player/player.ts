import { useEffect, useState } from "react";
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

    onEnd: (callback: () => string | undefined) => void;

    progress: number;
}

export default function useAudioPlayer(): AudioPlayer {
    const [audio] = useState(() => new Audio());

    const [volume, setVolume] = useState(36);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [songUniqueId, setSongUniqueId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0); // 0–100 percentage

    useEffect(() => {
        audio.volume = volume / 100;
    }, [volume, audio]);

    function startPlay() {
        audio.play();
        setIsPlaying(true);
    }

    function togglePlay(): boolean {
        if (!audio.src) return false;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            startPlay();
        }

        return isPlaying;
    }

    function toggleMute() {
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    }

    function preload(trackUniqueId: string): void {
        const src = `${api()}/wapi/audio?fileId=${trackUniqueId}`;
        if (audio.src === src) return;

        audio.src = src;
        audio.load();
        setSongUniqueId(trackUniqueId);
    }

    function play(trackUniqueId: string): void {
        preload(trackUniqueId);
        startPlay();
        setSongUniqueId(trackUniqueId);
    }

    function onEnd(getNext: () => string | undefined): void {
        audio.onended = () => {
            const nextUniqueId = getNext();
            if (!nextUniqueId) return;
            preload(nextUniqueId);
        };
    }

    // sync progress from audio
    useEffect(() => {
        const handleTimeUpdate = () => {
            if (!audio.duration) return;
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [audio]);

    return {
        isPlaying,

        togglePlay,
        preload,
        play,

        volume,
        setVolume,
        toggleMute,
        isMuted,

        songUniqueId,

        onEnd,

        progress,
    };
}
