import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SearchScreen from '@/dialogs/AddTrack/screens/SearchScreen';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import type { TorrentSearchResult } from '@/app/api/zpotify';
import { ServiceError, WithStatusCode } from '@/shared/api/Errors.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';

vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({
        bake: vi.fn(),
        catch: vi.fn(),
    }),
}));

vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        SearchTorrents: vi.fn(),
    },
}));

function makeContext(overrides: Partial<AddTrackContext>): AddTrackContext {
    return {
        goTo: vi.fn(),
        uploading: false,
        uploadError: null,
        handleFiles: vi.fn(),
        handleTorrentFile: vi.fn(),
        handleSelectFromLibrary: vi.fn(),
        handleManageTorrent: vi.fn(),
        handleCreatePlaylist: vi.fn(),
        handleCreatePlaylistFromFolder: vi.fn(),
        handleDroppedGroups: vi.fn(),
        batchTracks: [],
        handleOpenBatchFolder: vi.fn(),
        pendingTorrentUpload: null,
        submittingTorrentFile: false,
        handleSubmitTorrentFile: vi.fn(),
        handleMagnetLink: vi.fn(),
        handleTorrentSearchResult: vi.fn(),
        discardPendingTorrentUpload: vi.fn(),
        pickedTorrentTitle: '',
        searchQuery: '',
        handleSearch: vi.fn(),
        goBack: vi.fn(),
        ...overrides,
    };
}

function SearchScreenHost({ ctx }: { ctx: AddTrackContext }) {
    const [searchQuery, setSearchQuery] = useState(ctx.searchQuery);

    function handleSearch(query: string) {
        ctx.handleSearch(query);
        setSearchQuery(query);
    }

    return <SearchScreen {...ctx} searchQuery={searchQuery} handleSearch={handleSearch} />;
}

function renderScreen(overrides: Partial<AddTrackContext> = {}) {
    const ctx = makeContext(overrides);
    const queryClient = new QueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <SearchScreenHost ctx={ctx} />
        </QueryClientProvider>,
    );
    return ctx;
}

function searchFor(text: string) {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: text } });
    fireEvent.submit(input.closest('form')!);
}

const result: TorrentSearchResult = {
    id: 'r1',
    title: 'Artist - Album [FLAC]',
    sizeBytes: '1288490189',
    indexer: 'rutracker',
    isAlreadyImported: false,
};

describe('SearchScreen', () => {
    beforeEach(() => {
        vi.mocked(torrentService.SearchTorrents).mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('searches immediately with the prefilled query when searchQuery is set', async () => {
        vi.mocked(torrentService.SearchTorrents).mockResolvedValue({ results: [result] });
        renderScreen({ searchQuery: 'radiohead' });

        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('radiohead');
        expect(await screen.findByText('Artist - Album [FLAC]')).toBeTruthy();
        expect(torrentService.SearchTorrents).toHaveBeenCalledWith({ query: 'radiohead' });
    });

    it('renders result rows when a query is submitted', async () => {
        vi.mocked(torrentService.SearchTorrents).mockResolvedValue({ results: [result] });
        renderScreen();

        searchFor('artist');

        expect(await screen.findByText('Artist - Album [FLAC]')).toBeTruthy();
        expect(torrentService.SearchTorrents).toHaveBeenCalledWith({ query: 'artist' });
    });

    it('calls handleTorrentSearchResult with the result when a row is clicked', async () => {
        vi.mocked(torrentService.SearchTorrents).mockResolvedValue({ results: [result] });
        const ctx = renderScreen();

        searchFor('artist');
        fireEvent.click(await screen.findByText('Artist - Album [FLAC]'));

        expect(ctx.handleTorrentSearchResult).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    });

    it('calls handleSearch with the query when the form is submitted', () => {
        const ctx = renderScreen();

        searchFor('artist');

        expect(ctx.handleSearch).toHaveBeenCalledWith('artist');
    });

    it('shows Lossless and Already imported marks when the result qualifies', async () => {
        vi.mocked(torrentService.SearchTorrents).mockResolvedValue({
            results: [{ ...result, isAlreadyImported: true }],
        });
        renderScreen();

        searchFor('artist');

        expect(await screen.findByText('Lossless')).toBeTruthy();
        expect(screen.getByText('Already imported')).toBeTruthy();
    });

    it('shows an error with Retry that refetches when the search fails', async () => {
        const failure = new ServiceError(WithStatusCode(502));
        vi.mocked(torrentService.SearchTorrents).mockRejectedValueOnce(failure);
        vi.mocked(torrentService.SearchTorrents).mockResolvedValueOnce({ results: [result] });
        renderScreen();

        searchFor('artist');
        fireEvent.click(await screen.findByText('Retry'));

        await waitFor(() => expect(torrentService.SearchTorrents).toHaveBeenCalledTimes(2));
        expect(await screen.findByText('Artist - Album [FLAC]')).toBeTruthy();
    });

    it('shows the unavailable message when the search returns 412', async () => {
        const failure = new ServiceError(WithStatusCode(412));
        vi.mocked(torrentService.SearchTorrents).mockRejectedValue(failure);
        renderScreen();

        searchFor('artist');

        expect(await screen.findByText('Torrent search is unavailable right now')).toBeTruthy();
    });

    it('shows Nothing found when the result list is empty', async () => {
        vi.mocked(torrentService.SearchTorrents).mockResolvedValue({ results: [] });
        renderScreen();

        searchFor('artist');

        expect(await screen.findByText('Nothing found')).toBeTruthy();
    });
});
