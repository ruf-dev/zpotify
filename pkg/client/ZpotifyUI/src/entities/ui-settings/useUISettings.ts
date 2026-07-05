import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UISettings {
    dynamicHomePage: boolean;
    setDynamicHomePage: (v: boolean) => void;
    swipeEnabled: boolean;
    setSwipeEnabled: (v: boolean) => void;
    showSidebar: boolean;
    setShowSidebar: (v: boolean) => void;
    showPlayerBar: boolean;
    setShowPlayerBar: (v: boolean) => void;
    showQueuePanel: boolean;
    setShowQueuePanel: (v: boolean) => void;
}

export const useUISettings = create<UISettings>()(
    persist(
        (set) => ({
            dynamicHomePage: false,
            setDynamicHomePage: (v: boolean) => set({ dynamicHomePage: v }),

            swipeEnabled: false,
            setSwipeEnabled: (v: boolean) => set({ swipeEnabled: v }),

            showSidebar: true,
            setShowSidebar: (v: boolean) => set({ showSidebar: v }),

            showPlayerBar: true,
            setShowPlayerBar: (v: boolean) => set({ showPlayerBar: v }),

            showQueuePanel: false,
            setShowQueuePanel: (v: boolean) => set({ showQueuePanel: v }),
        }),
        { name: 'zpotify-ui-settings' }
    )
);
