import {ArtistBase, ListSongsRequest, ListSongsResponse, SongBase, ZpotifyAPI} from "@zpotify/api";

import {Song, SongList} from "@/model/Song";

import {InitReq} from "@/processes/Api.ts";
import {AuthMiddleware} from "@/processes/Auth.ts";
import {handleError} from "@/processes/ErrorCodes.ts";
import {BaseService} from "@/processes/BaseService.ts";

import {formatDuration} from "@/utils/time.ts";
import {RefObject} from "react";


export interface ISongsService {
    ListSongs: (limit: number, offset: number, randomHash: number | null, playlistId?: string) => Promise<SongList>
}

export class SongsService extends BaseService implements ISongsService {
    constructor(authMiddleware: RefObject<AuthMiddleware>) {
        super(authMiddleware)
    }

    async ListSongs(limit: number, offset: number, randomHash: number | null, playlistId?: string): Promise<SongList> {
        const req: ListSongsRequest = {
            paging: {
                limit: limit.toString(),
                offset: offset.toString(),
            },
            randomHash: randomHash ? randomHash : undefined,
            playlistId: playlistId
        } as ListSongsRequest

        return this.executeAuthApiCall((initReq: InitReq) => {
                console.log(initReq)

                return ZpotifyAPI
                    .ListSongs(req, initReq)
                    .then(mapSongsList)
                    .catch(handleError)
                    .then()
            }
        )
    }
}


function mapSongsList(resp: ListSongsResponse): SongList {
    return {
        songs: (resp.songs || []).map(mapSong),
        total: resp.total || 0
    } as SongList
}

function mapSong(s: SongBase): Song {
    return {
        uniqueId: s.uniqueId,
        title: s.title,
        artistsNames: (s.artists || []).map((a: ArtistBase) => a.name),
        duration: formatDuration(s.durationSec || 0),
    } as Song
}
