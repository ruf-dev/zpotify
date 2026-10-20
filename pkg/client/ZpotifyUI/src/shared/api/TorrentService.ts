import {
    AddTorrentMagnetRequest,
    AddTorrentMagnetResponse,
    AddTorrentSearchResultRequest,
    AddTorrentSearchResultResponse,
    CancelTorrentJobRequest,
    CancelTorrentJobResponse,
    DeleteTorrentJobRequest,
    DeleteTorrentJobResponse,
    DiscardTorrentFileRequest,
    DiscardTorrentFileResponse,
    GetTorrentFileRequest,
    GetTorrentFileResponse,
    GetTorrentJobRequest,
    GetTorrentJobResponse,
    GetTorrentMagnetRequest,
    GetTorrentMagnetResponse,
    ListTorrentJobsRequest,
    ListTorrentJobsResponse,
    NotifyStreamEntityArrival,
    PauseTorrentJobRequest,
    PauseTorrentJobResponse,
    ResumeTorrentJobRequest,
    ResumeTorrentJobResponse,
    SearchTorrentsRequest,
    SearchTorrentsResponse,
    SubmitTorrentFileRequest,
    SubmitTorrentFileResponse,
    TorrentAPI,
    WatchTorrentJobsRequest,
    WatchTorrentJobsResponse,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface ITorrentService {
    ListTorrentJobs(req: ListTorrentJobsRequest): Promise<ListTorrentJobsResponse>;
    GetTorrentJob(req: GetTorrentJobRequest): Promise<GetTorrentJobResponse>;
    GetTorrentMagnet(req: GetTorrentMagnetRequest): Promise<GetTorrentMagnetResponse>;
    CancelTorrentJob(req: CancelTorrentJobRequest): Promise<CancelTorrentJobResponse>;
    PauseTorrentJob(req: PauseTorrentJobRequest): Promise<PauseTorrentJobResponse>;
    ResumeTorrentJob(req: ResumeTorrentJobRequest): Promise<ResumeTorrentJobResponse>;
    DeleteTorrentJob(req: DeleteTorrentJobRequest): Promise<DeleteTorrentJobResponse>;
    GetTorrentFile(req: GetTorrentFileRequest): Promise<GetTorrentFileResponse>;
    SubmitTorrentFile(req: SubmitTorrentFileRequest): Promise<SubmitTorrentFileResponse>;
    AddTorrentMagnet(req: AddTorrentMagnetRequest): Promise<AddTorrentMagnetResponse>;
    SearchTorrents(req: SearchTorrentsRequest): Promise<SearchTorrentsResponse>;
    AddTorrentSearchResult(req: AddTorrentSearchResultRequest): Promise<AddTorrentSearchResultResponse>;
    DiscardTorrentFile(req: DiscardTorrentFileRequest): Promise<DiscardTorrentFileResponse>;
    WatchTorrentJobs(
        req: WatchTorrentJobsRequest,
        entityNotifier: NotifyStreamEntityArrival<WatchTorrentJobsResponse>,
        signal?: AbortSignal,
    ): Promise<void>;
}

export class TorrentService extends BaseService implements ITorrentService {
    async ListTorrentJobs(req: ListTorrentJobsRequest): Promise<ListTorrentJobsResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.ListTorrentJobs(req, initReq);
        });
    }

    async GetTorrentJob(req: GetTorrentJobRequest): Promise<GetTorrentJobResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.GetTorrentJob(req, initReq);
        });
    }

    async GetTorrentMagnet(req: GetTorrentMagnetRequest): Promise<GetTorrentMagnetResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.GetTorrentMagnet(req, initReq);
        });
    }

    async CancelTorrentJob(req: CancelTorrentJobRequest): Promise<CancelTorrentJobResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.CancelTorrentJob(req, initReq);
        });
    }

    async PauseTorrentJob(req: PauseTorrentJobRequest): Promise<PauseTorrentJobResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.PauseTorrentJob(req, initReq);
        });
    }

    async ResumeTorrentJob(req: ResumeTorrentJobRequest): Promise<ResumeTorrentJobResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.ResumeTorrentJob(req, initReq);
        });
    }

    async DeleteTorrentJob(req: DeleteTorrentJobRequest): Promise<DeleteTorrentJobResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.DeleteTorrentJob(req, initReq);
        });
    }

    async GetTorrentFile(req: GetTorrentFileRequest): Promise<GetTorrentFileResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.GetTorrentFile(req, initReq);
        });
    }

    async SubmitTorrentFile(req: SubmitTorrentFileRequest): Promise<SubmitTorrentFileResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.SubmitTorrentFile(req, initReq);
        });
    }

    async AddTorrentMagnet(req: AddTorrentMagnetRequest): Promise<AddTorrentMagnetResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.AddTorrentMagnet(req, initReq);
        });
    }

    async SearchTorrents(req: SearchTorrentsRequest): Promise<SearchTorrentsResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.SearchTorrents(req, initReq);
        });
    }

    async AddTorrentSearchResult(req: AddTorrentSearchResultRequest): Promise<AddTorrentSearchResultResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.AddTorrentSearchResult(req, initReq);
        });
    }

    async DiscardTorrentFile(req: DiscardTorrentFileRequest): Promise<DiscardTorrentFileResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return TorrentAPI.DiscardTorrentFile(req, initReq);
        });
    }

    async WatchTorrentJobs(
        req: WatchTorrentJobsRequest,
        entityNotifier: NotifyStreamEntityArrival<WatchTorrentJobsResponse>,
        signal?: AbortSignal,
    ): Promise<void> {
        return this.executeAuthApiCall(async (initReq) => {
            const streamInitReq = { ...initReq, signal };
            return TorrentAPI.WatchTorrentJobs(req, entityNotifier, streamInitReq);
        });
    }
}

export const torrentService = new TorrentService();
