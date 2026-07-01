import {
    PlaylistAPI,
    Paging,
    ListSongsResponse,
    ListSongsRequest,
    GetPlaylistResponse,
    GetPlaylistRequest,
    CreatePlaylistResponse,
    CreatePlaylistRequest,
    UpdatePlaylistRequest,
    ChangeSongsOrderRequest,
    AddSongToPlaylistRequest,
    AddSongsToPlaylistRequest,
    ListPlaylistsRequest,
    ListPlaylistsResponse,
    type PlaylistChip,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';
import type { LibraryItem, TrackPreview } from '@/widgets/PlaylistsLibrarySegment/model.ts';

export type LibraryFilter = {
    limit: number;
    offset: number;
    trackPreviewLimit?: number;
};

type PlaylistData = {
    uuid?: string;
    name?: string;
    description?: string;
    artists?: Array<{ name?: string }>;
    songCount?: number;
    coverFilePath?: string;
};

function buildCoverUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string | undefined) ?? '';
    return `${base}/${filePath}`;
}

function uuidToSeed(uuid: string): number {
    let sum = 0;
    for (const ch of uuid) sum += ch.charCodeAt(0);
    return (sum % 7) + 1;
}

function toAlbumItem(a: PlaylistData): LibraryItem & { kind: 'album' } {
    const uuid = a.uuid ?? '';
    return {
        kind: 'album',
        uuid,
        name: a.name ?? '',
        artistNames: (a.artists ?? []).map((ar) => ar.name ?? '').join(', '),
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(a.coverFilePath),
    };
}

function toPlaylistItem(p: PlaylistData, tracks: TrackPreview[]): LibraryItem & { kind: 'playlist' } {
    const uuid = p.uuid ?? '';
    return {
        kind: 'playlist',
        uuid,
        name: p.name ?? '',
        songCount: p.songCount,
        description: p.description,
        seed: uuidToSeed(uuid),
        coverUrl: buildCoverUrl(p.coverFilePath),
        tracks,
    };
}

function mapToTrackPreviews(songs: Array<{ title?: string; artists?: Array<{ name?: string }> }>): TrackPreview[] {
    return songs.map((s) => ({
        title: s.title ?? '',
        artist: (s.artists ?? []).map((a) => a.name ?? '').join(', '),
    }));
}

function interleave(
    playlists: PlaylistData[],
    albums: PlaylistData[],
    trackMap: Record<string, TrackPreview[]>,
): LibraryItem[] {
    const result: LibraryItem[] = [];
    let pi = 0;
    let ai = 0;
    while (pi < playlists.length || ai < albums.length) {
        if (pi < playlists.length) {
            const p = playlists[pi++];
            result.push(toPlaylistItem(p, trackMap[p.uuid ?? ''] ?? []));
        }
        if (ai < albums.length) {
            result.push(toAlbumItem(albums[ai++]));
        }
        if (ai < albums.length) {
            result.push(toAlbumItem(albums[ai++]));
        }
    }
    return result;
}

export interface IPlaylistService {
    ListSongs(uuid: string, offset: number, limit: number, shuffleHash: string | undefined): Promise<ListSongsResponse>;
    GetPlaylist(uuid: string): Promise<GetPlaylistResponse>;
    CreatePlaylist(name: string, artistUuids?: string[], coverFileId?: string, year?: number, chips?: PlaylistChip[]): Promise<CreatePlaylistResponse>;
    UpdatePlaylist(uuid: string, name?: string, description?: string, artistUuids?: string[], coverFileId?: string, year?: number, chips?: PlaylistChip[]): Promise<void>;
    ChangeSongsOrder(playlistUuid: string, songIds: number[]): Promise<void>;
    AddSongToPlaylist(playlistUuid: string, songId: number): Promise<void>;
    ListUserPlaylists(limit: number, offset: number): Promise<ListPlaylistsResponse>;
    ListLibrary(filter: LibraryFilter): Promise<LibraryItem[]>;
}

