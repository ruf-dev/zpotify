import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentJobItem from '@/dialogs/AddTrack/screens/components/TorrentJobItem/TorrentJobItem';
import type { TorrentJob } from '@/app/api/zpotify';

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return {
        id: '1',
        torrentName: 'ubuntu.torrent',
        status: 'downloading',
        totalBytes: '1000',
        downloadedBytes: '250',
        ...overrides,
    };
}

describe('TorrentJobItem', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the torrent name, status and progress percentage', () => {
        const job = makeJob({});
        render(<TorrentJobItem job={job} onManage={vi.fn()} />);

        expect(screen.getByText('ubuntu.torrent')).not.toBeNull();
        expect(screen.getByText('downloading')).not.toBeNull();
        expect(screen.getByText(/25%/)).not.toBeNull();
    });

    it('shows 0% when totalBytes is zero or missing', () => {
        const job = makeJob({ totalBytes: '0', downloadedBytes: '0' });
        render(<TorrentJobItem job={job} onManage={vi.fn()} />);

        expect(screen.getByText(/0%/)).not.toBeNull();
    });

    it('renders the job error when present', () => {
        const job = makeJob({ error: 'disk full' });
        render(<TorrentJobItem job={job} onManage={vi.fn()} />);

        expect(screen.getByText('disk full')).not.toBeNull();
    });

    it('calls onManage with the job when the Manage button is clicked', () => {
        const job = makeJob({});
        const onManage = vi.fn();
        render(<TorrentJobItem job={job} onManage={onManage} />);

        fireEvent.click(screen.getByText('Manage'));

        expect(onManage).toHaveBeenCalledWith(job);
    });
});
