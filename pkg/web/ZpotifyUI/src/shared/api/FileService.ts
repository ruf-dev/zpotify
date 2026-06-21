import {
    FileMetaAPI,
    GetFileRequest,
    GetFileResponse,
    ListUploadedFilesRequest,
    ListUploadedFilesResponse,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface IFileService {
    ListUploadedFiles(req: ListUploadedFilesRequest): Promise<ListUploadedFilesResponse>;
    GetFile(req: GetFileRequest): Promise<GetFileResponse>;
    checkByHashes(hashes: string[]): Promise<Map<string, string>>;
}

export class FileService extends BaseService implements IFileService {
    async ListUploadedFiles(req: ListUploadedFilesRequest): Promise<ListUploadedFilesResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return FileMetaAPI.ListUploadedFiles(req, initReq);
        });
    }

    async GetFile(req: GetFileRequest): Promise<GetFileResponse> {
        return this.executeAuthApiCall(async (initReq) => {
            return FileMetaAPI.GetFile(req, initReq);
        });
    }

    async checkByHashes(hashes: string[]): Promise<Map<string, string>> {
        return this.executeAuthApiCall(async (initReq) => {
            const resp = await FileMetaAPI.CheckFilesByHashes({ hashes }, initReq);
            const map = new Map<string, string>();
            (resp.found ?? []).forEach((f) => {
                if (f.hash && f.fileId) map.set(f.hash, f.fileId);
            });
            return map;
        });
    }
}

export const fileService = new FileService();
