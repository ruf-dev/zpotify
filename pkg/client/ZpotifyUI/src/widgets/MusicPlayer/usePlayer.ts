import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { cacheAudio, getCachedAudio, getTrackUrl } from '@/shared/lib/audioCache.ts';
import { useAudioSettings } from '@/entities/audio-settings/useAudioSettings.ts';
import { useAudioCacheStore } from '@/shared/model/audioCacheStore.ts';

export interface ArtistNamePart {
    uuid?: string;
    name: string;
}

export interface TrackInfo {
    title: string | null;
    artist: string | null;
    artists: ArtistNamePart[];
    cover: string | null;
}

export interface QueueTrack {
    filePath: string;
    info: TrackInfo;
}

export interface AudioPlayer {
    isPlaying: boolean;
    isLoading: boolean;

    togglePlay: () => boolean;
    preload: (id: string) => Promise<void>;
    unload: () => void;
    play: (id: string) => Promise<void>;

    setVolume: (volume: number) => void;
    volume: number;
    toggleMute: () => void;
    isMuted: boolean;

    trackPath: string | null;
    songTitle: string | null;
    songArtist: string | null;
    songArtists: ArtistNamePart[];
    songCover: string | null;
    setSongInfo: (
        title: string | null,
        artist: string | null,
        cover?: string | null,
        artists?: ArtistNamePart[],
    ) => void;

    progress: number;
    setProgress: (percent: number) => void;

    currentTime: number;
    duration: number;
    buffered: number;

    playNext: () => void;
    playPrev: () => void;

    queueSourceId: string | null;
    setQueue: (tracks: QueueTrack[], startIndex: number, sourceId: string) => void;

    shuffleHash: number | null;
    setShuffleHash: (hash: number | null) => void;
}

interface AudioStoreState {
    isPlaying: boolean;
    isLoading: boolean;
    volume: number;
    isMuted: boolean;

    trackPath: string | null;

    songTitle: string | null;
    songArtist: string | null;
    songArtists: ArtistNamePart[];
    songCover: string | null;

    progress: number;
    currentTime: number;
    duration: number;
    buffered: number;

    queue: QueueTrack[];
    queueIndex: number;
    queueSourceId: string | null;
    shuffleHash: number | null;
}

const useAudioStore = create<AudioStoreState>()(
    persist(
        (): AudioStoreState => ({
            isPlaying: false,
            isLoading: false,
            volume: 36,
            trackPath: null,
            isMuted: false,
            songTitle: null,
            songArtist: null,
            songArtists: [],
            songCover: null,
            progress: 0,
            currentTime: 0,
            duration: 0,
            buffered: 0,
            queue: [],
            queueIndex: -1,
            queueSourceId: null,
            shuffleHash: null,
        }),
        {
            name: 'zpotify-last-played',
            partialize: (state) => ({
                trackPath: state.trackPath,
                songTitle: state.songTitle,
                songArtist: state.songArtist,
                songArtists: state.songArtists,
                songCover: state.songCover,
                progress: state.progress,
                volume: state.volume,
                queue: state.queue,
                queueIndex: state.queueIndex,
                queueSourceId: state.queueSourceId,
            }),
        },
    ),
);

