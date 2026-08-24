import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import type { SongFile } from '@/app/api/zpotify';
import { usePendingFiles } from '@/dialogs/AddTrack/screens/usePendingFiles.tsx';

const listUploadedFilesMock = vi.fn();
vi.mock('@/shared/api/FileService.ts', () => ({
    fileService: {
        ListUploadedFiles: (...args: unknown[]) => listUploadedFilesMock(...args),
        DeleteFile: vi.fn(),
        BatchDeleteFiles: vi.fn(),
    },
}));

vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({
        OpenDialog: vi.fn(),
        CloseDialog: vi.fn(),
    }),
}));

const toasterCatchSpy = vi.fn();
vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({
        catch: toasterCatchSpy,
    }),
}));

function makeFile(id: string): SongFile {
    return { id, path: `folder/${id}.mp3` } as SongFile;
}

describe('usePendingFiles', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('selects and deselects a folder group without disturbing other selections', async () => {
        const files = [makeFile('id1'), makeFile('id2'), makeFile('id3')];
        listUploadedFilesMock.mockResolvedValue({ files });

        const { result } = renderHook(() => usePendingFiles());

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.handleToggleSelect(makeFile('id3'), true);
        });

        expect(result.current.selectedIds.has('id3')).toBe(true);

        act(() => {
            result.current.handleToggleSelectFolder(['id1', 'id2'], true);
        });

        expect(Array.from(result.current.selectedIds).sort()).toEqual(['id1', 'id2', 'id3']);

        act(() => {
            result.current.handleToggleSelectFolder(['id1', 'id2'], false);
        });

        expect(Array.from(result.current.selectedIds)).toEqual(['id3']);
    });
});
