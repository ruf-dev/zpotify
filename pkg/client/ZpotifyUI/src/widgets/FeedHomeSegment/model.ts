import type { LibraryItem } from '@/widgets/PlaylistsLibrarySegment/model.ts';

export type FeedSongArtist = {
    uuid?: string;
    name: string;
};

export type FeedSongItem = {
    id: string;
    title: string;
    artists: FeedSongArtist[];
    coverUrl?: string;
    durationSec: number;
};

export type FeedArtistItem = {
    uuid: string;
    name: string;
    seed: number;
};

export type FeedDay = {
    date: string;
    playlistsAdded: LibraryItem[];
    songsAdded: FeedSongItem[];
    artistsAdded: FeedArtistItem[];
};
