import { describe, expect, it } from 'vitest';

import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';
import { isTorrentSearchVisible } from '@/shared/lib/torrentSearchStatus.ts';

describe('isTorrentSearchVisible', () => {
    it('returns true when the status is available', () => {
        expect(isTorrentSearchVisible(TORRENT_SEARCH_STATUSES.available)).toBe(true);
    });

    it('returns true when the status is unreachable', () => {
        expect(isTorrentSearchVisible(TORRENT_SEARCH_STATUSES.unreachable)).toBe(true);
    });

    it('returns false when the status is disabled', () => {
        expect(isTorrentSearchVisible(TORRENT_SEARCH_STATUSES.disabled)).toBe(false);
    });

    it('returns false when the status is unspecified', () => {
        expect(isTorrentSearchVisible(TORRENT_SEARCH_STATUSES.unspecified)).toBe(false);
    });
});
