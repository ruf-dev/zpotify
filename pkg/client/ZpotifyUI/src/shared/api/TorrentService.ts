import {
    CancelTorrentJobRequest,
    CancelTorrentJobResponse,
    GetTorrentJobRequest,
    GetTorrentJobResponse,
    ListTorrentJobsRequest,
    ListTorrentJobsResponse,
    TorrentAPI,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface ITorrentService {
    ListTorrentJobs(req: ListTorrentJobsRequest): Promise<ListTorrentJobsResponse>;
    GetTorrentJob(req: GetTorrentJobRequest): Promise<GetTorrentJobResponse>;
    CancelTorrentJob(req: CancelTorrentJobRequest): Promise<CancelTorrentJobResponse>;
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
}

export const torrentService = new TorrentService();
