import {Song, SongList} from "@/model/Song";
import {apiPrefix} from "@/processes/Api.ts";
import {ArtistBase, ListSongsRequest, ListSongsResponse, SongBase, ZpotifyAPI} from "@zpotify/api";
import {formatDuration} from "@/utils/time.ts";

export async function ListSongs(limit: number, offset: number, randomHash: number | null, playlistId?: string): Promise<SongList> {
    const req: ListSongsRequest = {
        paging: {
            limit: limit.toString(),
            offset: offset.toString(),
        },
        randomHash: randomHash ? randomHash : undefined,
        playlistId: playlistId
    } as ListSongsRequest


    return ZpotifyAPI.ListSongs(req, apiPrefix())
        .then((resp: ListSongsResponse) => {
            return {
                songs: (resp.songs || []).map(mapSongs),
                total: resp.total || 0
            } as SongList
        })
        .catch((err) => {
            // TODO remove onto normal alerting
            alert(err.message)
            throw err
        })
}

function mapSongs(s: SongBase): Song {
    return {
        uniqueId: s.uniqueId,
        title: s.title,
        artistsNames: (s.artists || []).map((a: ArtistBase) => a.name),
        duration: formatDuration(s.durationSec || 0),
    } as Song
}
