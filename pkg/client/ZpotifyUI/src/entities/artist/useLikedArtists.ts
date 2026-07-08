import { create } from 'zustand';

import { artistsService } from '@/shared/api/ArtistsService';
import type { ArtistBase } from '@/app/api/zpotify';

const LIKED_ARTISTS_FETCH_LIMIT = 10000;

interface LikedArtistsState {
    likedArtists: ArtistBase[];
    likedArtistIds: Set<string>;
    loaded: boolean;

    fetchLikedArtists: () => Promise<void>;
    likeArtist: (artist: { id: string; name: string }) => Promise<void>;
    unlikeArtist: (artistId: string) => Promise<void>;
}

export const useLikedArtists = create<LikedArtistsState>((set, get) => ({
    likedArtists: [],
    likedArtistIds: new Set(),
    loaded: false,

    fetchLikedArtists: async () => {
        if (get().loaded) return;

        const resp = await artistsService.ListArtist('', 0, LIKED_ARTISTS_FETCH_LIMIT, true);
        const artists = resp.artists ?? [];
        const ids = new Set(artists.map((a) => a.uuid).filter((id): id is string => !!id));
        set({ likedArtists: artists, likedArtistIds: ids, loaded: true });
    },

    likeArtist: async (artist: { id: string; name: string }) => {
        const optimisticArtist: ArtistBase = { uuid: artist.id, name: artist.name, liked: true };

        set((s) => ({
            likedArtists: [...s.likedArtists, optimisticArtist],
            likedArtistIds: new Set(s.likedArtistIds).add(artist.id),
        }));
        try {
            await artistsService.LikeArtist(artist.id);
        } catch (e) {
            set((s) => {
                const nextIds = new Set(s.likedArtistIds);
                nextIds.delete(artist.id);
                return {
                    likedArtists: s.likedArtists.filter((a) => a.uuid !== artist.id),
                    likedArtistIds: nextIds,
                };
            });
            throw e;
        }
    },

    unlikeArtist: async (artistId: string) => {
        const previousArtists = get().likedArtists;

        set((s) => {
            const nextIds = new Set(s.likedArtistIds);
            nextIds.delete(artistId);
            return {
                likedArtists: s.likedArtists.filter((a) => a.uuid !== artistId),
                likedArtistIds: nextIds,
            };
        });
        try {
            await artistsService.UnlikeArtist(artistId);
        } catch (e) {
            set((s) => ({
                likedArtists: previousArtists,
                likedArtistIds: new Set(s.likedArtistIds).add(artistId),
            }));
            throw e;
        }
    },
}));
