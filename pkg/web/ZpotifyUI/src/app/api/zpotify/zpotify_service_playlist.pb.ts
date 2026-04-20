/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type ListSongsRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
  randomHash?: string;
  playlistUuid?: string;
};

export type ListSongsResponse = {
  songs?: ZpotifyApiZpotifyCommon.SongBase[];
  total?: number;
};

export type ListSongs = Record<string, never>;

export type DeleteSongRequest = {
  playlistUuid?: string;
  songId?: number;
};

export type DeleteSongResponse = Record<string, never>;

export type DeleteSong = Record<string, never>;

export type CreatePlaylistRequest = {
  name?: string;
  description?: string;
};

export type CreatePlaylistResponse = {
  uuid?: string;
};

export type CreatePlaylist = Record<string, never>;

export type GetPlaylistRequest = {
  uuid?: string;
};

export type GetPlaylistResponse = {
  playlist?: ZpotifyApiZpotifyCommon.Playlist;
};

export type GetPlaylist = Record<string, never>;

export type ChangeSongsOrderRequest = Record<string, never>;

export type ChangeSongsOrderResponse = Record<string, never>;

export type ChangeSongsOrder = Record<string, never>;

export type AddSongToPlaylistRequest = {
  playlistUuid?: string;
  songId?: number;
};

export type AddSongToPlaylistResponse = Record<string, never>;

export type AddSongToPlaylist = Record<string, never>;

export class PlaylistAPI {
  static CreatePlaylist(this:void, req: CreatePlaylistRequest, initReq?: fm.InitReq): Promise<CreatePlaylistResponse> {
    return fm.fetchRequest<CreatePlaylistResponse>(`/api/playlist/create`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static GetPlaylist(this:void, req: GetPlaylistRequest, initReq?: fm.InitReq): Promise<GetPlaylistResponse> {
    return fm.fetchRequest<GetPlaylistResponse>(`/api/playlist/${req.uuid}?${fm.renderURLSearchParams(req, ["uuid"])}`, {...initReq, method: "GET"});
  }
  static DeleteSong(this:void, req: DeleteSongRequest, initReq?: fm.InitReq): Promise<DeleteSongResponse> {
    return fm.fetchRequest<DeleteSongResponse>(`/api/playlist/delete_song`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static ListSongs(this:void, req: ListSongsRequest, initReq?: fm.InitReq): Promise<ListSongsResponse> {
    return fm.fetchRequest<ListSongsResponse>(`/api/playlist/songs`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static ChangeSongsOrder(this:void, req: ChangeSongsOrderRequest, initReq?: fm.InitReq): Promise<ChangeSongsOrderResponse> {
    return fm.fetchRequest<ChangeSongsOrderResponse>(`/api/playlist/songs/order`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static AddSongToPlaylist(this:void, req: AddSongToPlaylistRequest, initReq?: fm.InitReq): Promise<AddSongToPlaylistResponse> {
    return fm.fetchRequest<AddSongToPlaylistResponse>(`/api/playlist/add_song`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}