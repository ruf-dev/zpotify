import { useEffect, useRef, useState } from 'react';

import type { SongBase } from '@/app/api/zpotify';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const SONGS_PER_PAGE = 25;

interface UseListSongsOptions {
    onTotal?: (total: number) => void;
    autoLoadAll?: boolean;
}

export function useListSongs(playlistId: string, options: UseListSongsOptions = {}) {
    const { onTotal, autoLoadAll } = options;
    const toaster = useToaster();

    const register = useSongListRefresh((s) => s.register);
    const unregister = useSongListRefresh((s) => s.unregister);
    const version = useSongListRefresh((s) => s.versions[playlistId] ?? 0);
    const prevVersion = useRef(version);

    const [songs, setSongs] = useState<SongBase[]>([]);
    const [offset, setOffset] = useState(0);
    const [totalSongs, setTotalSongs] = useState(0);
    const [isListEnded, setIsListEnded] = useState(false);
    const [pageKey, setPageKey] = useState(0);

    useEffect(() => {
        register(playlistId);
        return () => unregister(playlistId);
    }, [playlistId]);

    useEffect(() => {
        if (version === prevVersion.current) return;
        prevVersion.current = version;
        setSongs([]);
        setOffset(0);
        setTotalSongs(0);
        setIsListEnded(false);
        setPageKey((k) => k + 1);
    }, [version]);

    function loadPage(pageOffset: number, hash?: string) {
        playlistService
            .ListSongs(playlistId, pageOffset, SONGS_PER_PAGE, hash)
            .then((resp) => {
                const incoming = resp.songs ?? [];
                setSongs((prev) => [
                    ...prev,
                    ...incoming.filter((s) => !prev.some((old) => old.id === s.id)),
                ]);
                const total = resp.total ?? 0;
                setTotalSongs(total);
                if (onTotal != null && resp.total != null) onTotal(resp.total);
                if (autoLoadAll && pageOffset + SONGS_PER_PAGE < total) {
                    setOffset((prev) => prev + SONGS_PER_PAGE);
                }
            })
            .catch(toaster.catch);
    }

    useEffect(() => {
        loadPage(offset);
    }, [offset, pageKey]);

    useEffect(() => {
        setIsListEnded(totalSongs === songs.length);
    }, [songs, totalSongs]);

    function loadMore() {
        setOffset((prev) => prev + SONGS_PER_PAGE);
    }

    function loadShuffled(hash: string): Promise<string> {
        return playlistService
            .ListSongs(playlistId, 0, songs.length, hash)
            .then((resp) => {
                if (!resp.songs) return '';
                setSongs(resp.songs);
                setIsListEnded(resp.total === resp.songs.length);
                return resp.songs[0]?.id ?? '';
            })
            .catch(toaster.catch)
            .then((id) => id ?? '');
    }

    return { songs, totalSongs, isListEnded, loadMore, loadShuffled };
}
