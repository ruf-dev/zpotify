import {useMemo} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';

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

    trackPath: string | null;
    songTitle: string | null;
    songArtist: string | null;
    songCover: string | null;
    setSongInfo: (title: string | null, artist: string | null, cover?: string | null) => void;

    progress: number;
    setProgress: (percent: number) => void;

    currentTime: number;
    duration: number;

    playNext: () => void;
    playPrev: () => void;

    setNext: (val: string | undefined) => void;
    setPrev: (val: string | undefined) => void;

    shuffleHash: number | null;
    setShuffleHash: (hash: number | null) => void;
}

interface AudioStoreState {
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;

    trackPath: string | null;

    songTitle: string | null;
    songArtist: string | null;
    songCover: string | null;

    progress: number;
    currentTime: number;
    duration: number;

    nextTrackUrl: string | undefined;
    prevTrackUrl: string | undefined;
    shuffleHash: number | null;
}

const useAudioStore = create<AudioStoreState>()(
    persist(
        (): AudioStoreState => ({
            isPlaying: false,
            volume: 36,
            trackPath: null,
            isMuted: false,
            songTitle: null,
            songArtist: null,
            songCover: null,
            progress: 0,
            currentTime: 0,
            duration: 0,
            nextTrackUrl: undefined,
            prevTrackUrl: undefined,
            shuffleHash: null,
        }),
        {
            name: 'zpotify-last-played',
            partialize: (state) => ({
                trackPath: state.trackPath,
                songTitle: state.songTitle,
                songArtist: state.songArtist,
                songCover: state.songCover,
                progress: state.progress,
                volume: state.volume,
            }),
        }
    )
);

class AudioPlayerImpl implements AudioPlayer {
    private audio: HTMLAudioElement;
    private pendingRestoreProgress: number | null = null;

    constructor() {
        this.audio = new Audio();
        this.setupEventListeners();
        this.setupMediaSession();
        this.restoreLastPlayed();
    }

    private restoreLastPlayed(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = useAudioStore as any;
        if (store.persist.hasHydrated()) {
            this.doRestore();
        } else {
            store.persist.onFinishHydration(() => this.doRestore());
        }
    }

    private doRestore(): void {
        const {trackPath, progress} = useAudioStore.getState();
        if (trackPath) {
            this.pendingRestoreProgress = progress;
            this.preload(trackPath);
        }
    }

    private setupEventListeners() {
        this.audio.addEventListener('timeupdate', () => {
            if (!this.audio.duration) return;
            useAudioStore.setState({
                progress: (this.audio.currentTime / this.audio.duration) * 100,
                currentTime: this.audio.currentTime,
                duration: this.audio.duration,
            });
        });

        this.audio.addEventListener('loadedmetadata', () => {
            if (this.pendingRestoreProgress !== null && this.audio.duration) {
                this.audio.currentTime = this.audio.duration * (this.pendingRestoreProgress / 100);
                this.pendingRestoreProgress = null;
            }
            useAudioStore.setState({
                duration: this.audio.duration || 0,
                currentTime: this.audio.currentTime || 0,
            });
        });

        this.audio.addEventListener('play', () => {
            useAudioStore.setState({isPlaying: true});
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        });

        this.audio.addEventListener('pause', () => {
            useAudioStore.setState({isPlaying: false});
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        });

        this.audio.addEventListener('ended', () => {
            this.playNext();
        });

        this.audio.addEventListener('volumechange', () => {
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

    get trackPath() {
        return useAudioStore.getState().trackPath;
    }

    get songTitle() {
        return useAudioStore.getState().songTitle;
    }

    get songArtist() {
        return useAudioStore.getState().songArtist;
    }

    get songCover() {
        return useAudioStore.getState().songCover;
    }

    setSongInfo(title: string | null, artist: string | null, cover?: string | null): void {
        useAudioStore.setState({songTitle: title, songArtist: artist, songCover: cover ?? null});
    }

    get progress() {
        return useAudioStore.getState().progress;
    }

    get currentTime() {
        return useAudioStore.getState().currentTime;
    }

    get duration() {
        return useAudioStore.getState().duration;
    }

    get shuffleHash() {
        return useAudioStore.getState().shuffleHash;
    }

    private startPlay() {
        this.audio
            .play()
            .then(() => {
                useAudioStore.setState({isPlaying: true});
            })
            .catch((r) => console.error(`Error during playing!!!!!!`, r));
    }

    togglePlay(): boolean {
        const {trackPath, isPlaying} = useAudioStore.getState();
        if (trackPath == null) return false;
        console.debug(`Toggled ${trackPath}`)
        if (isPlaying) {
            this.audio.pause();
            useAudioStore.setState({isPlaying: false});
        } else {
            this.startPlay();
        }

        return useAudioStore.getState().isPlaying;
    }

    preload(trackPath: string): void {
        const base = import.meta.env.VITE_ZPOTIFY_WEBSERVER as string || "";
        const trackUrl = base + (trackPath.startsWith('/') ? trackPath : '/' + trackPath);

        this.audio.src = trackUrl;
        this.audio.load();
        useAudioStore.setState({trackPath: trackPath, currentTime: 0, duration: 0});

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
        useAudioStore.setState({trackPath: null, isPlaying: false, currentTime: 0, duration: 0});
    }

    play(trackUrl: string): void {
        this.pendingRestoreProgress = null;
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
