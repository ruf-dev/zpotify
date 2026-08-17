import { create } from 'zustand';

import { searchHistoryService, type SearchHistoryEntry } from '@/shared/api/SearchHistoryService.ts';

interface SearchHistoryState {
    entries: SearchHistoryEntry[];
    fetch: () => void;
    recordQuery: (query: string) => void;
    recordFinding: (
        query: string,
        findingType: string,
        findingId: string,
        findingName: string,
        findingCoverUrl: string,
    ) => void;
}

export const useSearchHistory = create<SearchHistoryState>((set) => ({
    entries: [],
    fetch: () => {
        searchHistoryService
            .list()
            .then((entries) => set({ entries }))
            .catch(() => {});
    },
    recordQuery: (query) => {
        searchHistoryService.recordQuery(query).catch(() => {});
    },
    recordFinding: (query, findingType, findingId, findingName, findingCoverUrl) => {
        searchHistoryService.recordFinding(query, findingType, findingId, findingName, findingCoverUrl).catch(() => {});
    },
}));
