import type { StorageConfig } from '@/app/api/zpotify';
import type { StorageKindName } from '@/shared/model/Storage.ts';

export type StorageFormValues = {
    name: string;
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    isPathStyle: boolean;
    url: string;
    username: string;
    password: string;
    rootPath: string;
    clientId: string;
    clientSecret: string;
    rootFolderId: string;
};

export type StorageFormResult = {
    config: StorageConfig | null;
    errors: string[];
};

export const EMPTY_STORAGE_FORM: StorageFormValues = {
    name: '',
    endpoint: '',
    region: '',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    isPathStyle: false,
    url: '',
    username: '',
    password: '',
    rootPath: '',
    clientId: '',
    clientSecret: '',
    rootFolderId: '',
};

type RequiredField = { value: string; message: string };

function collectMissing(fields: RequiredField[]): string[] {
    return fields.filter((f) => f.value === '').map((f) => f.message);
}

function trimmed(values: StorageFormValues): StorageFormValues {
    return {
        ...values,
        name: values.name.trim(),
        endpoint: values.endpoint.trim(),
        region: values.region.trim(),
        bucket: values.bucket.trim(),
        accessKeyId: values.accessKeyId.trim(),
        secretAccessKey: values.secretAccessKey.trim(),
        url: values.url.trim(),
        username: values.username.trim(),
        password: values.password.trim(),
        rootPath: values.rootPath.trim(),
        clientId: values.clientId.trim(),
        clientSecret: values.clientSecret.trim(),
        rootFolderId: values.rootFolderId.trim(),
    };
}

function buildS3(v: StorageFormValues, isEdit: boolean): StorageFormResult {
    const errors = collectMissing([
        { value: v.endpoint, message: 'Endpoint is required' },
        { value: v.bucket, message: 'Bucket is required' },
        ...(isEdit
            ? []
            : [
                  { value: v.accessKeyId, message: 'Access key id is required' },
                  { value: v.secretAccessKey, message: 'Secret access key is required' },
              ]),
    ]);

    const config: StorageConfig = {
        s3: {
            endpoint: v.endpoint,
            region: v.region,
            bucket: v.bucket,
            accessKeyId: v.accessKeyId,
            secretAccessKey: v.secretAccessKey,
            isPathStyle: v.isPathStyle,
        },
    };

    return { config: errors.length === 0 ? config : null, errors };
}

function buildWebdav(v: StorageFormValues): StorageFormResult {
    const errors = collectMissing([{ value: v.url, message: 'URL is required' }]);

    const config: StorageConfig = {
        webdav: {
            url: v.url,
            username: v.username,
            password: v.password,
            rootPath: v.rootPath,
        },
    };

    return { config: errors.length === 0 ? config : null, errors };
}

function buildGoogleDrive(v: StorageFormValues, isEdit: boolean): StorageFormResult {
    const errors = collectMissing([
        { value: v.clientId, message: 'Client id is required' },
        ...(isEdit ? [] : [{ value: v.clientSecret, message: 'Client secret is required' }]),
    ]);

    const config: StorageConfig = {
        googleDrive: {
            clientId: v.clientId,
            clientSecret: v.clientSecret,
            rootFolderId: v.rootFolderId,
        },
    };

    return { config: errors.length === 0 ? config : null, errors };
}

export function validateStorageName(name: string): string[] {
    return collectMissing([{ value: name.trim(), message: 'Name is required' }]);
}

export function buildStorageConfig(
    kind: StorageKindName,
    values: StorageFormValues,
    isEdit: boolean,
): StorageFormResult {
    const v = trimmed(values);

    switch (kind) {
        case 's3':
            return buildS3(v, isEdit);
        case 'webdav':
            return buildWebdav(v);
        case 'google_drive':
            return buildGoogleDrive(v, isEdit);
        case 'local':
            return { config: null, errors: ['Local storage cannot be configured'] };
    }
}
