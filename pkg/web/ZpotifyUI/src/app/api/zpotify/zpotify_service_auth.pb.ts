/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
import * as ZpotifyApiZpotifyUser from "./zpotify_user.pb";

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export type GetAuthMethodsRequest = Record<string, never>;

export type GetAuthMethodsResponse = {
  authMethods?: ZpotifyApiZpotifyUser.AuthMethods[];
};

export type GetAuthMethods = Record<string, never>;

export type AuthViaAsyncRequest = Record<string, never>;

type BaseAuthViaAsyncResponse = {
};

export type AuthViaAsyncResponse = BaseAuthViaAsyncResponse &
  OneOf<{
    authUuid: string;
    authData: AuthData;
  }>;

export type AuthViaAsync = Record<string, never>;

type BaseAuthRequest = {
};

export type AuthRequest = BaseAuthRequest &
  OneOf<{
    logPass: AuthLogPass;
  }>;

export type AuthResponse = {
  authData?: AuthData;
};

export type AuthLogPass = {
  login?: string;
  password?: string;
};

export type Auth = Record<string, never>;

export type RefreshRequest = {
  refreshToken?: string;
};

export type RefreshResponse = {
  authData?: AuthData;
};

export type Refresh = Record<string, never>;

export type AuthData = {
  accessToken?: string;
  refreshToken?: string;
  accessExpiresAt?: GoogleProtobufTimestamp.Timestamp;
  refreshExpiresAt?: GoogleProtobufTimestamp.Timestamp;
};

export class AuthAPI {
  static GetAuthMethods(this:void, req: GetAuthMethodsRequest, initReq?: fm.InitReq): Promise<GetAuthMethodsResponse> {
    return fm.fetchRequest<GetAuthMethodsResponse>(`/api/auth/auth_methods?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static Auth(this:void, req: AuthRequest, initReq?: fm.InitReq): Promise<AuthResponse> {
    return fm.fetchRequest<AuthResponse>(`/api/auth/sync`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static AuthAsync(this:void, req: AuthViaAsyncRequest, entityNotifier?: fm.NotifyStreamEntityArrival<AuthViaAsyncResponse>, initReq?: fm.InitReq): Promise<void> {
    return fm.fetchStreamingRequest<AuthViaAsyncResponse>(`/api/auth/async`, entityNotifier, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static RefreshToken(this:void, req: RefreshRequest, initReq?: fm.InitReq): Promise<RefreshResponse> {
    return fm.fetchRequest<RefreshResponse>(`/api/auth/refresh_token`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}