import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useTorrentFileSelection } from '@/dialogs/AddTrack/screens/useTorrentFileSelection.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';

const toasterCatch = vi.fn();
vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({ bake: vi.fn(), catch: toasterCatch }),
}));

vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: { GetTorrentFile: vi.fn() },
}));

describe('useTorrentFileSelection', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('polls every 2 seconds while resolving and stops once files arrive', async () => {
        vi.mocked(torrentService.GetTorrentFile)
            .mockResolvedValueOnce({ file: { id: 'm1', torrentName: 'dn', isResolving: true, files: [] } })
            .mockResolvedValueOnce({
                file: { id: 'm1', torrentName: 'dn', files: [{ path: 'a.mp3', supported: true }] },
            });

        const { result } = renderHook(() => useTorrentFileSelection('m1'));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(result.current.resolving).toBe(true);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2000);
        });

        expect(result.current.resolving).toBe(false);
        expect(result.current.entries).toHaveLength(1);
        expect(torrentService.GetTorrentFile).toHaveBeenCalledTimes(2);
    });

    it('exposes failed and reports the error when the request rejects', async () => {
        vi.mocked(torrentService.GetTorrentFile).mockRejectedValueOnce(new Error('504'));

        const { result } = renderHook(() => useTorrentFileSelection('m1'));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        expect(result.current.failed).toBe(true);
        expect(toasterCatch).toHaveBeenCalled();
    });

    it('stops polling after unmount', async () => {
        vi.mocked(torrentService.GetTorrentFile).mockResolvedValue({
            file: { id: 'm1', torrentName: 'dn', isResolving: true, files: [] },
        });

        const { unmount } = renderHook(() => useTorrentFileSelection('m1'));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        unmount();
        await vi.advanceTimersByTimeAsync(6000);

        expect(torrentService.GetTorrentFile).toHaveBeenCalledTimes(1);
    });
});
