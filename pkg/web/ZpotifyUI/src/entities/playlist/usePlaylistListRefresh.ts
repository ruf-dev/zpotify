import { create } from 'zustand';

interface PlaylistListRefreshState {
    version: number;
    refresh: () => void;
}

export const usePlaylistListRefresh = create<PlaylistListRefreshState>((set) => ({
    version: 0,
    refresh: () => set((s) => ({ version: s.version + 1 })),
}));
