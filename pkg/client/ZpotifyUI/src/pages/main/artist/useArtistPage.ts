import { useQuery } from '@tanstack/react-query';

import type { GetArtistPageResponse } from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';

export function useArtistPage(id: string | undefined) {
    const userData = useUser((state) => state.userData);

    const {
        data: artistPage = null,
        isLoading,
        error,
    } = useQuery<GetArtistPageResponse | null>({
        queryKey: ['artist-page', id],
        queryFn: () => artistsService.GetArtistPage(id!),
        enabled: !!userData && !!id,
    });

    return { artistPage, isLoading, error };
}
