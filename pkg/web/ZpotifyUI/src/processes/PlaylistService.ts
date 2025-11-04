import {
    GetPlaylistRequest,
    GetPlaylistResponse,
    ZpotifyAPI
} from "@zpotify/api";

import {Playlist} from "@/model/Playlist.ts";
import {BaseService} from "@/processes/BaseService.ts";

export interface IPlaylistService {
    GetPlaylist(uuid: string): Promise<Playlist>
}


export class PlaylistService extends BaseService implements IPlaylistService {
    async GetPlaylist(uuid: string): Promise<Playlist> {
        return this.executeAuthApiCall(async (initReq) => {
            const req = {
                uuid: uuid,
            } as GetPlaylistRequest

            return ZpotifyAPI
                .GetPlaylist(req, initReq)
                .then(toPlaylist)
        })
    }
}

function toPlaylist(pbPlaylist: GetPlaylistResponse): Playlist {
    if (!pbPlaylist.playlist) {
        throw new Error("playlist is empty")
    }

    return {
        uuid: pbPlaylist.playlist.uuid,
        title: pbPlaylist.playlist.name,
        description: pbPlaylist.playlist.description,
    } as Playlist
}
