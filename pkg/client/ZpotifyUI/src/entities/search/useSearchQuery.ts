import { create } from 'zustand';

interface SearchQueryState {
    query: string;
    setQuery: (query: string) => void;
}

export const useSearchQuery = create<SearchQueryState>((set) => ({
    query: '',
    setQuery: (query: string) => set({ query }),
}));
