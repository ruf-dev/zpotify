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

export type PauseTorrentJobRequest = {
  jobId?: string;
};

export type PauseTorrentJobResponse = Record<string, never>;

export type PauseTorrentJob = Record<string, never>;

export type ResumeTorrentJobRequest = {
  jobId?: string;
};

export type ResumeTorrentJobResponse = Record<string, never>;

export type ResumeTorrentJob = Record<string, never>;

export type DeleteTorrentJobRequest = {
  jobId?: string;
};

export type DeleteTorrentJobResponse = Record<string, never>;

export type DeleteTorrentJob = Record<string, never>;

export type WatchTorrentJobsRequest = {
  folderName?: string;
  limit?: number;
};

export type WatchTorrentJobsResponse = {
  job?: TorrentJob;
};

export type WatchTorrentJobs = Record<string, never>;

export type TorrentFile = {
  id?: string;
  torrentName?: string;
  files?: TorrentFileEntry[];
};

export type TorrentFileEntry = {
  path?: string;
  sizeBytes?: string;
  supported?: boolean;
};

export type GetTorrentFileRequest = {
  id?: string;
};

export type GetTorrentFileResponse = {
  file?: TorrentFile;
};

export type GetTorrentFile = Record<string, never>;

export type SubmitTorrentFileRequest = {
  id?: string;
  folderName?: string;
  selectedPaths?: string[];
};

export type SubmitTorrentFileResponse = {
  jobId?: string;
};

export type SubmitTorrentFile = Record<string, never>;

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
  static PauseTorrentJob(this:void, req: PauseTorrentJobRequest, initReq?: fm.InitReq): Promise<PauseTorrentJobResponse> {
    return fm.fetchRequest<PauseTorrentJobResponse>(`/api/torrents/${req.jobId}/pause`, {...initReq, method: "POST"});
  }
  static ResumeTorrentJob(this:void, req: ResumeTorrentJobRequest, initReq?: fm.InitReq): Promise<ResumeTorrentJobResponse> {
    return fm.fetchRequest<ResumeTorrentJobResponse>(`/api/torrents/${req.jobId}/resume`, {...initReq, method: "POST"});
  }
  static DeleteTorrentJob(this:void, req: DeleteTorrentJobRequest, initReq?: fm.InitReq): Promise<DeleteTorrentJobResponse> {
    return fm.fetchRequest<DeleteTorrentJobResponse>(`/api/torrents/${req.jobId}?${fm.renderURLSearchParams(req, ["jobId"])}`, {...initReq, method: "DELETE"});
  }
  static WatchTorrentJobs(this:void, req: WatchTorrentJobsRequest, entityNotifier?: fm.NotifyStreamEntityArrival<WatchTorrentJobsResponse>, initReq?: fm.InitReq): Promise<void> {
    return fm.fetchStreamingRequest<WatchTorrentJobsResponse>(`/api/torrents/watch`, entityNotifier, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static GetTorrentFile(this:void, req: GetTorrentFileRequest, initReq?: fm.InitReq): Promise<GetTorrentFileResponse> {
    return fm.fetchRequest<GetTorrentFileResponse>(`/api/torrents/files/${req.id}?${fm.renderURLSearchParams(req, ["id"])}`, {...initReq, method: "GET"});
  }
  static SubmitTorrentFile(this:void, req: SubmitTorrentFileRequest, initReq?: fm.InitReq): Promise<SubmitTorrentFileResponse> {
    return fm.fetchRequest<SubmitTorrentFileResponse>(`/api/torrents/files/${req.id}/submit`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}