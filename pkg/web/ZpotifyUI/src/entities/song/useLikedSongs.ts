import { create } from 'zustand';

import { playlistService } from '@/shared/api/PlaylistService.ts';

const LIKED_SONGS_FETCH_LIMIT = 10000;

interface LikedSongsState {
    likedPlaylistId: string | null;
    likedSongIds: Set<string>;
    loaded: boolean;

    fetchLikedSongs: (likedPlaylistId: string) => Promise<void>;
    likeSong: (songId: string) => Promise<void>;
    unlikeSong: (songId: string) => Promise<void>;
}

export const useLikedSongs = create<LikedSongsState>((set, get) => ({
    likedPlaylistId: null,
    likedSongIds: new Set(),
    loaded: false,

    fetchLikedSongs: async (likedPlaylistId: string) => {
        if (!likedPlaylistId || (get().loaded && get().likedPlaylistId === likedPlaylistId)) return;

        const resp = await playlistService.ListSongs(likedPlaylistId, 0, LIKED_SONGS_FETCH_LIMIT, undefined);
        const ids = new Set((resp.songs ?? []).map((s) => s.id).filter((id): id is string => !!id));
        set({ likedPlaylistId, likedSongIds: ids, loaded: true });
    },

    likeSong: async (songId: string) => {
        const { likedPlaylistId } = get();
        if (!likedPlaylistId) return;

        set((s) => ({ likedSongIds: new Set(s.likedSongIds).add(songId) }));
        try {
            await playlistService.AddSongToPlaylist(likedPlaylistId, Number(songId));
        } catch (e) {
            set((s) => {
                const next = new Set(s.likedSongIds);
                next.delete(songId);
                return { likedSongIds: next };
            });
            throw e;
        }
    },

    unlikeSong: async (songId: string) => {
        const { likedPlaylistId } = get();
        if (!likedPlaylistId) return;

        set((s) => {
            const next = new Set(s.likedSongIds);
            next.delete(songId);
            return { likedSongIds: next };
        });
        try {
            await playlistService.DeleteSong(likedPlaylistId, Number(songId));
        } catch (e) {
            set((s) => ({ likedSongIds: new Set(s.likedSongIds).add(songId) }));
            throw e;
        }
    },
}));
