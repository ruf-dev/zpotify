import { describe, expect, it } from 'vitest';

import { mergeTorrentFiles } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';

describe('mergeTorrentFiles', () => {
    it('merges progress and import outcome for a file present in both lists', () => {
        const rows = mergeTorrentFiles(
            [{ path: 'a.mp3', downloadedBytes: '500', totalBytes: '1000' }],
            [{ torrentPath: 'a.mp3', status: 'ok', fileDeleted: true }],
        );

        expect(rows).toEqual([
            {
                path: 'a.mp3',
                downloadedBytes: '500',
                totalBytes: '1000',
                status: 'ok',
                error: undefined,
                fileDeleted: true,
            },
        ]);
    });

    it('keeps a file that only has download progress', () => {
        const rows = mergeTorrentFiles([{ path: 'b.mp3', downloadedBytes: '100', totalBytes: '200' }], []);

        expect(rows).toEqual([{ path: 'b.mp3', downloadedBytes: '100', totalBytes: '200' }]);
    });

    it('keeps a file that only has an import outcome', () => {
        const rows = mergeTorrentFiles([], [{ torrentPath: 'c.mp3', status: 'failed', error: 'unsupported' }]);

        expect(rows).toEqual([
            {
                path: 'c.mp3',
                status: 'failed',
                error: 'unsupported',
                fileDeleted: undefined,
            },
        ]);
    });

    it('skips entries with no path', () => {
        const rows = mergeTorrentFiles([{ downloadedBytes: '1' }], [{ status: 'ok' }]);

        expect(rows).toEqual([]);
    });
});
