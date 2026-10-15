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
