import { useEffect, useRef, useState } from 'react';

import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import { useSearchHistory } from '@/entities/search/useSearchHistory.ts';
import type {
    SearchAlbumResult,
    SearchArtistResult,
    SearchFilters,
    SearchPlaylistResult,
    SearchResponse,
    SearchTrackResult,
} from '@/shared/api/SearchService.ts';
import { searchService } from '@/shared/api/SearchService.ts';
import type { FilterKey } from '@/pages/main/search/components/FilterChips/FilterChips.tsx';

const DEBOUNCE_MS = 250;

const EMPTY_RESPONSE: SearchResponse = { tracks: [], artists: [], albums: [], playlists: [] };

interface UseSearchPageResult {
    query: string;
    filters: SearchFilters;
    toggleFilter: (key: FilterKey) => void;
    loading: boolean;
    visibleTracks: SearchTrackResult[];
    visibleArtists: SearchArtistResult[];
    visibleAlbums: SearchAlbumResult[];
    visiblePlaylists: SearchPlaylistResult[];
    totalResults: number;
}

export function useSearchPage(): UseSearchPageResult {
    const query = useSearchQuery((state) => state.query);
    const [filters, setFilters] = useState<SearchFilters>({
        tracks: true,
        artists: true,
        albums: true,
        playlists: true,
    });
    const [response, setResponse] = useState<SearchResponse>(EMPTY_RESPONSE);
    const [loading, setLoading] = useState(false);
    const reqIdRef = useRef(0);

    useEffect(
        function fetchResults() {
            setLoading(true);
            const reqId = ++reqIdRef.current;
            const handle = setTimeout(function runSearch() {
                const trimmedQuery = query.trim();
                searchService
                    .Search(trimmedQuery, filters)
                    .then((result) => {
                        if (reqIdRef.current === reqId) setResponse(result);
                        if (trimmedQuery) useSearchHistory.getState().recordQuery(trimmedQuery);
                    })
                    .catch(() => {
                        if (reqIdRef.current === reqId) setResponse(EMPTY_RESPONSE);
                    })
                    .finally(() => {
                        if (reqIdRef.current === reqId) setLoading(false);
                    });
            }, DEBOUNCE_MS);

            return () => clearTimeout(handle);
        },
        [query],
    );

    function toggleFilter(key: FilterKey) {
        setFilters((prev) => {
            const nextValue = !prev[key];
            const activeCount = Object.values(prev).filter(Boolean).length;
            if (!nextValue && activeCount <= 1) return prev;
            return { ...prev, [key]: nextValue };
        });
    }

    const visibleTracks = filters.tracks ? response.tracks : [];
    const visibleArtists = filters.artists ? response.artists : [];
    const visibleAlbums = filters.albums ? response.albums : [];
    const visiblePlaylists = filters.playlists ? response.playlists : [];
    const totalResults = visibleTracks.length + visibleArtists.length + visibleAlbums.length + visiblePlaylists.length;

    return {
        query,
        filters,
        toggleFilter,
        loading,
        visibleTracks,
        visibleArtists,
        visibleAlbums,
        visiblePlaylists,
        totalResults,
    };
}
