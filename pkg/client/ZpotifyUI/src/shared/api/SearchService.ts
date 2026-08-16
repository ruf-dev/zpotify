import {
    SearchAPI,
    type SearchRequest,
    type SearchResponse as WireSearchResponse,
    type SearchFilters as ProtoSearchFilters,
    type Paging,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { uuidToSeed } from '@/shared/api/PlaylistService.ts';

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
    artists: Array<{ uuid: string; name: string }>;
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

export interface SearchTrackResult {
    uuid: string;
    title: string;
    artists: Array<{ uuid?: string; name: string }>;
    coverUrl?: string;
    durationSec: number;
    filePath?: string;
    containerPlaylist?: { uuid: string; name: string; isAlbum: boolean };
}

export interface SearchFilters {
    tracks: boolean;
    artists: boolean;
    albums: boolean;
    playlists: boolean;
}

export interface SearchResponse {
    tracks: SearchTrackResult[];
    artists: SearchArtistResult[];
    albums: SearchAlbumResult[];
    playlists: SearchPlaylistResult[];
}

const DEFAULT_PAGE_LIMIT = 20;

type WireTrackResult = NonNullable<WireSearchResponse['tracks']>[number];
type WireArtistResult = NonNullable<WireSearchResponse['artists']>[number];
type WireAlbumResult = NonNullable<WireSearchResponse['albums']>[number];
type WirePlaylistResult = NonNullable<WireSearchResponse['playlists']>[number];

export interface ISearchService {
    Search(query: string, filters: SearchFilters): Promise<SearchResponse>;
}

export class SearchService extends BaseService implements ISearchService {
    async Search(query: string, filters: SearchFilters): Promise<SearchResponse> {
        // filters here only controls which sections are shown client-side (see useSearchPage);
        // the backend's SearchFilters.tags is reserved for future genre/mood chips, always sent empty.
        void filters;
        const protoFilters: ProtoSearchFilters = { tags: [] };
        const req: SearchRequest = {
            query,
            paging: { limit: DEFAULT_PAGE_LIMIT.toString(), offset: '0' } as Paging,
            filters: protoFilters,
        };

        return this.executeAuthApiCall((initReq) => SearchAPI.Search(req, initReq)).then(toSearchResponse);
    }
}

function toSearchResponse(resp: WireSearchResponse): SearchResponse {
    return {
        tracks: (resp.tracks ?? []).map(toSearchTrackResult),
        artists: (resp.artists ?? []).map(toSearchArtistResult),
        albums: (resp.albums ?? []).map(toSearchAlbumResult),
        playlists: (resp.playlists ?? []).map(toSearchPlaylistResult),
    };
}

function toSearchTrackResult(t: WireTrackResult): SearchTrackResult {
    const song = t.song;
    const container = t.containerPlaylist;
    return {
        uuid: song?.id ?? '',
        title: song?.title ?? '',
        artists: (song?.artists ?? []).filter((a) => a.name).map((a) => ({ uuid: a.uuid, name: a.name ?? '' })),
        coverUrl: buildCoverUrl(song?.coverFilePath),
        durationSec: song?.durationSec ?? 0,
        filePath: song?.filePath,
        containerPlaylist: container?.uuid
            ? { uuid: container.uuid, name: container.name ?? '', isAlbum: container.isAlbum ?? false }
            : undefined,
    };
}

function toSearchArtistResult(a: WireArtistResult): SearchArtistResult {
    const uuid = a.artist?.uuid ?? '';
    return {
        uuid,
        name: a.artist?.name ?? '',
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(a.artist?.avatarFilePath),
    };
}

function toSearchAlbumResult(a: WireAlbumResult): SearchAlbumResult {
    const playlist = a.playlist;
    const uuid = playlist?.uuid ?? '';
    return {
        uuid,
        name: playlist?.name ?? '',
        artists: (playlist?.artists ?? [])
            .filter((ar): ar is { uuid: string; name: string } => !!ar.uuid && !!ar.name)
            .map((ar) => ({ uuid: ar.uuid, name: ar.name })),
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(playlist?.coverFilePath),
    };
}

function toSearchPlaylistResult(p: WirePlaylistResult): SearchPlaylistResult {
    const playlist = p.playlist;
    const uuid = playlist?.uuid ?? '';
    return {
        uuid,
        name: playlist?.name ?? '',
        songCount: playlist?.songCount,
        description: playlist?.description,
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(playlist?.coverFilePath),
        tracks: [],
    };
}

export const searchService = new SearchService();
