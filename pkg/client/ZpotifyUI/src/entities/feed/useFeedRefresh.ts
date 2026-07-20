import { create } from 'zustand';

interface FeedRefreshState {
    version: number;
    bump: () => void;
}

export const useFeedRefresh = create<FeedRefreshState>((set) => ({
    version: 0,
    bump: () => set((s) => ({ version: s.version + 1 })),
}));
