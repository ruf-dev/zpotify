/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";


export type TorrentJob = {
  id?: string;
  torrentName?: string;
  folderName?: string;
  status?: string;
  totalBytes?: string;
  downloadedBytes?: string;
  importedFiles?: ImportedFile[];
  error?: string;
};

export type ImportedFile = {
  torrentPath?: string;
  fileId?: string;
  status?: string;
  error?: string;
};

export type ListTorrentJobsRequest = {
  folderName?: string;
};

export type ListTorrentJobsResponse = {
  jobs?: TorrentJob[];
};

export type ListTorrentJobs = Record<string, never>;

export type GetTorrentJobRequest = {
  jobId?: string;
};

export type GetTorrentJobResponse = {
  job?: TorrentJob;
};

export type GetTorrentJob = Record<string, never>;

export type CancelTorrentJobRequest = {
  jobId?: string;
};

export type CancelTorrentJobResponse = Record<string, never>;

export type CancelTorrentJob = Record<string, never>;

export class TorrentAPI {
  static ListTorrentJobs(this:void, req: ListTorrentJobsRequest, initReq?: fm.InitReq): Promise<ListTorrentJobsResponse> {
    return fm.fetchRequest<ListTorrentJobsResponse>(`/api/torrents/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static GetTorrentJob(this:void, req: GetTorrentJobRequest, initReq?: fm.InitReq): Promise<GetTorrentJobResponse> {
    return fm.fetchRequest<GetTorrentJobResponse>(`/api/torrents/${req.jobId}?${fm.renderURLSearchParams(req, ["jobId"])}`, {...initReq, method: "GET"});
  }
  static CancelTorrentJob(this:void, req: CancelTorrentJobRequest, initReq?: fm.InitReq): Promise<CancelTorrentJobResponse> {
    return fm.fetchRequest<CancelTorrentJobResponse>(`/api/torrents/${req.jobId}/cancel`, {...initReq, method: "POST"});
  }
}