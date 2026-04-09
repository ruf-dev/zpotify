/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyUser from "./zpotify_user.pb";
import * as ZpotifyApiZpotifyUserSettings from "./zpotify_user_settings.pb";


export type UserData = {
  username?: string;
};

export type MeRequest = Record<string, never>;

export type MeResponse = {
  userData?: UserData;
  permissions?: ZpotifyApiZpotifyUser.Permissions;
};

export type Me = Record<string, never>;

export type GetUserSettingsRequest = Record<string, never>;

export type GetUserSettingsResponse = {
  settings?: ZpotifyApiZpotifyUserSettings.UserSettings;
};

export type GetUserSettings = Record<string, never>;

export class UserAPI {
  static Me(this:void, req: MeRequest, initReq?: fm.InitReq): Promise<MeResponse> {
    return fm.fetchRequest<MeResponse>(`/api/user/me?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static GetUserSettings(this:void, req: GetUserSettingsRequest, initReq?: fm.InitReq): Promise<GetUserSettingsResponse> {
    return fm.fetchRequest<GetUserSettingsResponse>(`/api/user/settings?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
}