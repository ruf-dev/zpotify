import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { TorrentJob } from '@/app/api/zpotify';
import RecentTorrentsPanel from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel';

vi.mock('@/dialogs/TorrentManage/TorrentManageDialog.tsx', () => ({ default: () => null }));

const useDialogMock = { OpenDialog: vi.fn(), CloseDialog: vi.fn() };
vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => useDialogMock,
}));

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return {
        id: '1',
        torrentName: 'ubuntu.torrent',
        status: 'downloading',
        totalBytes: '1000',
        downloadedBytes: '250',
        importedFiles: [],
        ...overrides,
    };
}

describe('RecentTorrentsPanel job list', () => {
    const onFile = vi.fn();

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should render an add torrent call to action when loading is false and jobs are empty', () => {
        render(<RecentTorrentsPanel jobs={[]} loading={false} onFile={onFile} />);

        expect(screen.getByText('upload a .torrent file to start downloading')).not.toBeNull();
    });

    it('should show skeleton loaders when loading is true and no jobs', () => {
        const { container } = render(<RecentTorrentsPanel jobs={[]} loading={true} onFile={onFile} />);

        const skeletonRows = container.querySelectorAll('[class*="SkeletonRow"]');
        expect(skeletonRows.length).toBe(3);
    });

    it('should render job rows when jobs are provided', () => {
        const jobs = [makeJob({ id: '1', torrentName: 'ubuntu.torrent' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('ubuntu.torrent')).not.toBeNull();
        expect(screen.getByText('downloading')).not.toBeNull();
    });

    it('should show progress percentage', () => {
        const jobs = [makeJob({ id: '1', totalBytes: '1000', downloadedBytes: '500' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('50%')).not.toBeNull();
    });

    it('should show file sizes', () => {
        const jobs = [makeJob({ id: '1', totalBytes: '1000', downloadedBytes: '250' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText(/KB/)).not.toBeNull();
    });

    it('should display imported files count', () => {
        const jobs = [
            makeJob({
                id: '1',
                importedFiles: [{ torrentPath: 'file1.mp3' }, { torrentPath: 'file2.mp3' }],
            }),
        ];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('2 files')).not.toBeNull();
    });

    it('should show status dot with correct color for done status', () => {
        const jobs = [makeJob({ id: '1', status: 'done' })];

        const { container } = render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        const statusDots = container.querySelectorAll('[class*="StatusDot"]');
        expect(statusDots.length).toBeGreaterThan(0);
    });

    it('should call OpenDialog when a job row is clicked', () => {
        const jobs = [makeJob({ id: '1', torrentName: 'ubuntu.torrent' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        const jobRow = screen.getByText('ubuntu.torrent').closest('[role="button"]');
        if (jobRow) {
            fireEvent.click(jobRow);
        }

        expect(useDialogMock.OpenDialog).toHaveBeenCalled();
    });

    it('should display up to 3 jobs', () => {
        const jobs = [
            makeJob({ id: '1', torrentName: 'torrent1.torrent' }),
            makeJob({ id: '2', torrentName: 'torrent2.torrent' }),
            makeJob({ id: '3', torrentName: 'torrent3.torrent' }),
            makeJob({ id: '4', torrentName: 'torrent4.torrent' }),
        ];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('torrent1.torrent')).not.toBeNull();
        expect(screen.getByText('torrent2.torrent')).not.toBeNull();
        expect(screen.getByText('torrent3.torrent')).not.toBeNull();
        expect(screen.queryByText('torrent4.torrent')).toBeNull();
    });

    it('should show correct status for paused jobs', () => {
        const jobs = [makeJob({ id: '1', status: 'paused' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('paused')).not.toBeNull();
    });

    it('should show 0% when totalBytes is zero', () => {
        const jobs = [makeJob({ id: '1', totalBytes: '0', downloadedBytes: '0' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('0%')).not.toBeNull();
    });

    it('should render a panel header with title', () => {
        const jobs = [makeJob({ id: '1' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('recent torrents')).not.toBeNull();
    });
});

describe('RecentTorrentsPanel add torrent trigger', () => {
    const onFile = vi.fn();

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should render the add torrent trigger even when jobs exist', () => {
        const jobs = [makeJob({ id: '1' })];

        render(<RecentTorrentsPanel jobs={jobs} loading={false} onFile={onFile} />);

        expect(screen.getByText('add torrent')).not.toBeNull();
    });

    it('should render the add torrent trigger when jobs are empty', () => {
        render(<RecentTorrentsPanel jobs={[]} loading={false} onFile={onFile} />);

        expect(screen.getByText('add torrent')).not.toBeNull();
    });

    it('should trigger file input click when add torrent trigger is clicked', () => {
        const { container } = render(<RecentTorrentsPanel jobs={[]} loading={false} onFile={onFile} />);

        const trigger = screen.getByText('add torrent').closest('[role="button"]');
        if (trigger) {
            fireEvent.click(trigger);
        }

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).not.toBeNull();
        expect(fileInput.accept).toBe('.torrent');
    });

    it('should call onFile with selected file', () => {
        const { container } = render(<RecentTorrentsPanel jobs={[]} loading={false} onFile={onFile} />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['content'], 'test.torrent', { type: 'application/x-torrent' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(onFile).toHaveBeenCalledWith(file);
    });

    it('should clear input value after file selection', () => {
        const { container } = render(<RecentTorrentsPanel jobs={[]} loading={false} onFile={onFile} />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['content'], 'test.torrent');

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(fileInput.value).toBe('');
    });
});
