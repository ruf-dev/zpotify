import { useState, useEffect } from 'react';

import type { Playlist } from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';

export function usePlaylist(id: string | undefined) {
    const toaster = useToaster();
    const userData = useUser((state) => state.userData);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    useEffect(() => {
        if (!userData || !id) return;
        playlistService
            .GetPlaylist(id)
            .then((res) => setPlaylist(res.playlist ?? null))
            .catch(toaster.catch);
    }, [id, userData]);

    return { playlist };
}
