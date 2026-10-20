import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentJobRow from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/components/TorrentJobRow/TorrentJobRow.tsx';
import type { TorrentJob } from '@/app/api/zpotify';

const job: TorrentJob = {
    id: 'job1',
    torrentName: 'ubuntu.torrent',
    status: 'downloading',
    totalBytes: '1000',
    downloadedBytes: '250',
    importedFiles: [],
};

function renderRow() {
    const onClick = vi.fn();
    const onCopyMagnet = vi.fn();
    render(<TorrentJobRow job={job} onClick={onClick} onCopyMagnet={onCopyMagnet} />);
    return { onClick, onCopyMagnet };
}

describe('TorrentJobRow', () => {
    afterEach(() => {
        cleanup();
    });

    it('calls onCopyMagnet and not onClick when the copy magnet button is clicked', () => {
        const { onClick, onCopyMagnet } = renderRow();

        fireEvent.click(screen.getByRole('button', { name: 'copy magnet' }));

        expect(onCopyMagnet).toHaveBeenCalledWith(job);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when Enter is pressed on the copy magnet button', () => {
        const { onClick } = renderRow();

        fireEvent.keyDown(screen.getByRole('button', { name: 'copy magnet' }), { key: 'Enter' });

        expect(onClick).not.toHaveBeenCalled();
    });

    it('calls onClick when the row is clicked', () => {
        const { onClick } = renderRow();

        fireEvent.click(screen.getByText('ubuntu.torrent'));

        expect(onClick).toHaveBeenCalledWith(job);
    });
});
