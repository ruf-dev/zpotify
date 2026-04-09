import {useMemo} from "react";
import {create} from "zustand";

export interface AudioPlayer {
    isPlaying: boolean;

    togglePlay: () => boolean;
    preload: (id: string) => void;
    unload: () => void;
    play: (id: string) => void;

    setVolume: (volume: number) => void;
    volume: number;
    toggleMute: () => void;
    isMuted: boolean;

    songUrl: string | null;

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

interface AudioStoreState {
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    songUniqueId: string | null;
    progress: number;
    nextTrackUrl: string | undefined;
    prevTrackUrl: string | undefined;
    shuffleHash: number | null;
}

const useAudioStore = create<AudioStoreState>(() => ({
    isPlaying: false,
    volume: 36,
    isMuted: false,
    songUniqueId: null,
    progress: 0,
    nextTrackUrl: undefined,
    prevTrackUrl: undefined,
    shuffleHash: null,
}));

class AudioPlayerImpl implements AudioPlayer {
    private audio: HTMLAudioElement;
    private onendedCallback: (() => void) | null = null;

    constructor() {
        this.audio = new Audio();
        this.setupEventListeners();
        this.setupMediaSession();
    }

    private setupEventListeners() {
        this.audio.addEventListener("timeupdate", () => {
            if (!this.audio.duration) return;
            useAudioStore.setState({
                progress: (this.audio.currentTime / this.audio.duration) * 100
            });
        });

        this.audio.addEventListener("play", () => {
            useAudioStore.setState({isPlaying: true});
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }
        });

        this.audio.addEventListener("pause", () => {
            useAudioStore.setState({isPlaying: false});
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "paused";
            }
        });

        this.audio.addEventListener("ended", () => {
            if (this.onendedCallback) {
                this.onendedCallback();
            }
        });

        this.audio.addEventListener("volumechange", () => {
            // This can be used if we want to sync volume from the audio object back to store
        });
    }

    private setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => this.startPlay());
        navigator.mediaSession.setActionHandler('pause', () => {
            this.audio.pause();
            useAudioStore.setState({isPlaying: false});
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
    }

    get isPlaying() {
        return useAudioStore.getState().isPlaying;
    }

    get volume() {
        return useAudioStore.getState().volume;
    }

    get isMuted() {
        return useAudioStore.getState().isMuted;
    }

    get songUrl() {
        return useAudioStore.getState().songUniqueId;
    }

    get progress() {
        return useAudioStore.getState().progress;
    }

    get shuffleHash() {
        return useAudioStore.getState().shuffleHash;
    }

    private startPlay() {
        this.audio.play()
            .then(() => {
                useAudioStore.setState({isPlaying: true});
            })
            .catch(r => console.error(`Error during playing!!!!!!`, r));
    }

    togglePlay(): boolean {
        const {songUniqueId, isPlaying} = useAudioStore.getState();
        if (songUniqueId == null) return false;

        if (isPlaying) {
            this.audio.pause();
            useAudioStore.setState({isPlaying: false});
        } else {
            this.startPlay();
        }

        return useAudioStore.getState().isPlaying;
    }

    preload(trackUrl: string): void {
        if (this.audio.src === trackUrl) return;

        this.audio.src = trackUrl;
        this.audio.load();
        useAudioStore.setState({songUniqueId: trackUrl});

        if ('mediaSession' in navigator) {
            // Ideally we should set metadata here, but we only have trackUrl
            navigator.mediaSession.metadata = new MediaMetadata({
                title: trackUrl.split('/').pop() || 'Unknown Track',
                // artist: '...',
                // album: '...',
                // artwork: [...]
            });
        }
    }

    unload(): void {
        this.audio.src = '';
        useAudioStore.setState({songUniqueId: null, isPlaying: false});
    }

    play(trackUrl: string): void {
        this.preload(trackUrl);
        this.startPlay();
    }

    setVolume(volume: number): void {
        this.audio.volume = volume / 100;
        useAudioStore.setState({volume});
    }

    toggleMute(): void {
        const isMuted = !this.audio.muted;
        this.audio.muted = isMuted;
        useAudioStore.setState({isMuted});
    }

    onEnd(callback: () => void): void {
        this.onendedCallback = callback;
    }

    setProgress(percent: number): void {
        if (this.audio.duration) {
            this.audio.currentTime = this.audio.duration * (percent / 100);
        }
    }

    playNext(): void {
        const {nextTrackUrl} = useAudioStore.getState();
        if (nextTrackUrl) {
            this.play(nextTrackUrl);
        }
    }

    playPrev(): void {
        const {prevTrackUrl} = useAudioStore.getState();
        if (prevTrackUrl) {
            this.play(prevTrackUrl);
        }
    }

    setNext(val: string | undefined): void {
        useAudioStore.setState({nextTrackUrl: val});
    }

    setPrev(val: string | undefined): void {
        useAudioStore.setState({prevTrackUrl: val});
    }

    setShuffleHash(hash: number | null): void {
        useAudioStore.setState({shuffleHash: hash});
    }
}

const playerInstance = new AudioPlayerImpl();

export default function useAudioPlayer(): AudioPlayer {
    useAudioStore(); // subscribe to store updates
    return useMemo(() => playerInstance, []);
}
