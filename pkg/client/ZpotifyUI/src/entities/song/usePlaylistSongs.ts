import { useEffect, useRef, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import useUser from '@/entities/user/useUser.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const SONGS_PER_PAGE = 100;

export function usePlaylistSongs(id: string | undefined) {
    const toaster = useToaster();
    const userData = useUser((state) => state.userData);

    const register = useSongListRefresh((s) => s.register);
    const unregister = useSongListRefresh((s) => s.unregister);
    const version = useSongListRefresh((s) => s.versions[id ?? ''] ?? 0);
    const prevVersion = useRef(version);

    const [songs, setSongs] = useState<SongBase[]>([]);
    const [offset, setOffset] = useState(0);
    const [totalSongs, setTotalSongs] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isListEnded, setIsListEnded] = useState(false);
    const loadedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!id) return;
        register(id);
        return () => unregister(id);
    }, [id]);

    useEffect(() => {
        if (version === prevVersion.current) return;
        prevVersion.current = version;
        setSongs([]);
        setOffset(0);
        setTotalSongs(0);
        setIsListEnded(false);
    }, [version]);

    useEffect(() => {
        if (!userData || !id) return;

        setIsLoading(true);
        playlistService
            .ListSongs(id, offset, SONGS_PER_PAGE, undefined)
            .then((resp) => {
                const incoming = resp.songs ?? [];
                setSongs((prev) => (offset === 0 ? incoming : [...prev, ...incoming]));
                const total = resp.total ?? 0;
                setTotalSongs(total);
                setIsListEnded(offset + incoming.length >= total);
                loadedIdRef.current = id;
            })
            .catch(toaster.catch)
            .finally(() => setIsLoading(false));
    }, [id, userData, offset, version]);

    function loadMore() {
        setOffset((prev) => prev + SONGS_PER_PAGE);
    }

    const isInitialLoading = isLoading && loadedIdRef.current !== id;

    return { songs, totalSongs, isLoading, isInitialLoading, isListEnded, loadMore };
}
