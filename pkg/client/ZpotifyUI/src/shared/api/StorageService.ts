import { StorageAPI, StorageKind } from '@/app/api/zpotify';
import type { InitReq, StorageConfig, StorageInfo } from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';
import { ServiceError, WithTitle } from '@/shared/api/Errors.ts';
import type { StorageItem, StorageKindName } from '@/shared/model/Storage.ts';

const KIND_NAMES: Partial<Record<StorageKind, StorageKindName>> = {
    [StorageKind.STORAGE_KIND_LOCAL]: 'local',
    [StorageKind.STORAGE_KIND_S3]: 's3',
    [StorageKind.STORAGE_KIND_WEBDAV]: 'webdav',
    [StorageKind.STORAGE_KIND_GOOGLE_DRIVE]: 'google_drive',
};

function toStorageItem(info: StorageInfo): StorageItem {
    const kind = info.kind ? KIND_NAMES[info.kind] : undefined;
    if (!kind) {
        throw new ServiceError(WithTitle('unknown storage kind in response'));
    }

    return {
        id: info.id ?? '',
        name: info.name ?? '',
        kind,
        isDefault: info.isDefault ?? false,
        isConnected: info.isConnected ?? false,
        usedBytes: Number(info.usedBytes ?? 0),
        quotaBytes: info.quotaBytes ? Number(info.quotaBytes) : undefined,
        config: info.config,
    };
}

export default class StorageService extends BaseService {
    public async ListStorages(): Promise<StorageItem[]> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.ListStorages({}, initReq)).then((r) =>
            (r.storages ?? []).map(toStorageItem),
        );
    }

    public async CreateStorage(name: string, config: StorageConfig): Promise<StorageItem> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.CreateStorage({ name, config }, initReq)).then(
            (r) => {
                if (!r.storage) {
                    throw new ServiceError(WithTitle('empty storage in CreateStorage response'));
                }

                return toStorageItem(r.storage);
            },
        );
    }

    public async UpdateStorage(id: string, name: string, config: StorageConfig): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) =>
            StorageAPI.UpdateStorage({ id, name, config }, initReq),
        ).then();
    }

    public async DeleteStorage(id: string): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.DeleteStorage({ id }, initReq)).then();
    }

    public async SetDefaultStorage(id: string): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.SetDefaultStorage({ id }, initReq)).then();
    }

    public async TestStorage(id: string): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.TestStorage({ id }, initReq)).then();
    }

    public async StartGoogleDriveAuth(id: string): Promise<string> {
        return this.executeAuthApiCall((initReq: InitReq) => StorageAPI.StartGoogleDriveAuth({ id }, initReq)).then(
            (r) => {
                if (!r.consentUrl) {
                    throw new ServiceError(WithTitle('empty consent url in StartGoogleDriveAuth response'));
                }

                return r.consentUrl;
            },
        );
    }
}

export const storageService = new StorageService();