class AudioPlayerImpl implements AudioPlayer {
    private audio: HTMLAudioElement;
    private pendingRestoreProgress: number | null = null;
    private currentObjectUrl: string | null = null;
    private opToken = 0;
    private loadedTrackPath: string | null = null;
    private preloadedNextForTrack: string | null = null;

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
        const { trackPath, progress } = useAudioStore.getState();
        if (trackPath) {
            this.pendingRestoreProgress = progress;
            this.preload(trackPath);
        }
    }

    private setupEventListeners() {
        this.audio.addEventListener('timeupdate', () => {
            if (!this.audio.duration) return;
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            useAudioStore.setState({
                progress,
                currentTime: this.audio.currentTime,
                duration: this.audio.duration,
            });
            this.maybePreloadNextTrack(progress);
            this.updateBuffered();
        });

        this.audio.addEventListener('progress', () => {
            this.updateBuffered();
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
            useAudioStore.setState({ isPlaying: true });
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        });

        this.audio.addEventListener('playing', () => {
            if (this.loadedTrackPath !== useAudioStore.getState().trackPath) return;
            useAudioStore.setState({ isLoading: false });
        });

        this.audio.addEventListener('waiting', () => {
            if (this.loadedTrackPath !== useAudioStore.getState().trackPath) return;
            useAudioStore.setState({ isLoading: true });
        });

        this.audio.addEventListener('pause', () => {
            useAudioStore.setState({ isPlaying: false, isLoading: false });
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        });

        this.audio.addEventListener('error', (e) => {
            if (this.loadedTrackPath !== useAudioStore.getState().trackPath) return;
            console.error(`Error during playing!!!!!!`, e);
            useAudioStore.setState({ isPlaying: false, isLoading: false });
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
            useAudioStore.setState({ isPlaying: false });
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
    }

    get isPlaying() {
        return useAudioStore.getState().isPlaying;
    }

    get isLoading() {
        return useAudioStore.getState().isLoading;
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

    get songArtists() {
        return useAudioStore.getState().songArtists;
    }

    get songCover() {
        return useAudioStore.getState().songCover;
    }

    setSongInfo(title: string | null, artist: string | null, cover?: string | null, artists?: ArtistNamePart[]): void {
        useAudioStore.setState({
            songTitle: title,
            songArtist: artist,
            songArtists: artists ?? [],
            songCover: cover ?? null,
        });
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

    get buffered() {
        return useAudioStore.getState().buffered;
    }

    get shuffleHash() {
        return useAudioStore.getState().shuffleHash;
    }

    get queueSourceId() {
        return useAudioStore.getState().queueSourceId;
    }

    private startPlay() {
        this.audio
            .play()
            .then(() => {
                useAudioStore.setState({ isPlaying: true });
            })
            .catch((r) => console.error(`Error during playing!!!!!!`, r));
    }

    togglePlay(): boolean {
        const { trackPath, isPlaying, isLoading } = useAudioStore.getState();
        if (trackPath == null) return false;
        if (isPlaying || isLoading) {
            this.opToken++;
            this.audio.pause();
            useAudioStore.setState({ isPlaying: false, isLoading: false });
        } else {
            this.startPlay();
        }

        return useAudioStore.getState().isPlaying;
    }

    private updateBuffered(): void {
        const buffered = this.audio.buffered;
        if (buffered.length === 0 || !this.audio.duration) {
            useAudioStore.setState({ buffered: 0 });
            return;
        }

        const bufferedEnd = buffered.end(buffered.length - 1);
        const percent = (bufferedEnd / this.audio.duration) * 100;
        useAudioStore.setState({ buffered: Math.max(0, Math.min(100, percent)) });
    }

    private revokeCurrentObjectUrl(): void {
        if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
            this.currentObjectUrl = null;
        }
    }

    private maybePreloadNextTrack(progress: number): void {
        const { preloadNextTrack, preloadNextTrackPercent } = useAudioSettings.getState();
        if (!preloadNextTrack) return;
        if (this.loadedTrackPath === null) return;
        if (this.loadedTrackPath === this.preloadedNextForTrack) return;
        if (progress < preloadNextTrackPercent) return;

        this.preloadedNextForTrack = this.loadedTrackPath;

        const { queue, queueIndex } = useAudioStore.getState();
        const next = queue[queueIndex + 1];
        if (!next) return;

        cacheAudio(getTrackUrl(next.filePath)).catch(() => {});
    }

    async preload(trackPath: string): Promise<void> {
        const token = ++this.opToken;
        const trackUrl = getTrackUrl(trackPath);

        this.revokeCurrentObjectUrl();
        this.preloadedNextForTrack = null;

        useAudioStore.setState({ trackPath, isLoading: true, progress: 0, currentTime: 0, duration: 0, buffered: 0 });

        const cacheSongs = useAudioSettings.getState().cacheSongs;
        let src = trackUrl;

        const cachedBlob = await getCachedAudio(trackUrl);
        if (cachedBlob) {
            src = URL.createObjectURL(cachedBlob);
            this.currentObjectUrl = src;
        }

        if (token !== this.opToken) return;

        this.audio.src = src;
        this.audio.load();
        this.loadedTrackPath = trackPath;

        if (cacheSongs && src === trackUrl) {
            const { songTitle, songArtist } = useAudioStore.getState();
            cacheAudio(trackUrl).then((cached) => {
                if (cached) {
                    useAudioCacheStore.getState().addCachedUrl(trackUrl, {
                        title: songTitle || 'Track',
                        artist: songArtist || 'Unknown',
                    });
                }
            });
        }

        if ('mediaSession' in navigator) {
            const { songTitle, songArtist, songCover } = useAudioStore.getState();
            navigator.mediaSession.metadata = new MediaMetadata({
                title: songTitle || trackUrl.split('/').pop() || 'Unknown Track',
                artist: songArtist || '',
                artwork: songCover ? [{ src: songCover }] : [],
            });
        }
    }

    unload(): void {
        this.opToken++;
        this.revokeCurrentObjectUrl();
        this.audio.src = '';
        useAudioStore.setState({
            trackPath: null,
            isPlaying: false,
            isLoading: false,
            currentTime: 0,
            duration: 0,
            buffered: 0,
        });
    }

    async play(trackUrl: string): Promise<void> {
        this.pendingRestoreProgress = null;
        const preloadPromise = this.preload(trackUrl);
        const token = this.opToken;
        await preloadPromise;
        if (token !== this.opToken) return;
        this.startPlay();
    }

    setVolume(volume: number): void {
        this.audio.volume = volume / 100;
        useAudioStore.setState({ volume });
    }

    toggleMute(): void {
        const isMuted = !this.audio.muted;
        this.audio.muted = isMuted;
        useAudioStore.setState({ isMuted });
    }

    setProgress(percent: number): void {
        if (this.audio.duration) {
            this.audio.currentTime = this.audio.duration * (percent / 100);
        }
    }

    private playQueueIndex(index: number): void {
        const { queue } = useAudioStore.getState();
        const target = queue[index];
        if (!target) return;

        useAudioStore.setState({ queueIndex: index });
        this.setSongInfo(target.info.title, target.info.artist, target.info.cover, target.info.artists);
        this.play(target.filePath);
    }

    playNext(): void {
        const { queueIndex } = useAudioStore.getState();
        this.playQueueIndex(queueIndex + 1);
    }

    playPrev(): void {
        const { queueIndex } = useAudioStore.getState();
        this.playQueueIndex(queueIndex - 1);
    }

    setQueue(tracks: QueueTrack[], startIndex: number, sourceId: string): void {
        useAudioStore.setState({ queue: tracks, queueIndex: startIndex, queueSourceId: sourceId });
    }

    setShuffleHash(hash: number | null): void {
        useAudioStore.setState({ shuffleHash: hash });
    }
}

const playerInstance = new AudioPlayerImpl();

export default function useAudioPlayer(): AudioPlayer {
    useAudioStore(); // subscribe to store updates
    return useMemo(() => playerInstance, []);
}
