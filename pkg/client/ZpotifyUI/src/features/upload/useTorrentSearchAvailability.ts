import { useQuery } from '@tanstack/react-query';

import { settingsService } from '@/shared/api/HomePage.ts';

export function useTorrentSearchAvailability(): boolean {
    const query = useQuery({
        queryKey: ['torrentSearchAvailability'],
        queryFn: () => settingsService.IsTorrentSearchAvailable(),
        staleTime: 60_000,
    });

    return query.data === true;
}
