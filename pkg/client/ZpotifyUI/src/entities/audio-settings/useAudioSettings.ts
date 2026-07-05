import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioSettings {
    cacheSongs: boolean;
    setCacheSongs: (v: boolean) => void;
}

export const useAudioSettings = create<AudioSettings>()(
    persist(
        (set) => ({
            cacheSongs: false,
            setCacheSongs: (v: boolean) => set({ cacheSongs: v }),
        }),
        { name: 'zpotify-audio-settings' },
    ),
);
