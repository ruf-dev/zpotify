import { create } from 'zustand';

interface SidebarUIState {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
}

export const useSidebarUI = create<SidebarUIState>()((set) => ({
    isCollapsed: false,
    toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

    isDrawerOpen: false,
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
