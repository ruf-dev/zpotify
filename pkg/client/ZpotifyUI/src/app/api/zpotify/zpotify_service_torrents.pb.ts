/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export enum TorrentFileKind {
  TORRENT_FILE_KIND_UNSPECIFIED = "TORRENT_FILE_KIND_UNSPECIFIED",
  TORRENT_FILE_KIND_TRACK = "TORRENT_FILE_KIND_TRACK",
  TORRENT_FILE_KIND_COVER = "TORRENT_FILE_KIND_COVER",
  TORRENT_FILE_KIND_OTHER = "TORRENT_FILE_KIND_OTHER",
}

export type TorrentJob = {
  id?: string;
  torrentName?: string;
  folderName?: string;
  status?: string;
  totalBytes?: string;
  downloadedBytes?: string;
  importedFiles?: ImportedFile[];
  error?: string;
  files?: TorrentFileProgress[];
};

export type ImportedFile = {
  torrentPath?: string;
  fileId?: string;
  status?: string;
  error?: string;
  filePath?: string;
  fileDeleted?: boolean;
};

export type TorrentFileProgress = {
  path?: string;
  downloadedBytes?: string;
  totalBytes?: string;
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
  isResolving?: boolean;
};

export type TorrentFileEntry = {
  path?: string;
  sizeBytes?: string;
  supported?: boolean;
  kind?: TorrentFileKind;
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

export type AddTorrentMagnetRequest = {
  magnetUri?: string;
};

type BaseAddTorrentMagnetResponse = {
};

export type AddTorrentMagnetResponse = BaseAddTorrentMagnetResponse &
  OneOf<{
    uploadId: string;
    existingJobId: string;
  }>;

export type AddTorrentMagnet = Record<string, never>;

export type TorrentSearchResult = {
  id?: string;
  title?: string;
  sizeBytes?: string;
  indexer?: string;
  publishedAt?: GoogleProtobufTimestamp.Timestamp;
  isAlreadyImported?: boolean;
};

export type SearchTorrentsRequest = {
  query?: string;
};

export type SearchTorrentsResponse = {
  results?: TorrentSearchResult[];
};

export type SearchTorrents = Record<string, never>;

export type AddTorrentSearchResultRequest = {
  id?: string;
};

type BaseAddTorrentSearchResultResponse = {
};

export type AddTorrentSearchResultResponse = BaseAddTorrentSearchResultResponse &
  OneOf<{
    uploadId: string;
    existingJobId: string;
  }>;

export type AddTorrentSearchResult = Record<string, never>;

export type DiscardTorrentFileRequest = {
  id?: string;
};

export type DiscardTorrentFileResponse = Record<string, never>;

export type DiscardTorrentFile = Record<string, never>;

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
  static AddTorrentMagnet(this:void, req: AddTorrentMagnetRequest, initReq?: fm.InitReq): Promise<AddTorrentMagnetResponse> {
    return fm.fetchRequest<AddTorrentMagnetResponse>(`/api/torrents/magnet`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static SearchTorrents(this:void, req: SearchTorrentsRequest, initReq?: fm.InitReq): Promise<SearchTorrentsResponse> {
    return fm.fetchRequest<SearchTorrentsResponse>(`/api/torrents/search`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static AddTorrentSearchResult(this:void, req: AddTorrentSearchResultRequest, initReq?: fm.InitReq): Promise<AddTorrentSearchResultResponse> {
    return fm.fetchRequest<AddTorrentSearchResultResponse>(`/api/torrents/search/add`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static DiscardTorrentFile(this:void, req: DiscardTorrentFileRequest, initReq?: fm.InitReq): Promise<DiscardTorrentFileResponse> {
    return fm.fetchRequest<DiscardTorrentFileResponse>(`/api/torrents/files/${req.id}/discard`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}