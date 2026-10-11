import { TorrentFileKind } from '@/app/api/zpotify';

export const TORRENT_FILE_KINDS = {
    unspecified: TorrentFileKind.TORRENT_FILE_KIND_UNSPECIFIED,
    track: TorrentFileKind.TORRENT_FILE_KIND_TRACK,
    cover: TorrentFileKind.TORRENT_FILE_KIND_COVER,
    other: TorrentFileKind.TORRENT_FILE_KIND_OTHER,
} as const;
