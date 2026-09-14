import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentFilesScreen from '@/dialogs/AddTrack/screens/TorrentFilesScreen';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import type { GetTorrentFileResponse } from '@/app/api/zpotify';

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

        expect(handleSubmitTorrentFileSpy).toHaveBeenCalledWith(['Album/02 - Song.mp3']);
    });

    it('calls handleSubmitTorrentFile with the currently selected paths on submit', async () => {
        mockResponse = makeResponse();
        const handleSubmitTorrentFileSpy = vi.fn();
        render(<TorrentFilesScreen {...makeContext({ handleSubmitTorrentFile: handleSubmitTorrentFileSpy })} />);

        await screen.findByText('01 - Song.mp3');

        fireEvent.click(screen.getByText(/selected/));

        expect(handleSubmitTorrentFileSpy).toHaveBeenCalledWith(['Album/01 - Song.mp3']);
    });
});
