/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";


export enum FeatureFlagId {
  FEATURE_FLAG_ID_UNSPECIFIED = "FEATURE_FLAG_ID_UNSPECIFIED",
  IS_COMMENTS_ON_ALBUM_ENABLED = "IS_COMMENTS_ON_ALBUM_ENABLED",
}

export type FeatureFlag = {
  id?: FeatureFlagId;
  isEnabled?: boolean;
  value?: string;
};

export type GetFeatureFlagsRequest = Record<string, never>;

export type GetFeatureFlagsResponse = {
  flags?: FeatureFlag[];
};

export type GetFeatureFlags = Record<string, never>;

export class FeatureFlagsAPI {
  static GetFeatureFlags(this:void, req: GetFeatureFlagsRequest, initReq?: fm.InitReq): Promise<GetFeatureFlagsResponse> {
    return fm.fetchRequest<GetFeatureFlagsResponse>(`/api/feature-flags?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
}