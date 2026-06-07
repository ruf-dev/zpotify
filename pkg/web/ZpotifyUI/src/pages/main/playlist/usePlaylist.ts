import { useState, useEffect } from 'react';

import type { Playlist } from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';

export function usePlaylist(id: string | undefined) {
    const toaster = useToaster();
    const userData = useUser((state) => state.userData);
    const Services = useUser((state) => state.Services);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);

    useEffect(() => {
        if (!userData || !id) return;
        Services()
            .Playlist()
            .GetPlaylist(id)
            .then((res) => setPlaylist(res.playlist ?? null))
            .catch(toaster.catch);
    }, [id, userData]);

    return { playlist };
}
