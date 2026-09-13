import {
    CancelTorrentJobRequest,
    CancelTorrentJobResponse,
    DeleteTorrentJobRequest,
    DeleteTorrentJobResponse,
    GetTorrentJobRequest,
    GetTorrentJobResponse,
    ListTorrentJobsRequest,
    ListTorrentJobsResponse,
    PauseTorrentJobRequest,
    PauseTorrentJobResponse,
    ResumeTorrentJobRequest,
    ResumeTorrentJobResponse,
    TorrentAPI,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface ITorrentService {
    ListTorrentJobs(req: ListTorrentJobsRequest): Promise<ListTorrentJobsResponse>;
    GetTorrentJob(req: GetTorrentJobRequest): Promise<GetTorrentJobResponse>;
    CancelTorrentJob(req: CancelTorrentJobRequest): Promise<CancelTorrentJobResponse>;
    PauseTorrentJob(req: PauseTorrentJobRequest): Promise<PauseTorrentJobResponse>;
    ResumeTorrentJob(req: ResumeTorrentJobRequest): Promise<ResumeTorrentJobResponse>;
    DeleteTorrentJob(req: DeleteTorrentJobRequest): Promise<DeleteTorrentJobResponse>;
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
}

export const torrentService = new TorrentService();
