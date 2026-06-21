import { create } from 'zustand';

interface SongListRefreshState {
    activeKeys: Set<string>;
    versions: Record<string, number>;
    register: (key: string) => void;
    unregister: (key: string) => void;
    refreshActive: () => void;
}

export const useSongListRefresh = create<SongListRefreshState>((set) => ({
    activeKeys: new Set(),
    versions: {},
    register: (key) =>
        set((s) => {
            const next = new Set(s.activeKeys);
            next.add(key);
            return { activeKeys: next };
        }),
    unregister: (key) =>
        set((s) => {
            const next = new Set(s.activeKeys);
            next.delete(key);
            return { activeKeys: next };
        }),
    refreshActive: () =>
        set((s) => {
            const updates: Record<string, number> = {};
            s.activeKeys.forEach((key) => {
                updates[key] = (s.versions[key] ?? 0) + 1;
            });
            return { versions: { ...s.versions, ...updates } };
        }),
}));
