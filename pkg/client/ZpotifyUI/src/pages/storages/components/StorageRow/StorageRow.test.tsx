import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import StorageRow from '@/pages/storages/components/StorageRow/StorageRow.tsx';
import type { StorageRowActions } from '@/pages/storages/components/StorageRow/StorageRow.tsx';
import type { StorageItem } from '@/shared/model/Storage.ts';

function renderRow(overrides: Partial<StorageItem>) {
    const actions: StorageRowActions = {
        onTest: vi.fn().mockResolvedValue(undefined),
        onSetDefault: vi.fn(),
        onEdit: vi.fn(),
        onConnectGoogle: vi.fn(),
        onDelete: vi.fn(),
    };
    const storage: StorageItem = {
        id: 'st-1',
        name: 'Main',
        kind: 's3',
        isDefault: false,
        isConnected: true,
        usedBytes: 1536,
        ...overrides,
    };

    render(
        <ul>
            <StorageRow storage={storage} actions={actions} />
        </ul>,
    );

    return { actions, storage };
}

describe('StorageRow', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows kind label and used bytes', () => {
        renderRow({});

        expect(screen.getByText('S3-compatible · 1.5 KB used')).not.toBeNull();
    });

    it('shows used of quota when a quota is present', () => {
        renderRow({ quotaBytes: 1024 * 1024 * 1024 });

        expect(screen.getByText('S3-compatible · 1.5 KB of 1 GB')).not.toBeNull();
    });

    it('hides edit and delete and disables set default for the default local storage', () => {
        renderRow({ kind: 'local', isDefault: true });

        expect(screen.getByText('Default')).not.toBeNull();
        expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
        expect((screen.getByRole('button', { name: 'Set default' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows the not connected badge and a Connect Google button for a disconnected drive', () => {
        const { actions, storage } = renderRow({ kind: 'google_drive', isConnected: false });

        expect(screen.getByText('Not connected')).not.toBeNull();
        expect((screen.getByRole('button', { name: 'Set default' }) as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));

        expect(actions.onConnectGoogle).toHaveBeenCalledWith(storage);
    });

    it('offers Reconnect for a connected drive', () => {
        renderRow({ kind: 'google_drive', isConnected: true });

        expect(screen.getByRole('button', { name: 'Reconnect' })).not.toBeNull();
    });

    it('calls delete with the storage when Delete is clicked', () => {
        const { actions, storage } = renderRow({});

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(actions.onDelete).toHaveBeenCalledWith(storage);
    });
});
