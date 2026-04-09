import {
    PlaylistAPI,
    Paging,

    ListSongsResponse, ListSongsRequest,

} from "@/app/api/zpotify";

import {BaseService} from "@/processes/BaseService.ts";

export interface IPlaylistService {
    ListSongs(uuid: string, offset: number, limit: number, shuffleHash: string | undefined): Promise<ListSongsResponse>
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
}