export class PlaylistService extends BaseService implements IPlaylistService {
    async ListSongs(
        uuid: string,
        offset: number,
        limit: number,
        shuffleHash: string | undefined,
    ): Promise<ListSongsResponse> {
        const req = {
            playlistUuid: uuid,
            paging: {
                limit: limit.toString(),
                offset: offset.toString(),
            } as Paging,
            randomHash: shuffleHash,
        } as ListSongsRequest;

        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.ListSongs(req, initReq);
        });
    }

    async GetPlaylist(uuid: string): Promise<GetPlaylistResponse> {
        const req = { uuid } as GetPlaylistRequest;
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.GetPlaylist(req, initReq);
        });
    }

    async CreatePlaylist(name: string, artistUuids?: string[], coverFileId?: string, year?: number, chips?: PlaylistChip[]): Promise<CreatePlaylistResponse> {
        const req: CreatePlaylistRequest = { name, artistUuids, coverFileId, year, chips };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.CreatePlaylist(req, initReq);
        });
    }

    async UpdatePlaylist(uuid: string, name?: string, description?: string, artistUuids?: string[], coverFileId?: string, year?: number, chips?: PlaylistChip[]): Promise<void> {
        const req: UpdatePlaylistRequest = { uuid, name, description, artistUuids, coverFileId, year, chips };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.UpdatePlaylist(req, initReq).then(() => undefined);
        });
    }

    async ChangeSongsOrder(playlistUuid: string, songIds: number[]): Promise<void> {
        const req: ChangeSongsOrderRequest = { playlistUuid, songIds: songIds.map(String) };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.ChangeSongsOrder(req, initReq).then(() => undefined);
        });
    }

    async AddSongToPlaylist(playlistUuid: string, songId: number): Promise<void> {
        const req: AddSongToPlaylistRequest = { playlistUuid, songId };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.AddSongToPlaylist(req, initReq).then(() => undefined);
        });
    }

    async AddSongsToPlaylist(playlistUuid: string, songIds: number[]): Promise<void> {
        const req: AddSongsToPlaylistRequest = { playlistUuid, songIds };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.AddSongsToPlaylist(req, initReq).then(() => undefined);
        });
    }

    async ListUserPlaylists(limit: number, offset: number): Promise<ListPlaylistsResponse> {
        const req: ListPlaylistsRequest = {
            paging: { limit: limit.toString(), offset: offset.toString() } as Paging,
            byAuthedUser: true,
        };
        return this.executeAuthApiCall(async (initReq) => {
            return PlaylistAPI.ListPlaylists(req, initReq);
        });
    }

    async ListLibrary(filter: LibraryFilter): Promise<LibraryItem[]> {
        const playlistsReq: ListPlaylistsRequest = {
            paging: { limit: filter.limit.toString(), offset: filter.offset.toString() } as Paging,
            byAuthedUser: true,
        };
        const resp = await this.executeAuthApiCall((initReq) => PlaylistAPI.ListPlaylists(playlistsReq, initReq));

        const all = resp.playlists ?? [];
        const albums = all.filter((p) => (p.artists?.length ?? 0) > 0);
        const playlists = all.filter((p) => (p.artists?.length ?? 0) === 0);

        const self = this;
        const trackResults = await Promise.all(
            playlists.map(async function fetchTracks(p): Promise<[string, TrackPreview[]]> {
                const uuid = p.uuid ?? '';
                const songsReq = {
                    playlistUuid: uuid,
                    paging: {
                        limit: (filter.trackPreviewLimit ?? 5).toString(),
                        offset: '0',
                    } as Paging,
                } as ListSongsRequest;
                const songsResp = await self.executeAuthApiCall((initReq) => PlaylistAPI.ListSongs(songsReq, initReq));
                return [uuid, mapToTrackPreviews(songsResp.songs ?? [])];
            }),
        );

        const trackMap: Record<string, TrackPreview[]> = Object.fromEntries(trackResults);
        return interleave(playlists, albums, trackMap);
    }
}

export const playlistService = new PlaylistService();
