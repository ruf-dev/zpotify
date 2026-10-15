import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import EditStorageDialog from '@/dialogs/EditStorage/EditStorageDialog.tsx';
import type { StorageItem } from '@/shared/model/Storage.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

const closeDialogMock = vi.fn();
vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({ OpenDialog: vi.fn(), CloseDialog: closeDialogMock }),
}));

const catchMock = vi.fn();
vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({ useToaster: vi.fn() }));

function renderDialog(storage?: StorageItem) {
    vi.mocked(useToaster).mockReturnValue({ catch: catchMock } as Partial<ReturnType<typeof useToaster>> as ReturnType<
        typeof useToaster
    >);
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<EditStorageDialog storage={storage} onSubmit={onSubmit} />);

    return { onSubmit };
}

function getSave(): HTMLButtonElement {
    return screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
}

function getField(label: string): HTMLInputElement {
    const input = screen.getByText(label, { selector: 'label' }).parentElement?.querySelector('input');
    if (!input) throw new Error(`no input for label ${label}`);

    return input;
}

function type(label: string, value: string) {
    fireEvent.change(getField(label), { target: { value } });
}

const S3_STORAGE: StorageItem = {
    id: 'st-1',
    name: 'Backup',
    kind: 's3',
    isDefault: false,
    isConnected: true,
    usedBytes: 0,
    config: {
        s3: { endpoint: 'https://s3.example.com', bucket: 'music', accessKeyId: 'ak', secretAccessKey: '' },
    },
};

const WEBDAV_STORAGE: StorageItem = {
    id: 'st-2',
    name: 'Dav',
    kind: 'webdav',
    isDefault: false,
    isConnected: true,
    usedBytes: 0,
    config: { webdav: { url: 'https://dav.example.com', username: 'user', password: '', rootPath: '/m' } },
};

const DRIVE_STORAGE: StorageItem = {
    id: 'st-3',
    name: 'Drive',
    kind: 'google_drive',
    isDefault: false,
    isConnected: true,
    usedBytes: 0,
    config: { googleDrive: { clientId: 'cid', clientSecret: '', rootFolderId: 'folder' } },
};

describe('EditStorageDialog', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('disables Save and shows the first missing field when the form is empty', () => {
        renderDialog();

        expect(getSave().disabled).toBe(true);
        expect(screen.getByText('Name is required')).not.toBeNull();
    });

    it('submits the trimmed name and an s3 config when the required fields are filled', async () => {
        const { onSubmit } = renderDialog();

        type('Name', '  Archive ');
        type('Endpoint', 'https://s3.example.com');
        type('Bucket', 'music');
        type('Access key id', 'key');
        type('Secret access key', 'secret');
        expect(getSave().disabled).toBe(false);

        fireEvent.click(getSave());

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        const [name, config] = onSubmit.mock.calls[0];
        expect(name).toBe('Archive');
        expect(config.s3.bucket).toBe('music');
        expect(config.webdav).toBeUndefined();
        await waitFor(() => expect(closeDialogMock).toHaveBeenCalled());
    });

    it('shows the edit title and keep-current placeholders when a storage is passed', () => {
        renderDialog(S3_STORAGE);

        expect(screen.getByText('Edit storage')).not.toBeNull();
        expect(getField('Secret access key').getAttribute('placeholder')).toBe('Leave empty to keep current');
    });

    it('prefills the non-secret s3 fields and leaves the secret empty when editing', () => {
        renderDialog(S3_STORAGE);

        expect(getField('Name').value).toBe('Backup');
        expect(getField('Endpoint').value).toBe('https://s3.example.com');
        expect(getField('Bucket').value).toBe('music');
        expect(getField('Access key id').value).toBe('ak');
        expect(getField('Secret access key').value).toBe('');
        expect(getSave().disabled).toBe(false);
    });

    it('prefills the webdav url and leaves the password empty when editing', () => {
        renderDialog(WEBDAV_STORAGE);

        expect(getField('URL').value).toBe('https://dav.example.com');
        expect(getField('Username').value).toBe('user');
        expect(getField('Root path').value).toBe('/m');
        expect(getField('Password').value).toBe('');
        expect(getField('Password').getAttribute('placeholder')).toBe('Leave empty to keep current');
    });

    it('prefills the google client id and leaves the client secret empty when editing', () => {
        renderDialog(DRIVE_STORAGE);

        expect(getField('Client id').value).toBe('cid');
        expect(getField('Root folder id').value).toBe('folder');
        expect(getField('Client secret').value).toBe('');
        expect(getField('Client secret').getAttribute('placeholder')).toBe('Leave empty to keep current');
    });

    it('routes a failed submit to the toaster and keeps the dialog open', async () => {
        const { onSubmit } = renderDialog(S3_STORAGE);
        const failure = new Error('boom');
        onSubmit.mockRejectedValueOnce(failure);

        type('Endpoint', 'https://s3.example.com');
        type('Bucket', 'music');
        fireEvent.click(getSave());

        await waitFor(() => expect(catchMock).toHaveBeenCalledWith(failure));
        expect(closeDialogMock).not.toHaveBeenCalled();
    });
});
