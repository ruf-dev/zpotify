import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentFilesScreen from '@/dialogs/AddTrack/screens/TorrentFilesScreen';
import { useTorrentFileSelection } from '@/dialogs/AddTrack/screens/useTorrentFileSelection.ts';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';

vi.mock('@/dialogs/AddTrack/screens/useTorrentFileSelection.ts', () => ({ useTorrentFileSelection: vi.fn() }));

type Selection = ReturnType<typeof useTorrentFileSelection>;

function renderScreen(selection: Partial<Selection>) {
    const goBack = vi.fn();
    const base: Partial<Selection> = {
        loading: false,
        resolving: false,
        failed: false,
        torrentName: '',
        entries: [],
        tree: { items: [], children: [] },
        selectedPaths: new Set<string>(),
        allSelected: false,
    };
    vi.mocked(useTorrentFileSelection).mockReturnValue({ ...base, ...selection } as Partial<Selection> as Selection);

    const ctx: Partial<AddTrackContext> = {
        goBack,
        pickedTorrentTitle: '',
        pendingTorrentUpload: { id: 'magnet1', folderName: '' },
        submittingTorrentFile: false,
        handleSubmitTorrentFile: vi.fn(),
    };
    render(<TorrentFilesScreen {...(ctx as Partial<AddTrackContext> as AddTrackContext)} />);

    return { goBack };
}

describe('TorrentFilesScreen resolving state', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows the metadata status with the torrent name while resolving', () => {
        renderScreen({ resolving: true, torrentName: 'ubuntu-24.04' });

        expect(screen.getByText('Fetching metadata from peers…')).not.toBeNull();
        expect(screen.getByText('ubuntu-24.04')).not.toBeNull();
    });

    it('goes back when Cancel is clicked while resolving', () => {
        const { goBack } = renderScreen({ resolving: true });

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(goBack).toHaveBeenCalled();
    });

    it('shows the failure message and a Back button when resolving failed', () => {
        const { goBack } = renderScreen({ failed: true });

        expect(screen.getByText('could not fetch torrent metadata from peers')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Back' }));

        expect(goBack).toHaveBeenCalled();
    });
});
