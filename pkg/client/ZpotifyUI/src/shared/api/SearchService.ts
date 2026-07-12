export interface SearchArtistResult {
    uuid: string;
    name: string;
    seed: number;
    trackCount?: number;
    coverUrl?: string;
}

export interface SearchAlbumResult {
    uuid: string;
    name: string;
    artistNames: string;
    seed: number;
    coverUrl?: string;
}

export interface SearchPlaylistResult {
    uuid: string;
    name: string;
    songCount?: number;
    description?: string;
    seed: number;
    coverUrl?: string;
    tracks: { title: string; artist: string }[];
}

export interface SearchFilters {
    artists: boolean;
    albums: boolean;
    playlists: boolean;
}

export interface SearchResponse {
    artists: SearchArtistResult[];
    albums: SearchAlbumResult[];
    playlists: SearchPlaylistResult[];
}

const MOCK_ARTISTS: SearchArtistResult[] = [
    { uuid: 'artist-1', name: 'Axiom Drive', seed: 1, trackCount: 14 },
    { uuid: 'artist-2', name: 'Vela', seed: 2, trackCount: 9 },
    { uuid: 'artist-3', name: 'Lumine', seed: 3, trackCount: 18 },
    { uuid: 'artist-4', name: 'Cold Type', seed: 4, trackCount: 6 },
    { uuid: 'artist-5', name: 'Deep Signal', seed: 7, trackCount: 41 },
];

const MOCK_ALBUMS: SearchAlbumResult[] = [
    { uuid: 'album-1', name: 'Dark Matter', artistNames: 'Axiom Drive', seed: 1 },
    { uuid: 'album-2', name: 'Structures', artistNames: 'Vela', seed: 2 },
    { uuid: 'album-3', name: 'Soft Machinery', artistNames: 'Lumine', seed: 3 },
    { uuid: 'album-4', name: 'Threshold EP', artistNames: 'Cold Type', seed: 4 },
    { uuid: 'album-5', name: 'Depths', artistNames: 'Deep Signal', seed: 5 },
];

const MOCK_PLAYLISTS: SearchPlaylistResult[] = [
    {
        uuid: 'playlist-1',
        name: 'Late Night Coding',
        songCount: 34,
        description: 'ruf',
        seed: 3,
        tracks: [
            { title: 'Night Drive', artist: 'Axiom Drive' },
            { title: 'Static Bloom', artist: 'Vela' },
            { title: 'Glass Halls', artist: 'Lumine' },
        ],
    },
    {
        uuid: 'playlist-2',
        name: 'Focus Mode',
        songCount: 21,
        description: 'ruf',
        seed: 5,
        tracks: [
            { title: 'Signal Path', artist: 'Deep Signal' },
            { title: 'Low Light', artist: 'Cold Type' },
        ],
    },
    {
        uuid: 'playlist-3',
        name: 'Soft Architecture',
        songCount: 18,
        description: 'zpotify editorial',
        seed: 2,
        tracks: [
            { title: 'Frame', artist: 'Vela' },
            { title: 'Corridor', artist: 'Lumine' },
        ],
    },
    {
        uuid: 'playlist-4',
        name: 'Raw Frequencies',
        songCount: 44,
        description: 'noisefloor.club',
        seed: 6,
        tracks: [
            { title: 'Static Bloom', artist: 'Vela' },
            { title: 'Undertow', artist: 'Deep Signal' },
        ],
    },
    {
        uuid: 'playlist-5',
        name: 'Morning Ritual',
        songCount: 12,
        description: 'ruf',
        seed: 4,
        tracks: [
            { title: 'First Light', artist: 'Cold Type' },
            { title: 'Slow Wake', artist: 'Axiom Drive' },
        ],
    },
];

export interface ISearchService {
    Search(query: string, filters: SearchFilters): Promise<SearchResponse>;
}

export class SearchService implements ISearchService {
    async Search(query: string, filters: SearchFilters): Promise<SearchResponse> {
        // TODO: no unified search endpoint exists server-side yet — SongAPI.SearchSongs and
        // ArtistsAPI.ListArtist(filters.search) exist individually, and ListPlaylistsRequest has
        // no search field at all. This stub returns constant mock data; replace with a real call
        // once a combined artists/albums/playlists search endpoint is added to the backend.
        void query;
        void filters;
        return Promise.resolve({ artists: MOCK_ARTISTS, albums: MOCK_ALBUMS, playlists: MOCK_PLAYLISTS });
    }
}

export const searchService = new SearchService();
