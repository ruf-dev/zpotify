import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioSettings {
    cacheSongs: boolean;
    setCacheSongs: (v: boolean) => void;
    preloadNextTrack: boolean;
    setPreloadNextTrack: (v: boolean) => void;
    preloadNextTrackPercent: number;
    setPreloadNextTrackPercent: (v: number) => void;
}

export const useAudioSettings = create<AudioSettings>()(
    persist(
        (set) => ({
            cacheSongs: false,
            setCacheSongs: (v: boolean) => set({ cacheSongs: v }),
            preloadNextTrack: true,
            setPreloadNextTrack: (v: boolean) => set({ preloadNextTrack: v }),
            preloadNextTrackPercent: 50,
            setPreloadNextTrackPercent: (v: number) => set({ preloadNextTrackPercent: v }),
        }),
        { name: 'zpotify-audio-settings' },
    ),
);
