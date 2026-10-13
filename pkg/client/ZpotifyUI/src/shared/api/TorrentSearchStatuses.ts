import { TorrentSearchStatus } from '@/app/api/zpotify';

export const TORRENT_SEARCH_STATUSES = {
    unspecified: TorrentSearchStatus.TORRENT_SEARCH_STATUS_UNSPECIFIED,
    disabled: TorrentSearchStatus.TORRENT_SEARCH_STATUS_DISABLED,
    unreachable: TorrentSearchStatus.TORRENT_SEARCH_STATUS_UNREACHABLE,
    available: TorrentSearchStatus.TORRENT_SEARCH_STATUS_AVAILABLE,
} as const;
