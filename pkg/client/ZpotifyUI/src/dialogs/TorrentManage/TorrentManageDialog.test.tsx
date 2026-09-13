import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import TorrentManageDialog from '@/dialogs/TorrentManage/TorrentManageDialog';
import type { TorrentJob } from '@/app/api/zpotify';

const getTorrentJobMock = vi.fn();
const pauseTorrentJobMock = vi.fn();
const resumeTorrentJobMock = vi.fn();
const deleteTorrentJobMock = vi.fn();
vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        GetTorrentJob: (...args: unknown[]) => getTorrentJobMock(...args),
        PauseTorrentJob: (...args: unknown[]) => pauseTorrentJobMock(...args),
        ResumeTorrentJob: (...args: unknown[]) => resumeTorrentJobMock(...args),
        DeleteTorrentJob: (...args: unknown[]) => deleteTorrentJobMock(...args),
    },
}));

const openDialogMock = vi.fn();
const closeDialogMock = vi.fn();
vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({
        OpenDialog: openDialogMock,
        CloseDialog: closeDialogMock,
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

    it('calls PauseTorrentJob when the toggle button is clicked while downloading', async () => {
        const job = makeJob({ status: 'downloading' });
        getTorrentJobMock.mockResolvedValue({ job });
        pauseTorrentJobMock.mockResolvedValue({});

        render(<TorrentManageDialog job={job} />);

        const toggleButton = screen.getByRole('button', { name: 'pause' });
        expect((toggleButton as HTMLButtonElement).disabled).toBe(false);

        await act(async () => {
            fireEvent.click(toggleButton);
            await Promise.resolve();
        });

        expect(pauseTorrentJobMock).toHaveBeenCalledWith({ jobId: 'job1' });
    });

    it('calls ResumeTorrentJob when the toggle button is clicked while paused', async () => {
        const job = makeJob({ status: 'paused' });
        getTorrentJobMock.mockResolvedValue({ job });
        resumeTorrentJobMock.mockResolvedValue({});

        render(<TorrentManageDialog job={job} />);

        const toggleButton = screen.getByRole('button', { name: 'resume' });

        await act(async () => {
            fireEvent.click(toggleButton);
            await Promise.resolve();
        });

        expect(resumeTorrentJobMock).toHaveBeenCalledWith({ jobId: 'job1' });
    });

    it('hides the pause toggle button when the job is terminal', () => {
        const job = makeJob({ status: 'done' });
        getTorrentJobMock.mockResolvedValue({ job });

        render(<TorrentManageDialog job={job} />);

        expect(screen.queryByRole('button', { name: 'pause' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'resume' })).toBeNull();
    });

    it('opens the confirm dialog and deletes the job on confirm', async () => {
        const job = makeJob({ status: 'downloading' });
        getTorrentJobMock.mockResolvedValue({ job });
        deleteTorrentJobMock.mockResolvedValue({});

        render(<TorrentManageDialog job={job} />);

        const deleteButton = screen.getByText('delete');
        fireEvent.click(deleteButton);

        expect(openDialogMock).toHaveBeenCalledTimes(1);
        const confirmDialogElement = openDialogMock.mock.calls[0][0];
        const onConfirm = confirmDialogElement.props.onConfirm as () => Promise<void>;

        await act(async () => {
            await onConfirm();
        });

        expect(deleteTorrentJobMock).toHaveBeenCalledWith({ jobId: 'job1' });
        expect(closeDialogMock).toHaveBeenCalled();
    });
});
