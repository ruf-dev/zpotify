import { create } from 'zustand';

import type { FeatureFlag } from '@/app/api/zpotify';

interface FeatureFlagsStore {
    flags: Record<string, FeatureFlag>;
    loaded: boolean;
    setFlags: (flags: FeatureFlag[]) => void;
}

export const useFeatureFlags = create<FeatureFlagsStore>((set) => ({
    flags: {},
    loaded: false,
    setFlags: (flags: FeatureFlag[]) => {
        const indexed: Record<string, FeatureFlag> = {};
        for (const flag of flags) {
            if (flag.id !== undefined) {
                indexed[flag.id] = flag;
            }
        }
        set({ flags: indexed, loaded: true });
    },
}));

export function selectFlagEnabled(store: FeatureFlagsStore, id: string): boolean {
    return store.flags[id]?.isEnabled ?? false;
}
