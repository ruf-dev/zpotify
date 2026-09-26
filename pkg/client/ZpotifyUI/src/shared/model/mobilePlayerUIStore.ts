import { create } from 'zustand';

interface MobilePlayerUIState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useMobilePlayerUI = create<MobilePlayerUIState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));
