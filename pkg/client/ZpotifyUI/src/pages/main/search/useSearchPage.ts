import { useEffect, useRef, useState } from 'react';

import { useSearchQuery } from '@/entities/search/useSearchQuery.ts';
import type {
    SearchAlbumResult,
    SearchArtistResult,
    SearchFilters,
    SearchPlaylistResult,
    SearchResponse,
} from '@/shared/api/SearchService.ts';
import { searchService } from '@/shared/api/SearchService.ts';
import type { FilterKey } from '@/pages/main/search/components/FilterChips/FilterChips.tsx';

const DEBOUNCE_MS = 250;

const EMPTY_RESPONSE: SearchResponse = { artists: [], albums: [], playlists: [] };

function matchesArtist(item: SearchArtistResult, q: string): boolean {
    return q.length === 0 || item.name.toLowerCase().includes(q);
}

function matchesAlbum(item: SearchAlbumResult, q: string): boolean {
    return (
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        item.artists.some((a) => a.name.toLowerCase().includes(q))
    );
}

function matchesPlaylist(item: SearchPlaylistResult, q: string): boolean {
    return q.length === 0 || item.name.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q);
}

interface UseSearchPageResult {
    query: string;
    filters: SearchFilters;
    toggleFilter: (key: FilterKey) => void;
    loading: boolean;
    visibleArtists: SearchArtistResult[];
    visibleAlbums: SearchAlbumResult[];
    visiblePlaylists: SearchPlaylistResult[];
    totalResults: number;
}

export function useSearchPage(): UseSearchPageResult {
    const query = useSearchQuery((state) => state.query);
    const [filters, setFilters] = useState<SearchFilters>({ artists: true, albums: true, playlists: true });
    const [response, setResponse] = useState<SearchResponse>(EMPTY_RESPONSE);
    const [loading, setLoading] = useState(false);
    const reqIdRef = useRef(0);

    useEffect(
        function fetchResults() {
            setLoading(true);
            const reqId = ++reqIdRef.current;
            const handle = setTimeout(function runSearch() {
                searchService
                    .Search(query.trim(), filters)
                    .then((result) => {
                        if (reqIdRef.current === reqId) setResponse(result);
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

    const q = query.trim().toLowerCase();
    const visibleArtists = filters.artists ? response.artists.filter((a) => matchesArtist(a, q)) : [];
    const visibleAlbums = filters.albums ? response.albums.filter((a) => matchesAlbum(a, q)) : [];
    const visiblePlaylists = filters.playlists ? response.playlists.filter((p) => matchesPlaylist(p, q)) : [];
    const totalResults = visibleArtists.length + visibleAlbums.length + visiblePlaylists.length;

    return {
        query,
        filters,
        toggleFilter,
        loading,
        visibleArtists,
        visibleAlbums,
        visiblePlaylists,
        totalResults,
    };
}
