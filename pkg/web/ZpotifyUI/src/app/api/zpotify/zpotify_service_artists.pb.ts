/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type ListArtistRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
  filters?: ListArtistFilters;
};

export type ListArtistResponse = {
  artists?: ZpotifyApiZpotifyCommon.ArtistBase[];
};

export type ListArtistFilters = {
  search?: string;
};

export type ListArtist = Record<string, never>;

export class ArtistsAPI {
  static ListArtist(this:void, req: ListArtistRequest, initReq?: fm.InitReq): Promise<ListArtistResponse> {
    return fm.fetchRequest<ListArtistResponse>(`/api/artists/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}