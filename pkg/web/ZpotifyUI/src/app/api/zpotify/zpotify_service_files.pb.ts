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

export type GetFileRequest = {
  fileId?: string;
};

export type GetFileResponse = {
  file?: FileInfo;
};

export type GetFile = Record<string, never>;

export type FileInfo = {
  id?: string;
  path?: string;
  sizeBytes?: string;
  durationSec?: string;
};

export type CheckFilesByHashesRequest = {
  hashes?: string[];
};

export type CheckFilesByHashesFoundFileByHash = {
  hash?: string;
  fileId?: string;
};

export type CheckFilesByHashesResponse = {
  found?: CheckFilesByHashesFoundFileByHash[];
};

export type CheckFilesByHashes = Record<string, never>;

export class FileMetaAPI {
  static ListUploadedFiles(this:void, req: ListUploadedFilesRequest, initReq?: fm.InitReq): Promise<ListUploadedFilesResponse> {
    return fm.fetchRequest<ListUploadedFilesResponse>(`/api/file_meta/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static GetFile(this:void, req: GetFileRequest, initReq?: fm.InitReq): Promise<GetFileResponse> {
    return fm.fetchRequest<GetFileResponse>(`/api/file_meta/${req.fileId}?${fm.renderURLSearchParams(req, ["fileId"])}`, {...initReq, method: "GET"});
  }
  static CheckFilesByHashes(this:void, req: CheckFilesByHashesRequest, initReq?: fm.InitReq): Promise<CheckFilesByHashesResponse> {
    return fm.fetchRequest<CheckFilesByHashesResponse>(`/api/file_meta/check_hashes`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}