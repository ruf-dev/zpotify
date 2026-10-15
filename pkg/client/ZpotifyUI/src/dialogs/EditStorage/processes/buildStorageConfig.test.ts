import { describe, expect, it } from 'vitest';

import {
    buildStorageConfig,
    EMPTY_STORAGE_FORM,
    validateStorageName,
} from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';
import type { StorageFormValues } from '@/dialogs/EditStorage/processes/buildStorageConfig.ts';

function form(overrides: Partial<StorageFormValues>): StorageFormValues {
    return { ...EMPTY_STORAGE_FORM, ...overrides };
}

describe('buildStorageConfig', () => {
    it('populates only the s3 variant and trims whitespace when the kind is s3', () => {
        const result = buildStorageConfig(
            's3',
            form({
                endpoint: ' https://s3.example.com ',
                bucket: ' music ',
                accessKeyId: ' key ',
                secretAccessKey: ' secret ',
                url: 'ignored',
            }),
            false,
        );

        expect(result.errors).toEqual([]);
        expect(result.config).toEqual({
            s3: {
                endpoint: 'https://s3.example.com',
                region: '',
                bucket: 'music',
                accessKeyId: 'key',
                secretAccessKey: 'secret',
                isPathStyle: false,
            },
        });
        expect(result.config?.webdav).toBeUndefined();
        expect(result.config?.googleDrive).toBeUndefined();
    });

    it('reports every missing required s3 field on create', () => {
        const result = buildStorageConfig('s3', form({}), false);

        expect(result.config).toBeNull();
        expect(result.errors).toEqual([
            'Endpoint is required',
            'Bucket is required',
            'Access key id is required',
            'Secret access key is required',
        ]);
    });

    it('does not require s3 secrets on edit so the stored ones are kept', () => {
        const result = buildStorageConfig('s3', form({ endpoint: 'e', bucket: 'b' }), true);

        expect(result.errors).toEqual([]);
        expect(result.config?.s3?.secretAccessKey).toBe('');
    });

    it('populates only the webdav variant when the kind is webdav', () => {
        const result = buildStorageConfig(
            'webdav',
            form({ url: ' https://dav.example.com ', username: 'u', endpoint: 'ignored' }),
            false,
        );

        expect(result.config).toEqual({
            webdav: { url: 'https://dav.example.com', username: 'u', password: '', rootPath: '' },
        });
    });

    it('requires the webdav url', () => {
        const result = buildStorageConfig('webdav', form({}), false);

        expect(result.config).toBeNull();
        expect(result.errors).toEqual(['URL is required']);
    });

    it('requires the google client secret on create but not on edit', () => {
        const created = buildStorageConfig('google_drive', form({ clientId: 'id' }), false);
        const edited = buildStorageConfig('google_drive', form({ clientId: 'id' }), true);

        expect(created.errors).toEqual(['Client secret is required']);
        expect(edited.errors).toEqual([]);
        expect(edited.config).toEqual({ googleDrive: { clientId: 'id', clientSecret: '', rootFolderId: '' } });
    });

    it('rejects the local kind', () => {
        const result = buildStorageConfig('local', form({}), false);

        expect(result.config).toBeNull();
        expect(result.errors).toHaveLength(1);
    });
});

describe('validateStorageName', () => {
    it('reports a blank name', () => {
        expect(validateStorageName('   ')).toEqual(['Name is required']);
        expect(validateStorageName('Backup')).toEqual([]);
    });
});
