import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import TorrentFilesScreen from '@/dialogs/AddTrack/screens/TorrentFilesScreen';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import type { GetTorrentFileResponse } from '@/app/api/zpotify';
import { TORRENT_FILE_KINDS } from '@/shared/api/TorrentFileKinds.ts';

vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({
        bake: vi.fn(),
        catch: vi.fn(),
    }),
}));

let mockResponse: GetTorrentFileResponse = { file: undefined };

vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        GetTorrentFile: () => Promise.resolve(mockResponse),
    },
}));

function makeResponse(overrides: Partial<GetTorrentFileResponse> = {}): GetTorrentFileResponse {
    return {
        file: {
            id: 'torrent1',
            torrentName: 'ubuntu.torrent',
            files: [
                { path: 'Album/01 - Song.mp3', sizeBytes: '1024', supported: true },
                { path: 'Album/cover.jpg', sizeBytes: '2048', supported: false },
            ],
        },
        ...overrides,
    };
}

function makeContext(overrides: Partial<AddTrackContext> = {}): AddTrackContext {
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
        pendingTorrentUpload: { id: 'torrent1', folderName: 'ubuntu' },
        submittingTorrentFile: false,
        handleSubmitTorrentFile: vi.fn(),
        handleMagnetLink: vi.fn(),
        discardPendingTorrentUpload: vi.fn(),
        ...overrides,
    };
}

describe('TorrentFilesScreen', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        mockResponse = makeResponse();
    });

    it('renders the fetched file list', async () => {
        mockResponse = makeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);

        expect(await screen.findByText('01 - Song.mp3')).not.toBeNull();
        expect(screen.getByText('cover.jpg')).not.toBeNull();
    });

    it('shows unsupported files as disabled', async () => {
        mockResponse = makeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);

        await screen.findByText('01 - Song.mp3');

        const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
        const unsupportedCheckbox = checkboxes.find((c) => c.disabled);

        expect(unsupportedCheckbox).not.toBeUndefined();
    });

    it('updates the selection when a checkbox is toggled', async () => {
        mockResponse = makeResponse({
            file: {
                id: 'torrent1',
                torrentName: 'ubuntu.torrent',
                files: [
                    { path: 'Album/01 - Song.mp3', sizeBytes: '1024', supported: true },
                    { path: 'Album/02 - Song.mp3', sizeBytes: '1024', supported: true },
                ],
            },
        });
        const handleSubmitTorrentFileSpy = vi.fn();
        render(<TorrentFilesScreen {...makeContext({ handleSubmitTorrentFile: handleSubmitTorrentFileSpy })} />);

        await screen.findByText('01 - Song.mp3');

        const checkboxes = screen.getAllByRole('checkbox', { name: '' }) as HTMLInputElement[];
        fireEvent.click(checkboxes[0]);

        fireEvent.click(screen.getByText(/selected/));

        expect(handleSubmitTorrentFileSpy).toHaveBeenCalledWith(['Album/02 - Song.mp3'], 'ubuntu.torrent');
    });

    it('calls handleSubmitTorrentFile with the currently selected paths on submit', async () => {
        mockResponse = makeResponse();
        const handleSubmitTorrentFileSpy = vi.fn();
        render(<TorrentFilesScreen {...makeContext({ handleSubmitTorrentFile: handleSubmitTorrentFileSpy })} />);

        await screen.findByText('01 - Song.mp3');

        fireEvent.click(screen.getByText(/selected/));

        expect(handleSubmitTorrentFileSpy).toHaveBeenCalledWith(['Album/01 - Song.mp3'], 'ubuntu.torrent');
    });
});

describe('TorrentFilesScreen folder tree', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        mockResponse = makeResponse();
    });

    const track = TORRENT_FILE_KINDS.track;

    function makeTreeResponse(): GetTorrentFileResponse {
        return makeResponse({
            file: {
                id: 'torrent1',
                torrentName: 'ubuntu.torrent',
                files: [
                    { path: 'Rock/01.mp3', sizeBytes: '1024', supported: true, kind: track },
                    { path: 'Jazz/02.mp3', sizeBytes: '1024', supported: true, kind: track },
                    { path: 'Jazz/03.mp3', sizeBytes: '1024', supported: true, kind: track },
                    { path: 'Jazz/front.jpg', sizeBytes: '10', supported: true, kind: TORRENT_FILE_KINDS.cover },
                    { path: 'Jazz/notes.txt', sizeBytes: '10', supported: false, kind: TORRENT_FILE_KINDS.other },
                ],
            },
        });
    }

    function folderCheckbox(name: string): HTMLInputElement {
        const header = screen.getByText(name).closest('div') as HTMLElement;
        return within(header).getByRole('checkbox') as HTMLInputElement;
    }

    it('renders files inside folder headers', async () => {
        mockResponse = makeTreeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);

        expect(await screen.findByText('Jazz')).not.toBeNull();
        expect(screen.getByText('Rock')).not.toBeNull();
        expect(screen.getByText('2 tracks \u00b7 1 photo \u00b7 1 other')).not.toBeNull();
        expect(screen.getByText('1 track')).not.toBeNull();
        expect(screen.getByText('02.mp3')).not.toBeNull();
    });

    it('toggles between collapse all and expand all', async () => {
        mockResponse = makeTreeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);
        await screen.findByText('Jazz');

        fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
        expect(screen.getByRole('button', { name: 'Expand all' })).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
        expect(screen.getByRole('button', { name: 'Collapse all' })).not.toBeNull();
    });

    it('clears then selects all supported files when the folder checkbox is clicked', async () => {
        mockResponse = makeTreeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);
        await screen.findByText('Jazz');

        expect(screen.getByText('Download 4 selected')).not.toBeNull();

        fireEvent.click(folderCheckbox('Jazz'));
        expect(screen.getByText('Download 1 selected')).not.toBeNull();

        fireEvent.click(folderCheckbox('Jazz'));
        expect(screen.getByText('Download 4 selected')).not.toBeNull();
    });

    it('marks select all as mixed when only some files are selected', async () => {
        mockResponse = makeTreeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);
        await screen.findByText('Jazz');

        const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
        expect(selectAll.indeterminate).toBe(false);

        fireEvent.click(folderCheckbox('Jazz'));

        expect(selectAll.indeterminate).toBe(true);
        expect(selectAll.checked).toBe(false);
    });

    it('marks a folder as mixed when only some of its files are selected', async () => {
        mockResponse = makeTreeResponse();
        render(<TorrentFilesScreen {...makeContext()} />);
        await screen.findByText('Jazz');

        fireEvent.click(screen.getByRole('checkbox', { name: /02\.mp3/ }));

        expect(folderCheckbox('Jazz').indeterminate).toBe(true);
    });
});
