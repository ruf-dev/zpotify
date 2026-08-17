import { createRef } from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { SearchHistoryEntry } from '@/shared/api/SearchHistoryService.ts';
import SearchHistoryDropdown from '@/widgets/SearchHistoryDropdown/SearchHistoryDropdown.tsx';

const navigateSpy = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateSpy,
}));

let isMobile = false;
vi.mock('@/shared/lib/useIsMobile.ts', () => ({
    useIsMobile: () => isMobile,
}));

const fetchSpy = vi.fn();
const setQuerySpy = vi.fn();
let entries: SearchHistoryEntry[] = [];
vi.mock('@/entities/search/useSearchHistory.ts', () => ({
    useSearchHistory: (selector: (s: { entries: SearchHistoryEntry[]; fetch: typeof fetchSpy }) => unknown) =>
        selector({ entries, fetch: fetchSpy }),
}));
vi.mock('@/entities/search/useSearchQuery.ts', () => ({
    useSearchQuery: (selector: (s: { setQuery: typeof setQuerySpy }) => unknown) => selector({ setQuery: setQuerySpy }),
}));

function makeEntry(overrides: Partial<SearchHistoryEntry>): SearchHistoryEntry {
    return {
        query: 'radiohead',
        findingType: '',
        findingId: '',
        findingName: '',
        findingCoverUrl: '',
        ...overrides,
    };
}

function renderDropdown(open = true) {
    const anchorRef = createRef<HTMLElement>();
    anchorRef.current = document.createElement('input');
    document.body.appendChild(anchorRef.current);
    const onClose = vi.fn();
    render(<SearchHistoryDropdown anchorRef={anchorRef} open={open} onClose={onClose} />);
    return { onClose };
}

describe('SearchHistoryDropdown', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        entries = [];
        isMobile = false;
    });

    it('renders nothing when closed', () => {
        entries = [makeEntry({ query: 'radiohead' })];
        renderDropdown(false);

        expect(screen.queryByText('radiohead')).toBeNull();
    });

    it('renders nothing when there is no history', () => {
        entries = [];
        renderDropdown(true);

        expect(screen.queryByText('Recent searches')).toBeNull();
        expect(screen.queryByText('Recently viewed')).toBeNull();
    });

    it('sets the search query and closes when a recent query is clicked', () => {
        entries = [makeEntry({ query: 'radiohead' })];
        const { onClose } = renderDropdown(true);

        fireEvent.click(screen.getByText('radiohead'));

        expect(setQuerySpy).toHaveBeenCalledWith('radiohead');
        expect(onClose).toHaveBeenCalled();
    });

    it('navigates to the album path when an album finding is clicked', () => {
        entries = [
            makeEntry({
                query: 'ok computer',
                findingType: 'album',
                findingId: 'album-uuid',
                findingName: 'OK Computer',
            }),
        ];
        const { onClose } = renderDropdown(true);

        fireEvent.click(screen.getByText('OK Computer'));

        expect(navigateSpy).toHaveBeenCalledWith('/album/album-uuid');
        expect(onClose).toHaveBeenCalled();
    });

    it('navigates to the artist path when an artist finding is clicked', () => {
        entries = [
            makeEntry({
                query: 'radiohead',
                findingType: 'artist',
                findingId: 'artist-uuid',
                findingName: 'Radiohead',
            }),
        ];
        renderDropdown(true);

        fireEvent.click(screen.getByText('Radiohead'));

        expect(navigateSpy).toHaveBeenCalledWith('/artist/artist-uuid');
    });

    it('limits visible entries to 3 on mobile', () => {
        entries = Array.from({ length: 6 }, (_, idx) => makeEntry({ query: `query-${idx}` }));
        isMobile = true;

        renderDropdown(true);

        expect(screen.getAllByText(/^query-/)).toHaveLength(3);
    });

    it('limits visible entries to 5 on desktop', () => {
        entries = Array.from({ length: 6 }, (_, idx) => makeEntry({ query: `query-${idx}` }));
        isMobile = false;

        renderDropdown(true);

        expect(screen.getAllByText(/^query-/)).toHaveLength(5);
    });
});
