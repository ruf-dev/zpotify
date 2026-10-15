export type StorageKindName = 'local' | 's3' | 'webdav' | 'google_drive';

export type StorageItem = {
    id: string;
    name: string;
    kind: StorageKindName;
    isDefault: boolean;
    isConnected: boolean;
    usedBytes: number;
    quotaBytes?: number;
};

export const STORAGE_KIND_LABELS: Record<StorageKindName, string> = {
    local: 'Local disk',
    s3: 'S3-compatible',
    webdav: 'WebDAV',
    google_drive: 'Google Drive',
};
