import {useQuery} from '@tanstack/react-query';

import type {Playlist} from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import {playlistService} from '@/shared/api/PlaylistService.ts';

export function usePlaylist(id: string | undefined) {
    const userData = useUser((state) => state.userData);

    const {data: playlist = null, isLoading} = useQuery<Playlist | null>({
        queryKey: ['playlist', id],
        queryFn: () => playlistService.GetPlaylist(id!).then((res) => res.playlist ?? null),
        enabled: !!userData && !!id,
    });

    return {playlist, isLoading};
}
