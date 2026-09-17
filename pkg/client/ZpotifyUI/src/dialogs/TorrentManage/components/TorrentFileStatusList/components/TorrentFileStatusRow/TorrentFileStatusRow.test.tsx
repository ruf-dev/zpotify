import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import TorrentFileStatusRow from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFileStatusRow/TorrentFileStatusRow';
import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';

function makeFile(overrides: Partial<TorrentFileRow>): TorrentFileRow {
    return {
        path: 'a.mp3',
        ...overrides,
    };
}

describe('TorrentFileStatusRow', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows the removed from library pill instead of a progress bar when deleted', () => {
        const file = makeFile({ status: 'ok', fileDeleted: true, downloadedBytes: '100', totalBytes: '100' });

        render(<TorrentFileStatusRow file={file} />);

        expect(screen.getByText('removed from library')).not.toBeNull();
        expect(screen.queryByText('failed')).toBeNull();
        expect(screen.queryByText(/100 B \/ 100 B/)).toBeNull();
    });

    it('shows the failed pill when the status is failed', () => {
        const file = makeFile({ status: 'failed', error: 'no seeders found' });

        render(<TorrentFileStatusRow file={file} />);

        expect(screen.getByText('failed')).not.toBeNull();
        expect(screen.queryByText('removed from library')).toBeNull();
    });

    it('shows a progress bar when the file is still downloading or ok and not deleted', () => {
        const file = makeFile({ downloadedBytes: '50', totalBytes: '100' });

        render(<TorrentFileStatusRow file={file} />);

        expect(screen.queryByText('failed')).toBeNull();
        expect(screen.queryByText('removed from library')).toBeNull();
    });
});
