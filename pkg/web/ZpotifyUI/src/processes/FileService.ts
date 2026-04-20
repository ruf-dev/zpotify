import {
    FileMetaAPI,
    ListUploadedFilesRequest,
    ListUploadedFilesResponse,
} from "@/app/api/zpotify";

import {BaseService} from "@/processes/BaseService.ts";

export interface IFileService {
    ListUploadedFiles(req: ListUploadedFilesRequest): Promise<ListUploadedFilesResponse>
}

export class FileService extends BaseService implements IFileService {
    async ListUploadedFiles(req: ListUploadedFilesRequest): Promise<ListUploadedFilesResponse> {
        return this.executeAuthApiCall(
            async (initReq) => {
                return FileMetaAPI.ListUploadedFiles(req, initReq)
            })
    }
}
