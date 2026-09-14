import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { SongFile, TorrentJob } from '@/app/api/zpotify';
import PendingFilesScreen from '@/dialogs/AddTrack/screens/PendingFilesScreen';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';

const handleToggleSelectFolderSpy = vi.fn();

let mockFiles: SongFile[] = [];
let mockSelectedIds: Set<string> = new Set();
let mockJobs: TorrentJob[] = [];

vi.mock('@/dialogs/AddTrack/screens/usePendingFiles.tsx', () => ({
    usePendingFiles: () => ({
        files: mockFiles,
        loading: false,
        refetching: false,
        refetch: vi.fn(),
        selectedIds: mockSelectedIds,
        allSelected: false,
        handleToggleSelect: vi.fn(),
        handleToggleSelectAll: vi.fn(),
        handleToggleSelectFolder: handleToggleSelectFolderSpy,
        handleDelete: vi.fn(),
        handleDeleteSelected: vi.fn(),
    }),
}));

vi.mock('@/dialogs/AddTrack/screens/useTorrentJobs.ts', () => ({
    useTorrentJobs: () => ({
        jobs: mockJobs,
        loading: false,
        refetch: vi.fn(),
    }),
}));

function makeFile(id: string, folder: string): SongFile {
    return { id, path: `tmp/user1/${folder}/${id}.mp3` } as SongFile;
}

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return { id: 'job1', torrentName: 'ubuntu.torrent', status: 'downloading', ...overrides };
}

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
        ...overrides,
    };
}

describe('PendingFilesScreen folder wiring', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        mockFiles = [];
        mockSelectedIds = new Set();
        mockJobs = [];
    });

    it('calls handleToggleSelectFolder with the folder file ids and checked value when the folder checkbox is toggled', () => {
        mockFiles = [makeFile('id1', 'MyFolder'), makeFile('id2', 'MyFolder')];
        mockSelectedIds = new Set();

        const ctx = makeContext({});
        render(<PendingFilesScreen {...ctx} />);

        // "Select all" has its own labeled checkbox; the folder-group checkbox is the first
        // unlabeled one (file-item checkboxes come after it in DOM order within the group).
        const unlabeledCheckboxes = screen.getAllByRole('checkbox', { name: '' });
        fireEvent.click(unlabeledCheckboxes[0]);

        expect(handleToggleSelectFolderSpy).toHaveBeenCalledWith(['id1', 'id2'], true);
    });

    it('calls handleCreatePlaylistFromFolder with the folder name and files when Create playlist is clicked', () => {
        const files = [makeFile('id1', 'MyFolder'), makeFile('id2', 'MyFolder')];
        mockFiles = files;
        mockSelectedIds = new Set();

        const handleCreatePlaylistFromFolderSpy = vi.fn();
        const ctx = makeContext({ handleCreatePlaylistFromFolder: handleCreatePlaylistFromFolderSpy });
        render(<PendingFilesScreen {...ctx} />);

        fireEvent.click(screen.getByText('Create playlist'));

        expect(handleCreatePlaylistFromFolderSpy).toHaveBeenCalledWith('MyFolder', files);
    });

    it('renders a torrent job row and calls handleManageTorrent with the job when Manage is clicked', () => {
        const job = makeJob({});
        mockJobs = [job];

        const handleManageTorrentSpy = vi.fn();
        const ctx = makeContext({ handleManageTorrent: handleManageTorrentSpy });
        render(<PendingFilesScreen {...ctx} />);

        expect(screen.getByText('ubuntu.torrent')).not.toBeNull();

        fireEvent.click(screen.getByText('Manage'));

        expect(handleManageTorrentSpy).toHaveBeenCalledWith(job);
    });
});
