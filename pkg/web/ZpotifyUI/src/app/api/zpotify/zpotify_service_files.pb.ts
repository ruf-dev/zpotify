/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type ListUploadedFilesRequest = {
  temporaryOnly?: boolean;
};

export type ListUploadedFilesResponse = {
  files?: ZpotifyApiZpotifyCommon.SongFile[];
};

export type ListUploadedFiles = Record<string, never>;

export class FileMetaAPI {
  static ListUploadedFiles(this:void, req: ListUploadedFilesRequest, initReq?: fm.InitReq): Promise<ListUploadedFilesResponse> {
    return fm.fetchRequest<ListUploadedFilesResponse>(`/api/file_meta/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}