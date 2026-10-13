import { useQuery } from '@tanstack/react-query';

import type { TorrentSearchStatus } from '@/app/api/zpotify';
import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';
import { settingsService } from '@/shared/api/HomePage.ts';

export function useTorrentSearchStatus(): TorrentSearchStatus {
    const query = useQuery({
        queryKey: ['torrentSearchStatus'],
        queryFn: () => settingsService.GetTorrentSearchStatus(),
        staleTime: 60_000,
    });

    return query.data ?? TORRENT_SEARCH_STATUSES.unspecified;
}
