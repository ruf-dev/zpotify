import { useState, useEffect } from 'react';

import useUser from '@/entities/user/useUser.ts';
import { useToaster } from '@/hooks/toaster/ToasterZ.ts';

export function usePlaylist(id: string | undefined) {
    const toaster = useToaster();
    const userData = useUser((state) => state.userData);
    const Services = useUser((state) => state.Services);
    const [playlistName, setPlaylistName] = useState<string>('');

    useEffect(() => {
        if (!userData || !id) return;
        Services()
            .Playlist()
            .GetPlaylist(id)
            .then((res) => setPlaylistName(res.playlist?.name ?? 'Playlist'))
            .catch(toaster.catch);
    }, [id, userData]);

    return { playlistName };
}
