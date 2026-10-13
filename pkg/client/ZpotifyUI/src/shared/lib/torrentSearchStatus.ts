import type { TorrentSearchStatus } from '@/app/api/zpotify';
import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';

export const TORRENT_SEARCH_UNREACHABLE_HINT =
    'Torrent search is temporarily unavailable — ask an administrator to fix it.';

export function isTorrentSearchVisible(status: TorrentSearchStatus): boolean {
    return status === TORRENT_SEARCH_STATUSES.available || status === TORRENT_SEARCH_STATUSES.unreachable;
}
