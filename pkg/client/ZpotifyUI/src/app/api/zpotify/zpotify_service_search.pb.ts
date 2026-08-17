/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
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

export type RecordSearchQueryRequest = {
  query?: string;
};

export type RecordSearchQueryResponse = Record<string, never>;

export type RecordSearchQuery = Record<string, never>;

export type RecordSearchFindingRequest = {
  query?: string;
  findingType?: string;
  findingId?: string;
  findingName?: string;
  findingCoverUrl?: string;
};

export type RecordSearchFindingResponse = Record<string, never>;

export type RecordSearchFinding = Record<string, never>;

export type ListSearchHistoryRequest = Record<string, never>;

export type ListSearchHistoryResponse = {
  entries?: SearchHistoryEntry[];
};

export type ListSearchHistory = Record<string, never>;

export type SearchHistoryEntry = {
  query?: string;
  findingType?: string;
  findingId?: string;
  findingName?: string;
  findingCoverUrl?: string;
  createdAt?: GoogleProtobufTimestamp.Timestamp;
};

export class SearchAPI {
  static Search(this:void, req: SearchRequest, initReq?: fm.InitReq): Promise<SearchResponse> {
    return fm.fetchRequest<SearchResponse>(`/api/search`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static RecordSearchQuery(this:void, req: RecordSearchQueryRequest, initReq?: fm.InitReq): Promise<RecordSearchQueryResponse> {
    return fm.fetchRequest<RecordSearchQueryResponse>(`/api/search/history/query`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static RecordSearchFinding(this:void, req: RecordSearchFindingRequest, initReq?: fm.InitReq): Promise<RecordSearchFindingResponse> {
    return fm.fetchRequest<RecordSearchFindingResponse>(`/api/search/history/finding`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static ListSearchHistory(this:void, req: ListSearchHistoryRequest, initReq?: fm.InitReq): Promise<ListSearchHistoryResponse> {
    return fm.fetchRequest<ListSearchHistoryResponse>(`/api/search/history?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
}