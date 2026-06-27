import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UISettings {
    dynamicHomePage: boolean;
    setDynamicHomePage: (v: boolean) => void;
    swipeEnabled: boolean;
    setSwipeEnabled: (v: boolean) => void;
}

export const useUISettings = create<UISettings>()(
    persist(
        (set) => ({
            dynamicHomePage: false,
            setDynamicHomePage: (v: boolean) => set({ dynamicHomePage: v }),

            swipeEnabled: false,
            setSwipeEnabled: (v: boolean) => set({ swipeEnabled: v }),
        }),
        { name: 'zpotify-ui-settings' }
    )
);
