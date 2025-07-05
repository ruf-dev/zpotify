/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";


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

export class ZpotifyAPI {
  static Version(this:void, req: VersionRequest, initReq?: fm.InitReq): Promise<VersionResponse> {
    return fm.fetchRequest<VersionResponse>(`/api/version?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static GetLink(this:void, req: GetLinkRequest, initReq?: fm.InitReq): Promise<GetLinkResponse> {
    return fm.fetchRequest<GetLinkResponse>(`/api/link/${req.tgId}?${fm.renderURLSearchParams(req, ["tgId"])}`, {...initReq, method: "GET"});
  }
}