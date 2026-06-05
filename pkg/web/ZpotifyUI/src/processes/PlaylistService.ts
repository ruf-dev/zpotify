import {
    PlaylistAPI,
    Paging,

    ListSongsResponse, ListSongsRequest,
    GetPlaylistResponse, GetPlaylistRequest,
    CreatePlaylistResponse, CreatePlaylistRequest,
    AddSongToPlaylistRequest,

} from "@/app/api/zpotify";

import {BaseService} from "@/processes/BaseService.ts";

export interface IPlaylistService {
    ListSongs(uuid: string, offset: number, limit: number, shuffleHash: string | undefined): Promise<ListSongsResponse>
    GetPlaylist(uuid: string): Promise<GetPlaylistResponse>
    CreatePlaylist(name: string, artistUuids?: string[], coverFileId?: string): Promise<CreatePlaylistResponse>
    AddSongToPlaylist(playlistUuid: string, songId: number): Promise<void>
}

export class PlaylistService extends BaseService implements IPlaylistService {
    async ListSongs(uuid: string, offset: number, limit: number, shuffleHash: string | undefined): Promise<ListSongsResponse> {
        const req = {
            uuid: uuid,
            paging: {
                limit: limit.toString(),
                offset: offset.toString(),
            } as Paging,
            randomHash: shuffleHash
        } as ListSongsRequest

        return this.executeAuthApiCall(
            async (initReq) => {
                return PlaylistAPI.ListSongs(req, initReq)
            })
    }

    async GetPlaylist(uuid: string): Promise<GetPlaylistResponse> {
        const req = { uuid } as GetPlaylistRequest
        return this.executeAuthApiCall(
            async (initReq) => {
                return PlaylistAPI.GetPlaylist(req, initReq)
            })
    }

    async CreatePlaylist(name: string, artistUuids?: string[], coverFileId?: string): Promise<CreatePlaylistResponse> {
        const req: CreatePlaylistRequest = { name, artistUuids, coverFileId }
        return this.executeAuthApiCall(
            async (initReq) => {
                return PlaylistAPI.CreatePlaylist(req, initReq)
            })
    }

    async AddSongToPlaylist(playlistUuid: string, songId: number): Promise<void> {
        const req: AddSongToPlaylistRequest = { playlistUuid, songId }
        return this.executeAuthApiCall(
            async (initReq) => {
                return PlaylistAPI.AddSongToPlaylist(req, initReq).then(() => undefined)
            })
    }
}

