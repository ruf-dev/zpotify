/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";
import * as ZpotifyApiZpotifyUser from "./zpotify_user.pb";

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export type VersionRequest = Record<string, never>;

export type VersionResponse = {
  version?: string;
  clientTimestamp?: GoogleProtobufTimestamp.Timestamp;
};

export type Version = Record<string, never>;

export type GetLinkRequest = {
  tgId?: string;
};

export type GetLinkResponse = {
  url?: string;
};

export type GetLink = Record<string, never>;

export type AuthRequest = Record<string, never>;

type BaseAuthResponse = {
};

export type AuthResponse = BaseAuthResponse &
  OneOf<{
    authUuid: string;
    authData: AuthAuthData;
  }>;

export type AuthAuthData = {
  accessToken?: string;
  refreshToken?: string;
  accessExpiresAt?: GoogleProtobufTimestamp.Timestamp;
  refreshExpiresAt?: GoogleProtobufTimestamp.Timestamp;
};

export type Auth = Record<string, never>;

export type UserData = {
  username?: string;
};

export type MeRequest = Record<string, never>;

export type MeResponse = {
  userData?: UserData;
  permissions?: ZpotifyApiZpotifyUser.Permissions;
};

export type Me = Record<string, never>;

export type RefreshRequest = {
  refreshToken?: string;
};

export type RefreshResponse = {
  authData?: AuthAuthData;
};

export type Refresh = Record<string, never>;

export type ListSongsRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
  randomHash?: string;
  playlistId?: string;
};

export type ListSongsResponse = {
  songs?: ZpotifyApiZpotifyCommon.SongBase[];
  total?: string;
  userCanDelete?: boolean;
};

export type ListSongs = Record<string, never>;

export type DeleteSongRequest = {
  uniqueId?: string;
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

export class ZpotifyAPI {
  static Version(this:void, req: VersionRequest, initReq?: fm.InitReq): Promise<VersionResponse> {
    return fm.fetchRequest<VersionResponse>(`/api/version?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static ListSongs(this:void, req: ListSongsRequest, initReq?: fm.InitReq): Promise<ListSongsResponse> {
    return fm.fetchRequest<ListSongsResponse>(`/api/songs`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static CreatePlaylist(this:void, req: CreatePlaylistRequest, initReq?: fm.InitReq): Promise<CreatePlaylistResponse> {
    return fm.fetchRequest<CreatePlaylistResponse>(`/api/playlist`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static DeleteSong(this:void, req: DeleteSongRequest, initReq?: fm.InitReq): Promise<DeleteSongResponse> {
    return fm.fetchRequest<DeleteSongResponse>(`/api/songs/${req.uniqueId}?${fm.renderURLSearchParams(req, ["uniqueId"])}`, {...initReq, method: "DELETE"});
  }
}


export class UserAPI {
  static Auth(this:void, req: AuthRequest, entityNotifier?: fm.NotifyStreamEntityArrival<AuthResponse>, initReq?: fm.InitReq): Promise<void> {
    return fm.fetchStreamingRequest<AuthResponse>(`/api/user/auth`, entityNotifier, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static RefreshToken(this:void, req: RefreshRequest, initReq?: fm.InitReq): Promise<RefreshResponse> {
    return fm.fetchRequest<RefreshResponse>(`/api/user/refresh_token`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static Me(this:void, req: MeRequest, initReq?: fm.InitReq): Promise<MeResponse> {
    return fm.fetchRequest<MeResponse>(`/api/user?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
}