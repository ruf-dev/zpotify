import { useState, useEffect } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';

export function useAlbumSongs(id: string | undefined) {
    const toaster = useToaster();
    const userData = useUser((state) => state.userData);
    const Services = useUser((state) => state.Services);
    const [songs, setSongs] = useState<SongBase[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userData || !id) return;
        setIsLoading(true);
        Services()
            .Playlist()
            .ListSongs(id, 0, 100, undefined)
            .then((resp) => setSongs(resp.songs ?? []))
            .catch(toaster.catch)
            .finally(() => setIsLoading(false));
    }, [id, userData]);

    return { songs, isLoading };
}
