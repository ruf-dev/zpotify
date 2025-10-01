import {useEffect, useState} from "react";
import api from "@/app/api/api.ts";

export interface AudioPlayer {
    isPlaying: boolean;

    togglePlay: () => boolean;
    preload: (trackUniqueId: string) => void;
    unload: () => void;
    play: (trackUniqueId: string) => void;

    setVolume: (volume: number) => void;
    volume: number;
    toggleMute: () => void;
    isMuted: boolean;

    songUniqueId: string | null;

    onEnd: (callback: () => void) => void;

    progress: number;
    setProgress: (percent: number) => void

    playNext: () => void
    playPrev: () => void

    setNext: (val: string | undefined) => void
    setPrev: (val: string | undefined) => void

    shuffleHash: number | null
    setShuffleHash: (hash: number | null) => void
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
        audio
            .play().then()
            .catch(r => console.error(`Error during playing!!!!!!`, r));

        setIsPlaying(true);
    }

    function togglePlay(): boolean {
        if (songUniqueId == null) return false;

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
    }

    function onEnd(onended: () => void): void {
        audio.onended = onended;
    }

    function setTrackProgress(progress: number): void {
        audio.currentTime = audio.duration * (progress / 100);
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


    const [nextUniqueId, setNextUniqueId] = useState<string | undefined>();
    const [prevUniqueId, setPrevUniqueId] = useState<string | undefined>();

    function playNext() {
        if (nextUniqueId) {
            play(nextUniqueId)
        }
    }

    function playPrev() {
        if (prevUniqueId) {
            play(prevUniqueId)
        }
    }

    const [shuffleHash, setShuffleHash] = useState<number | null>(null);

    return {
        isPlaying,

        preload,
        unload: () => {
            audio.src = '';
            setSongUniqueId(null)
        },
        play,
        togglePlay,

        volume,
        setVolume,
        toggleMute,
        isMuted,

        songUniqueId,

        onEnd,

        progress,
        setProgress: setTrackProgress,

        playNext,
        playPrev,

        setNext: setNextUniqueId,
        setPrev: setPrevUniqueId,

        shuffleHash,
        setShuffleHash,
    };
}
