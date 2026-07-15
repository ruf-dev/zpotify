/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type FeedDay = {
  date?: GoogleProtobufTimestamp.Timestamp;
  playlistsAdded?: ZpotifyApiZpotifyCommon.Playlist[];
  songsAdded?: ZpotifyApiZpotifyCommon.SongBase[];
  artistsAdded?: ZpotifyApiZpotifyCommon.ArtistBase[];
};

export type GetFeedRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
};

export type GetFeedResponse = {
  days?: FeedDay[];
  totalDays?: number;
};

export type GetFeed = Record<string, never>;

export class HomeAPI {
  static GetFeed(this:void, req: GetFeedRequest, initReq?: fm.InitReq): Promise<GetFeedResponse> {
    return fm.fetchRequest<GetFeedResponse>(`/api/home/feed`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}