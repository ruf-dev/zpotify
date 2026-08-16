/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type SearchRequest = {
  query?: string;
  paging?: ZpotifyApiZpotifyCommon.Paging;
  filters?: SearchFilters;
};

export type SearchResponse = {
  tracks?: SearchTrackResult[];
  artists?: SearchArtistResult[];
  albums?: SearchAlbumResult[];
  playlists?: SearchPlaylistResult[];
};

export type SearchTrackResult = {
  song?: ZpotifyApiZpotifyCommon.SongBase;
  score?: number;
  containerPlaylist?: SearchContainerPlaylist;
};

export type SearchContainerPlaylist = {
  uuid?: string;
  name?: string;
  isAlbum?: boolean;
};

export type SearchArtistResult = {
  artist?: ZpotifyApiZpotifyCommon.ArtistBase;
  score?: number;
};

export type SearchAlbumResult = {
  playlist?: ZpotifyApiZpotifyCommon.Playlist;
  score?: number;
};

export type SearchPlaylistResult = {
  playlist?: ZpotifyApiZpotifyCommon.Playlist;
  score?: number;
};

export type Search = Record<string, never>;

export type SearchFilters = {
  tags?: string[];
};

export class SearchAPI {
  static Search(this:void, req: SearchRequest, initReq?: fm.InitReq): Promise<SearchResponse> {
    return fm.fetchRequest<SearchResponse>(`/api/search`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}