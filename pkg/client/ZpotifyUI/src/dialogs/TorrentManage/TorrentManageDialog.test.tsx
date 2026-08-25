import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import TorrentManageDialog from '@/dialogs/TorrentManage/TorrentManageDialog';
import type { TorrentJob } from '@/app/api/zpotify';

const getTorrentJobMock = vi.fn();
const cancelTorrentJobMock = vi.fn();
vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        GetTorrentJob: (...args: unknown[]) => getTorrentJobMock(...args),
        CancelTorrentJob: (...args: unknown[]) => cancelTorrentJobMock(...args),
    },
}));

vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({
        OpenDialog: vi.fn(),
        CloseDialog: vi.fn(),
    }),
}));

const toasterCatchSpy = vi.fn();
vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({
        catch: toasterCatchSpy,
    }),
}));

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return {
        id: 'job1',
        torrentName: 'ubuntu.torrent',
        status: 'downloading',
        totalBytes: '1000',
        downloadedBytes: '500',
        importedFiles: [],
        ...overrides,
    };
}

describe('TorrentManageDialog', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the job name, status, bytes and imported files', async () => {
        const job = makeJob({
            importedFiles: [{ torrentPath: 'a.mp3', fileId: 'f1', status: 'imported' }],
        });
        getTorrentJobMock.mockResolvedValue({ job });

        render(<TorrentManageDialog job={job} />);

        expect(screen.getByText('ubuntu.torrent')).not.toBeNull();
        expect(screen.getByText('downloading')).not.toBeNull();
        expect(screen.getByText('a.mp3')).not.toBeNull();
        expect(screen.getByText('imported')).not.toBeNull();

        await waitFor(() => expect(getTorrentJobMock).toHaveBeenCalledWith({ jobId: 'job1' }));
    });

    it('renders the job error when present', () => {
        const job = makeJob({ error: 'no seeders found' });
        getTorrentJobMock.mockResolvedValue({ job });

        render(<TorrentManageDialog job={job} />);

        expect(screen.getByText('no seeders found')).not.toBeNull();
    });

    it('calls CancelTorrentJob when cancel is clicked while non-terminal', async () => {
        const job = makeJob({ status: 'downloading' });
        getTorrentJobMock.mockResolvedValue({ job });
        cancelTorrentJobMock.mockResolvedValue({});

        render(<TorrentManageDialog job={job} />);

        const cancelButton = screen.getByText('cancel');
        expect((cancelButton as HTMLButtonElement).disabled).toBe(false);

        await act(async () => {
            fireEvent.click(cancelButton);
            await Promise.resolve();
        });

        expect(cancelTorrentJobMock).toHaveBeenCalledWith({ jobId: 'job1' });
    });

    it('disables the cancel button when the job is already terminal', () => {
        const job = makeJob({ status: 'done' });
        getTorrentJobMock.mockResolvedValue({ job });

        render(<TorrentManageDialog job={job} />);

        const cancelButton = screen.getByText('cancel') as HTMLButtonElement;
        expect(cancelButton.disabled).toBe(true);

        fireEvent.click(cancelButton);
        expect(cancelTorrentJobMock).not.toHaveBeenCalled();
    });
});
