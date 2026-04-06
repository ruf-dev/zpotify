/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";
import * as ZpotifyApiZpotifyUser from "./zpotify_user.pb";
import * as ZpotifyApiZpotifyUserSettings from "./zpotify_user_settings.pb";


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

export type UserData = {
  username?: string;
};

export type MeRequest = Record<string, never>;

export type MeResponse = {
  userData?: UserData;
  permissions?: ZpotifyApiZpotifyUser.Permissions;
};

export type Me = Record<string, never>;

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
  id?: string;
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

export type GetUserSettingsRequest = Record<string, never>;

export type GetUserSettingsResponse = {
  settings?: ZpotifyApiZpotifyUserSettings.UserSettings;
};

export type GetUserSettings = Record<string, never>;

export type GetPlaylistRequest = {
  uuid?: string;
};

export type GetPlaylistResponse = {
  playlist?: ZpotifyApiZpotifyCommon.Playlist;
};

export type GetPlaylist = Record<string, never>;

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
    return fm.fetchRequest<DeleteSongResponse>(`/api/songs/${req.id}?${fm.renderURLSearchParams(req, ["id"])}`, {...initReq, method: "DELETE"});
  }
  static GetPlaylist(this:void, req: GetPlaylistRequest, initReq?: fm.InitReq): Promise<GetPlaylistResponse> {
    return fm.fetchRequest<GetPlaylistResponse>(`/api/playlist/${req.uuid}?${fm.renderURLSearchParams(req, ["uuid"])}`, {...initReq, method: "GET"});
  }
}


export class UserAPI {
  static Me(this:void, req: MeRequest, initReq?: fm.InitReq): Promise<MeResponse> {
    return fm.fetchRequest<MeResponse>(`/api/user/me?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static GetUserSettings(this:void, req: GetUserSettingsRequest, initReq?: fm.InitReq): Promise<GetUserSettingsResponse> {
    return fm.fetchRequest<GetUserSettingsResponse>(`/api/user/settings?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
}